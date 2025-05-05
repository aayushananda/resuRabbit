"use client";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import CodeMirror from "@uiw/react-codemirror";
import { StreamLanguage } from "@codemirror/language";
import { stex } from "@codemirror/legacy-modes/mode/stex";
import { materialDark } from "@uiw/codemirror-theme-material";
import ResumeTemplates from "./ResumeTemplates";
import { Button } from "./Button";
import {
  FaFileAlt,
  FaDownload,
  FaCode,
  FaEye,
  FaChevronRight,
  FaChevronLeft,
  FaShare,
  FaUsers,
  FaCopy,
} from "react-icons/fa";
import { IoMdDocument } from "react-icons/io";
import io from "socket.io-client";
import type { Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { renderToString } from "react-dom/server";
import KaTeX from "katex";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import remarkMath from "remark-math";
import html2canvas from "html2canvas";
import { debounce } from "lodash";
import dynamic from "next/dynamic";

// Use dynamic imports for react-pdf components
const PDFViewer = dynamic(() => import("../components/PDFViewer"), {
  ssr: false, // This component will only be rendered on client-side
  loading: () => (
    <div className="flex items-center justify-center h-full w-full">
      <span className="ml-4 text-gray-600 font-medium">
        Loading PDF viewer...
      </span>
    </div>
  ),
});

// Ensure API URL ends with a trailing slash
const API_URL =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api").replace(
    /\/$/,
    ""
  ) + "/";

// Socket URL for collaborative editing
const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

// Notification types
type NotificationType = "success" | "error" | "info";

interface Notification {
  type: NotificationType;
  message: string;
  id: number;
}

// Define LaTeX section for the dashboard
interface LatexSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  regex: RegExp;
}

const LaTeXEditor = () => {
  const resumeTemplate = `\\documentclass[a4paper,10pt]{article}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}

%----------FONT----------
\\usepackage[T1]{fontenc}
\\usepackage{tgpagella}

%----------PAGE SETUP----------
\\pagestyle{fancy}
\\fancyhf{} % clear all header and footer fields
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

%----------CUSTOM COMMANDS----------
\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeSubheading}[4]{
  \\item
    \\textbf{#1} \\hfill {\\small #2} \\\\
    \\textit{\\small#3} \\hfill {\\small #4}
}
\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}}

%----------START DOCUMENT----------
\\begin{document}

%----------NAME & CONTACT----------
\\begin{center}
  {\\LARGE \\textbf{Aayush Anand}} \\\\ \\vspace{1pt}
  \\href{mailto:aayush@example.com}{aayush@example.com} $|$
  +91-9876543210 $|$
  \\href{https://github.com/aayushanand}{github.com/aayushanand} $|$
  \\href{https://linkedin.com/in/aayushanand}{linkedin.com/in/aayushanand}
\\end{center}

%----------SKILLS----------
\\section*{Skills Summary}
\\begin{itemize}[leftmargin=0.15in, label={}]
  \\item \\textbf{Front-end:} HTML5, CSS3, JavaScript (ES6+), React.js, Tailwind CSS
  \\item \\textbf{Back-end:} Node.js, Express.js, MongoDB
  \\item \\textbf{Dev Tools:} Git, GitHub, VS Code, Postman
  \\item \\textbf{Soft Skills:} Team collaboration, Time management, Problem-solving
  \\item \\textbf{Tech Tools:} Figma, Netlify, Firebase
\\end{itemize}

%----------EXPERIENCE----------
\\section*{Experience}
\\resumeSubHeadingListStart

\\resumeSubheading
  {CodeVerse Technologies}{Jun 2024 – Sep 2024}
  {Web Development Intern}{Remote}
  \\resumeItemListStart
    \\resumeItem{Built responsive UI for the company dashboard using React and Tailwind CSS}
    \\resumeItem{Integrated RESTful APIs with Axios to fetch and display user data}
    \\resumeItem{Participated in daily stand-ups and weekly sprint reviews}
  \\resumeItemListEnd

\\resumeSubheading
  {Open Source Project - ResuRabbit}{Jan 2025 – Present}
  {Full Stack Developer}{Personal Project}
  \\resumeItemListStart
    \\resumeItem{Built a LaTeX-based resume builder with real-time preview using React and CodeMirror}
    \\resumeItem{Implemented secure backend with Express.js and sandboxed LaTeX compilation}
    \\resumeItem{Optimized resume templates for ATS and clean typography}
  \\resumeItemListEnd

\\resumeSubHeadingListEnd

%----------END DOCUMENT----------
\\end{document}
`;

  const [code, setCode] = useState(resumeTemplate);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationCounter, setNotificationCounter] = useState(0);
  const [showDashboard, setShowDashboard] = useState(true);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [useClientSidePdf, setUseClientSidePdf] = useState(false);

  // Collaboration state
  const [roomId, setRoomId] = useState<string>("");
  const [isCollaborating, setIsCollaborating] = useState<boolean>(false);
  const [activeUsers, setActiveUsers] = useState<number>(1);

  // Socket reference
  const socketRef = useRef<Socket | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const cmRef = useRef<any>(null);

  // Define LaTeX sections for the dashboard
  const latexSections: LatexSection[] = [
    {
      id: "header",
      title: "Header",
      icon: <IoMdDocument />,
      regex: /\\begin{center}[\s\S]*?\\end{center}/g,
    },
    {
      id: "skills",
      title: "Skills",
      icon: <FaCode />,
      regex: /\\section{Skills[\s\S]*?\\end{tabular}/g,
    },
    {
      id: "experience",
      title: "Experience",
      icon: <FaFileAlt />,
      regex:
        /\\section{Experience}[\s\S]*?\\resumeSubHeadingListEnd\\s*\\vspace{2pt}/g,
    },
    {
      id: "projects",
      title: "Projects",
      icon: <FaFileAlt />,
      regex:
        /\\section{Projects}[\s\S]*?\\resumeSubHeadingListEnd\\s*\\vspace{-5pt}/g,
    },
    {
      id: "education",
      title: "Education",
      icon: <FaFileAlt />,
      regex: /\\section{Education}[\s\S]*?\\resumeSubHeadingListEnd/g,
    },
    {
      id: "certificates",
      title: "Certificates",
      icon: <FaFileAlt />,
      regex: /\\section{Certificates}[\s\S]*?\\end{description}/g,
    },
    {
      id: "volunteer",
      title: "Volunteer",
      icon: <FaFileAlt />,
      regex: /\\section{Volunteer Experience}[\s\S]*?\\end{description}/g,
    },
  ];

  // Add notification function
  const addNotification = (type: NotificationType, message: string) => {
    const id = notificationCounter;
    setNotificationCounter((prev) => prev + 1);

    setNotifications((prev) => [...prev, { type, message, id }]);

    // Auto remove notification after 5 seconds
    setTimeout(() => {
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== id)
      );
    }, 5000);
  };

  // Function to remove notification
  const removeNotification = (id: number) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  // Initialize socket connection for collaboration
  useEffect(() => {
    if (isCollaborating && roomId) {
      // Initialize Socket.IO connection
      socketRef.current = io(SOCKET_URL);

      // Join room
      socketRef.current.emit("join-room", roomId);

      // Listen for code updates from other users
      socketRef.current.on("code-update", (data: { code: string }) => {
        // Update the code state
        setCode(data.code);
      });

      // Listen for user count updates
      socketRef.current.on("user-count", (count: number) => {
        setActiveUsers(count);
      });

      // Notify user
      addNotification("info", `Connected to room: ${roomId}`);

      // Clean up on unmount or when disconnecting
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [isCollaborating, roomId]);

<<<<<<< Updated upstream
=======
  // Function to handle leaving a collaboration room
  const leaveCollaborationRoom = async () => {
    if (isCollaborating && roomId) {
      try {
        // Call the API to leave the room
        const response = await fetch("/api/collaboration/leave", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ roomId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to leave room");
        }

        // Disconnect socket
        if (socketRef.current) {
          socketRef.current.disconnect();
        }

        // Reset collaboration state
        setIsCollaborating(false);
        setActiveUsers(1);
        addNotification("success", "Successfully left collaboration room");
      } catch (error) {
        console.error("Error leaving room:", error);
        addNotification(
          "error",
          `Failed to leave room: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }
  };

>>>>>>> Stashed changes
  // Create or join a collaboration room
  const handleCollaboration = () => {
    if (!isCollaborating) {
      // Generate a new room ID if not provided
      const newRoomId = roomId || uuidv4().substring(0, 8);
      setRoomId(newRoomId);
      setIsCollaborating(true);

      // Copy room ID to clipboard
      navigator.clipboard
        .writeText(newRoomId)
        .then(() =>
          addNotification(
            "success",
            "Room ID copied to clipboard. Share it with collaborators!"
          )
        );
    } else {
      // Disconnect from room
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      setIsCollaborating(false);
      setActiveUsers(1);
      addNotification("info", "Disconnected from collaboration room");
    }
  };

  // Join an existing room
  const joinRoom = () => {
    const enteredRoomId = prompt("Enter room ID to collaborate:");
    if (enteredRoomId) {
      setRoomId(enteredRoomId);
      setIsCollaborating(true);
    }
  };

  // Function to navigate to section in the editor
  const navigateToSection = (sectionId: string) => {
    const section = latexSections.find((s) => s.id === sectionId);
    if (!section || !cmRef.current) return;

    const match = code.match(section.regex);

    if (match && match[0]) {
      const startIndex = code.indexOf(match[0]);
      if (startIndex >= 0) {
        const endIndex = startIndex + match[0].length;

        // Use the CodeMirror instance directly from the ref
        if (cmRef.current) {
          // Get line and character positions for selection
          const doc = cmRef.current.view.state.doc;
          const startPos = doc.lineAt(startIndex);
          const endPos = doc.lineAt(endIndex);

          // Set the selection in the editor
          cmRef.current.view.dispatch({
            selection: {
              anchor: startIndex,
              head: endIndex,
            },
            scrollIntoView: true,
          });
        }

        setActiveSectionId(sectionId);
      }
    }
  };

  // Create a client-side PDF (fallback when server is not available)
  const createClientSidePdf = async () => {
    try {
      // Dynamically import jsPDF only on the client side
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();

      // Enhanced LaTeX to PDF conversion
      const lines = code
        .split("\n")
        .filter(
          (line) =>
            !line.startsWith("\\documentclass") &&
            !line.startsWith("\\usepackage") &&
            !line.startsWith("\\pagestyle") &&
            !line.startsWith("\\fancyhf") &&
            !line.startsWith("\\fancyfoot") &&
            !line.startsWith("\\renewcommand") &&
            !line.startsWith("\\addtolength") &&
            !line.startsWith("\\setlength") &&
            !line.startsWith("\\newcommand") &&
            !line.startsWith("\\titleformat") &&
            !line.startsWith("%") &&
            line.trim() !== ""
        )
        .map((line) => {
          // More comprehensive LaTeX replacement patterns
          return line
            .replace(/\\textbf{([^}]*)}/g, "$1") // Bold text
            .replace(/\\textit{([^}]*)}/g, "$1") // Italic text
            .replace(/\\href{[^}]*}{([^}]*)}/g, "$1") // Links
            .replace(/\\LARGE/g, "") // Font size
            .replace(/\\large/g, "")
            .replace(/\\small/g, "")
            .replace(/\$\\vert\$/g, "|") // Vertical bar symbol
            .replace(/\\item\s*\[(.*?)\]/g, "• $1") // Bullet points with content
            .replace(/\\item/g, "• ") // Regular bullet points
            .replace(/\\begin{.*}/g, "") // Environment begins
            .replace(/\\end{.*}/g, "") // Environment ends
            .replace(/\\section{([^}]*)}/g, "$1") // Section headers
            .replace(/\\subsection{([^}]*)}/g, "  $1") // Subsection headers
            .replace(/\\vspace{[^}]*}/g, "") // Vertical space
            .replace(/\\hfill/g, "    ") // Horizontal fill
            .replace(/{/g, "") // Remove braces
            .replace(/}/g, "")
            .replace(/\\\\/g, "") // Remove line breaks
            .replace(/\\quad/g, "  ") // Space
            .trim();
        });

      // Add content to PDF with better formatting
      let y = 20;
      let currentFontSize = 10;
      lines.forEach((line) => {
        if (line.trim() !== "") {
          // Set larger font for headings (detected by lack of indentation and ending with colon)
          if (line.includes("YOUR FULL NAME")) {
            doc.setFontSize(18);
            doc.text("YOUR FULL NAME", 105, y, { align: "center" });
            doc.setFontSize(10);
            currentFontSize = 10;
          }
          // Handle section headers (they typically start at the beginning of the line with no spaces)
          else if (
            !line.startsWith(" ") &&
            !line.startsWith("•") &&
            line.length < 40
          ) {
            doc.setFontSize(14);
            doc.text(line, 10, y);
            currentFontSize = 14;

            // Add underline for section headers
            doc.line(10, y + 1, 200, y + 1);
          }
          // Handle contact info line
          else if (line.includes("@") && line.includes("|")) {
            doc.setFontSize(10);
            doc.text(line, 105, y, { align: "center" });
            currentFontSize = 10;
          }
          // Regular content
          else {
            if (currentFontSize !== 10) {
              doc.setFontSize(10);
              currentFontSize = 10;
            }

            // Create a new page when reaching the bottom margin
            if (y > 280) {
              doc.addPage();
              y = 20;
            }

            // Indent bullet points
            if (line.startsWith("•")) {
              doc.text(line, 15, y);
            } else {
              doc.text(line, 10, y);
            }
          }

          // Add more space after section headers
          if (currentFontSize > 10) {
            y += 10;
          } else {
            y += 7;
          }
        }
      });

      // Generate a URL for the PDF
      const pdfDataUri = doc.output("datauristring");
      setPreviewUrl(pdfDataUri);
      addNotification(
        "success",
        "Client-side PDF preview generated. For better results, please run the LaTeX server."
      );
      return pdfDataUri;
    } catch (err) {
      console.error("Error generating client-side PDF:", err);
      setError("Failed to generate client-side PDF preview.");
      addNotification("error", "Failed to generate PDF preview.");
      return null;
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      // Ensure socket is disconnected
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [previewUrl]);

  // Function to handle code changes
  const handleEditorChange = useCallback(
    (value: string) => {
      setCode(value);

      // Emit code change to other users if collaborating
      if (isCollaborating && socketRef.current) {
        socketRef.current.emit("code-change", { roomId, code: value });
      }
    },
    [isCollaborating, roomId]
  );

  // Function to handle template selection
  const handleSelectTemplate = (templateCode: string) => {
    setCode(templateCode);

    // Send update to collaborators if in a room
    if (isCollaborating && socketRef.current) {
      socketRef.current.emit("code-change", { roomId, code: templateCode });
    }

    setShowTemplates(false);
    addNotification("success", "Template loaded successfully!");
  };

  // After the state declarations, add these new states
  const [numPages, setNumPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [htmlPreview, setHtmlPreview] = useState<string | null>(null);
  const [isLatexValid, setIsLatexValid] = useState<boolean>(true);
  const [compilationMethod, setCompilationMethod] = useState<
    "server" | "mathjax" | "katex" | "pdf.js"
  >("server");
  const [errorLineNumber, setErrorLineNumber] = useState<number | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Create a debounced version of the compilation function
  const debouncedCompile = useMemo(
    () =>
      debounce((latexCode: string) => {
        if (compilationMethod === "katex" || compilationMethod === "mathjax") {
          compileWithClientSide(latexCode);
        } else {
          compileLatex();
        }
      }, 1000),
    [compilationMethod]
  );

  // Auto-compile when code changes
  useEffect(() => {
    if (code.trim()) {
      debouncedCompile(code);
    }

    // Validate LaTeX syntax (basic validation)
    try {
      const errorMatch =
        /\\[a-zA-Z]+/.test(code) && !code.includes("\\begin{document}");
      setIsLatexValid(!errorMatch);
    } catch (e) {
      setIsLatexValid(true); // Default to valid if checking fails
    }

    return () => {
      debouncedCompile.cancel();
    };
  }, [code, debouncedCompile]);

  // Add this new function for client-side compilation
  const compileWithClientSide = async (latexCode: string) => {
    setIsCompiling(true);
    setError(null);

    try {
      if (compilationMethod === "katex") {
        // Extract the main content from LaTeX (between begin and end document)
        const contentMatch = latexCode.match(
          /\\begin{document}([\s\S]*?)\\end{document}/
        );
        if (!contentMatch) {
          throw new Error("Could not find document content");
        }

        const content = contentMatch[1];

        // Process each section separately to handle LaTeX structure
        const sections = content
          .split(/\\section\*?{([^}]+)}/g)
          .filter(Boolean);
        let processedHtml = "";

        for (let i = 0; i < sections.length; i += 2) {
          const sectionTitle = sections[i];
          const sectionContent = sections[i + 1] || "";

          // Use KaTeX to render mathematical expressions
          try {
            processedHtml += `<h2>${sectionTitle}</h2>`;

            // Process LaTeX environments (like itemize)
            const contentWithLists = sectionContent
              .replace(
                /\\begin{itemize}([\s\S]*?)\\end{itemize}/g,
                "<ul>$1</ul>"
              )
              .replace(/\\item\s*([^\\]*)/g, "<li>$1</li>")
              .replace(/\\textbf{([^}]*)}/g, "<strong>$1</strong>")
              .replace(/\\textit{([^}]*)}/g, "<em>$1</em>")
              .replace(/\\href{([^}]*)}{([^}]*)}/g, '<a href="$1">$2</a>')
              .replace(/\\\\/g, "<br/>");

            processedHtml += contentWithLists;
          } catch (err) {
            console.error("KaTeX rendering error:", err);
            processedHtml += `<div class="text-red-500">Error rendering section: ${sectionTitle}</div>`;
          }
        }

        // Final HTML with styling
        const htmlOutput = `
          <div class="latex-preview" style="font-family: 'Latin Modern Roman', serif; padding: 2rem; max-width: 800px; margin: 0 auto; line-height: 1.5;">
            ${processedHtml}
          </div>
        `;

        setHtmlPreview(htmlOutput);

        // Generate PDF preview from HTML using html2canvas
        if (previewRef.current) {
          setTimeout(async () => {
            try {
              const canvas = await html2canvas(previewRef.current!, {
                scale: 2,
                useCORS: true,
                logging: false,
              });

              // Convert to PDF
              const imgData = canvas.toDataURL("image/png");
              const pdf = new jsPDF("p", "mm", "a4");
              const pdfWidth = pdf.internal.pageSize.getWidth();
              const pdfHeight = pdf.internal.pageSize.getHeight();
              const ratio = canvas.width / canvas.height;
              const imgWidth = pdfWidth;
              const imgHeight = pdfWidth / ratio;

              pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
              const pdfDataUri = pdf.output("datauristring");
              setPreviewUrl(pdfDataUri);

              addNotification("success", "Preview generated with KaTeX");
            } catch (err) {
              console.error("PDF generation error:", err);
              throw err;
            } finally {
              setIsCompiling(false);
            }
          }, 100);
        }
      } else if (compilationMethod === "mathjax") {
        // Similar to KaTeX but using unified/remark for more complex LaTeX processing
        try {
          // Extract content between document tags
          const contentMatch = latexCode.match(
            /\\begin{document}([\s\S]*?)\\end{document}/
          );
          if (!contentMatch) {
            throw new Error("Could not find document content");
          }

          // Process the LaTeX content to convert to HTML
          const content = contentMatch[1]
            .replace(/\\section\*?{([^}]+)}/g, "## $1\n\n")
            .replace(/\\begin{itemize}/g, "")
            .replace(/\\end{itemize}/g, "")
            .replace(/\\item\s*/g, "- ")
            .replace(/\\textbf{([^}]*)}/g, "**$1**")
            .replace(/\\textit{([^}]*)}/g, "*$1*")
            .replace(/\\href{([^}]*)}{([^}]*)}/g, "[$2]($1)")
            .replace(/\\\\/g, "\n");

          // Use unified/remark to process the content with math expressions
          const result = await unified()
            .use(remarkParse)
            .use(remarkMath)
            .use(remarkRehype)
            .use(rehypeKatex)
            .use(rehypeStringify)
            .process(content);

          // Final styled HTML
          const htmlOutput = `
            <div class="latex-preview" style="font-family: 'Latin Modern Roman', serif; padding: 2rem; max-width: 800px; margin: 0 auto; line-height: 1.5;">
              ${String(result)}
            </div>
          `;

          setHtmlPreview(htmlOutput);

          // Generate PDF using the same html2canvas method as above
          if (previewRef.current) {
            setTimeout(async () => {
              try {
                const canvas = await html2canvas(previewRef.current!, {
                  scale: 2,
                  useCORS: true,
                  logging: false,
                });

                const imgData = canvas.toDataURL("image/png");
                const pdf = new jsPDF("p", "mm", "a4");
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const ratio = canvas.width / canvas.height;
                const imgWidth = pdfWidth;
                const imgHeight = pdfWidth / ratio;

                pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
                const pdfDataUri = pdf.output("datauristring");
                setPreviewUrl(pdfDataUri);

                addNotification(
                  "success",
                  "Preview generated with remark-math"
                );
              } catch (err) {
                console.error("PDF generation error:", err);
                throw err;
              } finally {
                setIsCompiling(false);
              }
            }, 100);
          }
        } catch (err) {
          console.error("Processing error:", err);
          setError(
            `Error processing LaTeX: ${
              err instanceof Error ? err.message : "Unknown error"
            }`
          );
          setIsCompiling(false);
        }
      }
    } catch (err) {
      console.error("Client-side compilation error:", err);
      setError(
        `Client-side compilation failed: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
      setIsCompiling(false);

      // Fallback to server-side
      addNotification("info", "Client-side rendering failed. Trying server...");
      compileLatex();
    }
  };

  // Update the compileLatex function to use our new advanced-latex endpoint
  const compileLatex = async () => {
    setIsCompiling(true);
    setError(null);

    // If using client-side methods, use the appropriate function
    if (compilationMethod === "katex" || compilationMethod === "mathjax") {
      compileWithClientSide(code);
      return;
    }

    try {
      // First make sure the temp directory exists by making a test request
      try {
        await fetch("/api/view-pdf?file=test.pdf").catch(() => {
          console.log("View PDF endpoint appears to be working");
        });
      } catch (err) {
        console.log("Initial endpoint check error, proceeding anyway:", err);
      }

      // Use our advanced LaTeX endpoint with better capabilities
      const response = await fetch("/api/advanced-latex", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latex: code,
          engine: "pdflatex", // Can be extended to allow xelatex, lualatex options
          options: {
            timeout: 30000, // 30 seconds timeout
            passes: 2, // Multiple passes for references
            highQuality: true, // Better quality output
            paperSize: "a4", // A4 paper size
            margins: {
              // Custom margins
              top: "1cm",
              right: "1cm",
              bottom: "1cm",
              left: "1cm",
            },
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        let errorMessage = `Server returned ${response.status}`;

        if (errorData?.error) {
          errorMessage = errorData.error;

          // Extract line number from error if available
          const lineMatch = errorMessage.match(/line (\d+)/i);
          if (lineMatch && lineMatch[1]) {
            setErrorLineNumber(parseInt(lineMatch[1], 10));

            // Highlight the error line in editor
            if (cmRef.current) {
              const linePos = cmRef.current.view.state.doc.line(
                parseInt(lineMatch[1], 10)
              ).from;
              cmRef.current.view.dispatch({
                selection: { anchor: linePos, head: linePos },
                scrollIntoView: true,
              });
            }
          }

          // If pdflatex is not installed, try Overleaf compilation service
          if (
            errorData.notInstalled ||
            errorMessage.includes("not installed")
          ) {
            try {
              addNotification(
                "info",
                "LaTeX is not installed locally. Trying Overleaf's compilation service..."
              );

              // Try the Overleaf compilation service
              const overleafResponse = await fetch("/api/overleaf-compile", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  latex: code,
                  engine: "pdflatex",
                  options: {
                    timeout: 30000,
                    paperSize: "a4",
                    margins: {
                      top: "1cm",
                      right: "1cm",
                      bottom: "1cm",
                      left: "1cm",
                    },
                  },
                }),
              });

              if (!overleafResponse.ok) {
                throw new Error("Overleaf compilation failed");
              }

              const overleafData = await overleafResponse.json();

              // Clear PDF cache in service worker
              if (
                navigator.serviceWorker &&
                navigator.serviceWorker.controller
              ) {
                navigator.serviceWorker.controller.postMessage({
                  type: "CLEAR_PDF_CACHE",
                });
              }

              setPreviewUrl(overleafData.previewUrl);
              setUseClientSidePdf(false);
              setErrorLineNumber(null);
              addNotification(
                "success",
                `LaTeX compiled successfully using ${overleafData.source} service!`
              );
              setIsCompiling(false);
              return;
            } catch (overleafError) {
              console.error("Overleaf compilation error:", overleafError);
              throw new Error(
                "All server-side compilation methods failed. Using client-side rendering instead."
              );
            }
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Handle additional source information
      if (data.source) {
        addNotification("info", `PDF compiled using ${data.source} service`);
      }

      // Clear PDF cache in service worker
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "CLEAR_PDF_CACHE",
        });
      }

      // If using pdf.js for rendering
      if (compilationMethod === "pdf.js") {
        // Set preview URL for PDF.js renderer
        setPreviewUrl(data.previewUrl);
      } else {
        // Standard iframe preview
        setPreviewUrl(data.previewUrl);
      }

      setUseClientSidePdf(false);
      setErrorLineNumber(null);
      addNotification("success", "LaTeX compiled successfully!");
    } catch (err) {
      console.error("LaTeX compilation error:", err);
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setError(`${errorMsg}`);

      // Check specifically for "pdflatex not found" error
      if (
        errorMsg.includes("pdflatex: not found") ||
        errorMsg.includes("not installed") ||
        errorMsg.includes("Command failed")
      ) {
        addNotification(
          "error",
          "LaTeX compiler (pdflatex) is not installed on the server. Using client-side rendering instead."
        );

        // Automatically switch to client-side rendering if pdflatex is not available
        setCompilationMethod("katex");
        addNotification(
          "info",
          "Switched to client-side rendering using KaTeX. For better results, please install LaTeX on your server."
        );

        // Start client-side compilation immediately
        compileWithClientSide(code);
      } else if (
        errorMsg.includes("timeout") ||
        errorMsg.includes("ECONNREFUSED") ||
        errorMsg.includes("404") ||
        errorMsg.includes("Server returned 404")
      ) {
        addNotification(
          "error",
          "Server connection failed or API endpoint not found. Using client-side fallback."
        );
        // Switch to client-side rendering if server is down or endpoint not found
        setCompilationMethod("katex");
        compileWithClientSide(code);
      } else {
        addNotification("error", `Compilation error: ${errorMsg}`);

        // Fallback to client-side rendering
        setUseClientSidePdf(true);
        createClientSidePdf();
      }
    } finally {
      setIsCompiling(false);
    }
  };

  // Add these utility functions for the enhanced preview component
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const changePage = (offset: number) => {
    setCurrentPage((prevPage) => {
      const newPage = prevPage + offset;
      return Math.min(Math.max(1, newPage), numPages);
    });
  };

  const zoomIn = () => setScale((prevScale) => Math.min(prevScale + 0.2, 2.5));
  const zoomOut = () => setScale((prevScale) => Math.max(prevScale - 0.2, 0.5));

  // Add the missing copyToClipboard function
  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        addNotification("success", "LaTeX code copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
        addNotification("error", "Failed to copy code to clipboard");
      });
  };

  // Replace the existing downloadPdf function with this optimized version
  const downloadPdf = async () => {
    try {
      setIsCompiling(true);

      // For client-side methods, generate PDF directly
      if (compilationMethod === "katex" || compilationMethod === "mathjax") {
        if (previewRef.current) {
          // Dynamically import required modules
          const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
            import("html2canvas"),
            import("jspdf"),
          ]);

          const canvas = await html2canvas(previewRef.current, {
            scale: 2,
            useCORS: true,
            logging: false,
          });

          const pdf = new jsPDF("p", "mm", "a4");
          const imgData = canvas.toDataURL("image/png");
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const ratio = canvas.width / canvas.height;
          const imgWidth = pdfWidth;
          const imgHeight = pdfWidth / ratio;

          pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

          pdf.save("resume.pdf");
          addNotification(
            "success",
            "PDF downloaded using client-side rendering"
          );
        } else {
          throw new Error("Preview not available");
        }
      } else if (useClientSidePdf) {
        // Client-side PDF generation using existing function
        const pdfDataUri = await createClientSidePdf();
        if (pdfDataUri) {
          const a = document.createElement("a");
          a.href = pdfDataUri;
          a.download = "resume.pdf";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          addNotification("success", "PDF downloaded successfully!");
        }
      } else {
        // Advanced server-side PDF generation with more options
        try {
          const response = await fetch(`/api/download-pdf`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              latex: code,
              engine: "pdflatex",
              options: {
                highQuality: true,
                paperSize: "a4",
                margins: {
                  top: "1cm",
                  right: "1cm",
                  bottom: "1cm",
                  left: "1cm",
                },
              },
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(
              errorData?.error || `Server returned ${response.status}`
            );
          }

          // Handle the downloaded PDF
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "resume.pdf";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          addNotification("success", "PDF downloaded successfully!");
        } catch (err) {
          throw err;
        }
      }
    } catch (err) {
      console.error("PDF download error:", err);
      addNotification(
        "error",
        `Download failed: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );

      // Multiple fallback mechanisms
      try {
        addNotification("info", "Trying alternative download method...");

        if (compilationMethod !== "katex" && compilationMethod !== "mathjax") {
          setCompilationMethod("katex");
          await compileWithClientSide(code);
        }

        const pdfDataUri = await createClientSidePdf();
        if (pdfDataUri) {
          const a = document.createElement("a");
          a.href = pdfDataUri;
          a.download = "resume.pdf";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          addNotification("success", "PDF downloaded using fallback method");
        } else {
          throw new Error("Fallback download failed");
        }
      } catch (fallbackErr) {
        console.error("All download methods failed:", fallbackErr);
        addNotification(
          "error",
          "All download methods failed. Please try again later."
        );
      }
    } finally {
      setIsCompiling(false);
    }
  };

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center">
      <div className="relative w-12 h-12">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
    </div>
  );

  // Notification component
  const NotificationSystem = () => {
    if (notifications.length === 0) return null;

    return (
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`flex items-center justify-between p-3 rounded shadow-lg min-w-[300px] max-w-md ${
              notification.type === "success"
                ? "bg-green-100 text-green-800 border-l-4 border-green-500"
                : notification.type === "error"
                ? "bg-red-100 text-red-800 border-l-4 border-red-500"
                : "bg-blue-100 text-blue-800 border-l-4 border-blue-500"
            } transition-all duration-300 ease-in-out`}
          >
            <div className="flex-1">
              <p className="font-medium">{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-4 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    );
  };

  // Function to toggle dashboard
  const toggleDashboard = () => {
    setShowDashboard(!showDashboard);
  };

  // Add this directly after the imports to load KaTeX CSS dynamically
  // This will be called when the component mounts
  const loadKaTeXCSS = () => {
    if (typeof window !== "undefined") {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css";
      link.integrity =
        "sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV";
      link.crossOrigin = "anonymous";
      document.head.appendChild(link);
    }
  };

  // In the LaTeXEditor component, add this useEffect to load KaTeX CSS
  // Inside the component, right after the state declarations, add:
  useEffect(() => {
    loadKaTeXCSS();
  }, []);

  return (
    <div className="bg-gradient-to-br from-purple-100 via-[#C599E599]/40 to-purple-100 h-screen flex flex-col overflow-hidden">
      <div className="container mx-auto px-4 py-3 flex flex-col h-full overflow-hidden">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
            LaTeX Resume Editor for ResuRabbit
          </h1>

          {/* Collaboration controls */}
          <div className="flex items-center gap-3">
            {isCollaborating && (
              <div className="flex items-center text-purple-700 bg-purple-100 px-3 py-1 rounded-full text-sm border border-purple-200 shadow-sm mr-1">
                <FaUsers className="mr-2" />
                {activeUsers} active user{activeUsers !== 1 ? "s" : ""}
              </div>
            )}

            <Button
              color="purple"
              size="sm"
              onClick={handleCollaboration}
              icon={<FaShare />}
              className="shadow-sm hover:shadow transition-all mx-0 px-3"
            >
              {isCollaborating ? "Leave Room" : "Collaborate"}
            </Button>

            {!isCollaborating && (
              <Button
                color="lime"
                size="sm"
                onClick={joinRoom}
                icon={<FaUsers />}
                className="shadow-sm hover:shadow transition-all mx-0 px-3 ml-2"
              >
                Join Room
              </Button>
            )}
          </div>
        </div>

        <NotificationSystem />

        {showTemplates ? (
          <div className="flex-1 overflow-auto">
            <ResumeTemplates onSelectTemplate={handleSelectTemplate} />
          </div>
        ) : (
          <div className="flex flex-1 relative overflow-hidden rounded-xl shadow-lg bg-white/50 backdrop-blur-sm">
            {/* Dashboard toggle button (visible on mobile) */}
            <button
              onClick={toggleDashboard}
              className="md:hidden absolute -left-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-r-lg shadow-md z-10"
            >
              {showDashboard ? <FaChevronLeft /> : <FaChevronRight />}
            </button>

            {/* Dashboard - Left */}
            {showDashboard && (
              <div className="w-48 md:w-52 shrink-0 bg-white/80 rounded-l-xl shadow-sm mr-1 border-r border-gray-100 flex flex-col h-full">
                <div className="p-3 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-purple-800">
                    Resume Sections
                  </h2>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                  <ul className="space-y-1">
                    {latexSections.map((section) => (
                      <li key={section.id}>
                        <button
                          onClick={() => navigateToSection(section.id)}
                          className={`flex items-center w-full p-2 rounded-lg transition-all duration-200 text-sm ${
                            activeSectionId === section.id
                              ? "bg-purple-100 text-purple-700 shadow-sm"
                              : "hover:bg-gray-50 text-gray-700 hover:text-purple-700"
                          }`}
                        >
                          <span className="mr-2 text-base">{section.icon}</span>
                          <span className="font-medium">{section.title}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Main content grid */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-2 p-2 overflow-hidden">
                {/* Editor Section - Left */}
                <div className="flex flex-col bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 h-full">
                  <div className="flex justify-between items-center p-2 border-b bg-gray-50">
                    <h2 className="text-base font-semibold text-gray-800 flex items-center">
                      <FaCode className="mr-2 text-purple-600" />
                      Edit LaTeX
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={copyToClipboard}
                        className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-700"
                        title="Copy LaTeX Code"
                      >
                        <FaCopy />
                      </button>
                      <Button
                        color="purple"
                        size="sm"
                        onClick={() => setShowTemplates(true)}
                        iconName="resume"
                        className="shadow-sm mx-0"
                      >
                        Templates
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-hidden" ref={editorRef}>
                    <CodeMirror
                      value={code}
                      height="100%"
                      onChange={handleEditorChange}
                      theme={materialDark}
                      basicSetup={{
                        lineNumbers: true,
                        highlightActiveLine: true,
                        highlightSelectionMatches: true,
                        autocompletion: true,
                        foldGutter: true,
                        indentOnInput: true,
                      }}
                      extensions={[StreamLanguage.define(stex)]}
                      ref={cmRef as any}
                      style={{ height: "100%", fontSize: "14px" }}
                    />
                  </div>
                </div>

                {/* Preview Section - Right */}
                <div className="flex flex-col bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 h-full">
                  <div className="flex justify-between items-center p-2 border-b bg-gray-50">
                    <h2 className="text-base font-semibold text-gray-800 flex items-center">
                      <FaFileAlt className="mr-2 text-purple-600" />
                      PDF Preview
                    </h2>
                    <div className="flex items-center gap-2">
                      <select
                        className="text-sm border border-gray-200 rounded px-2 py-1 bg-white"
                        value={compilationMethod}
                        onChange={(e) =>
                          setCompilationMethod(e.target.value as any)
                        }
                      >
                        <option value="server">Server (pdfLaTeX)</option>
                        <option value="katex">KaTeX (Client)</option>
                        <option value="mathjax">MathJax/Remark (Client)</option>
                        <option value="pdf.js">PDF.js Renderer</option>
                      </select>

                      {compilationMethod === "pdf.js" && previewUrl && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => changePage(-1)}
                            disabled={currentPage <= 1}
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded disabled:text-gray-300"
                          >
                            &lt;
                          </button>
                          <span className="text-xs text-gray-600">
                            {currentPage} / {numPages}
                          </span>
                          <button
                            onClick={() => changePage(1)}
                            disabled={currentPage >= numPages}
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded disabled:text-gray-300"
                          >
                            &gt;
                          </button>
                          <button
                            onClick={zoomOut}
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                          >
                            -
                          </button>
                          <span className="text-xs text-gray-600">
                            {Math.round(scale * 100)}%
                          </span>
                          <button
                            onClick={zoomIn}
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 bg-white overflow-auto">
                    {isCompiling ? (
                      <div className="flex items-center justify-center h-full w-full">
                        <LoadingSpinner />
                        <span className="ml-4 text-gray-600 font-medium">
                          Compiling LaTeX...
                        </span>
                      </div>
                    ) : error ? (
                      <div className="bg-red-50 text-red-700 p-4 h-full overflow-auto">
                        <p className="font-bold mb-2">Compilation Error:</p>
                        <pre className="whitespace-pre-wrap text-sm font-mono bg-red-100/50 p-3 rounded">
                          {error}
                          {errorLineNumber && (
                            <div className="mt-2 text-sm">
                              Error at line:{" "}
                              <span className="font-bold">
                                {errorLineNumber}
                              </span>
                              <button
                                className="ml-2 text-blue-600 underline"
                                onClick={() => {
                                  if (cmRef.current && errorLineNumber) {
                                    const linePos =
                                      cmRef.current.view.state.doc.line(
                                        errorLineNumber
                                      ).from;
                                    cmRef.current.view.dispatch({
                                      selection: {
                                        anchor: linePos,
                                        head: linePos,
                                      },
                                      scrollIntoView: true,
                                    });
                                  }
                                }}
                              >
                                Go to line
                              </button>
                            </div>
                          )}
                        </pre>
                      </div>
                    ) : (
                      <>
                        {/* HTML Preview for client-side rendering methods */}
                        {(compilationMethod === "katex" ||
                          compilationMethod === "mathjax") &&
                          htmlPreview && (
                            <div
                              ref={previewRef}
                              className="w-full h-full p-4 overflow-auto bg-white shadow-inner"
                              dangerouslySetInnerHTML={{ __html: htmlPreview }}
                            />
                          )}

                        {/* PDF.js Renderer */}
                        {compilationMethod === "pdf.js" && previewUrl && (
                          <div className="flex justify-center p-2 bg-gray-100 h-full">
                            <PDFViewer
                              file={previewUrl}
                              onDocumentLoadSuccess={onDocumentLoadSuccess}
                              currentPage={currentPage}
                              scale={scale}
                              numPages={numPages}
                              changePage={changePage}
                              zoomIn={zoomIn}
                              zoomOut={zoomOut}
                            />
                          </div>
                        )}

                        {/* Standard iframe preview for server-side rendering */}
                        {compilationMethod === "server" && previewUrl && (
                          <iframe
                            src={previewUrl}
                            className="w-full h-full"
                            title="PDF Preview"
                          />
                        )}

                        {/* Empty state */}
                        {!previewUrl && !htmlPreview && (
                          <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <FaFileAlt className="w-12 h-12 mb-4 text-gray-400 opacity-50" />
                            <p className="text-center font-medium">
                              Click "Compile" to preview
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                              Your resume will appear here
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons properly aligned below the grid */}
              <div className="flex justify-center items-center py-4 px-4 gap-6 border-t border-gray-200 bg-white/70 rounded-b-xl mt-1">
                <Button
                  color="purple"
                  size="sm"
                  onClick={compileLatex}
                  disabled={isCompiling}
                  iconName="view"
                  className={`min-w-[150px] px-4 ${
                    isCompiling ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isCompiling ? "Compiling..." : "Compile LaTeX"}
                </Button>
                <Button
                  color="lime"
                  size="sm"
                  onClick={downloadPdf}
                  disabled={isCompiling}
                  icon={<FaDownload />}
                  className={`min-w-[150px] px-4 ${
                    isCompiling ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isCompiling ? "Processing..." : "Download PDF"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LaTeXEditor;
