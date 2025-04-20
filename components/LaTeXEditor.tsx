"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import CodeMirror from '@uiw/react-codemirror';
import { StreamLanguage } from '@codemirror/language';
import { stex } from '@codemirror/legacy-modes/mode/stex';
import { materialDark } from '@uiw/codemirror-theme-material';
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
import { jsPDF } from "jspdf";
import io from "socket.io-client";
import type { Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

// Ensure API URL ends with a trailing slash
const API_URL =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api").replace(
    /\/$/,
    ""
  ) + "/";

// Socket URL for collaborative editing
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

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
  const resumeTemplate = `\\documentclass[a4paper,11pt]{article}
\\usepackage{fontawesome}
\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[pdftex]{hyperref}
\\usepackage{fancyhdr}
\\pagestyle{fancy}
\\fancyhf{} % clear all header and footer fields
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}
% Adjust margins
\\addtolength{\\oddsidemargin}{-0.530in}
\\addtolength{\\evensidemargin}{-0.375in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.45in}
\\addtolength{\\textheight}{1in}
\\urlstyle{rm}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}
% Sections formatting
\\titleformat{\\section}{
  \\vspace{-10pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-6pt}]
%-------------------------
% Custom commands
% Custom command for experience with hyperlink without bullet points
\\newcommand{\\experienceSubheading}[5]{
  \\vspace{-1pt}
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textbf{\\href{#1}{#2}} & #3 \\\\
      \\textit{#4} & \\textit{#5} \\\\
    \\end{tabular*}\\vspace{-5pt}
}
\\newcommand{\\resumeItem}[2]{
  \\item\\small{
    \\textbf{#1}{: #2 \\vspace{-2pt}}
  }
}
\\newcommand{\\resumeItemWithoutTitle}[1]{
  \\item\\small{
    {\\vspace{-2pt}}
  }
}
\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-1pt}\\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{#3} & \\textit{#4} \\\\
    \\end{tabular*}\\vspace{-5pt}
}
\\newcommand{\\resumeSubItem}[2]{\\resumeItem{#1}{#2}\\vspace{-3pt}}
\\renewcommand{\\labelitemii}{$\\circ$}
\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=*]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}
%-----------------------------
%%%%%%  CV STARTS HERE  %%%%%%
\\begin{document}
% In the preamble, add:
%----------HEADING-----------------
\\begin{center}
  \\textbf{{\\LARGE YOUR FULL NAME}} % Replace with your name
\\end{center}
\\vspace{4pt} % spacing adjustment
\\begin{center}
\\small % compact & consistent
\\href{mailto:your.email@example.com}{your.email@example.com} \\quad $\\vert$ \\quad
+XX-XXXXXXXXXX \\quad $\\vert$ \\quad % Replace with your phone number
\\href{https://github.com/yourusername}{github.com/yourusername} \\quad $\\vert$ \\quad % Replace with your GitHub
\\href{https://www.linkedin.com/in/yourprofile/}{linkedin.com/in/yourprofile} % Replace with your LinkedIn
\\end{center}
 
%-----------Skills-----------------
	    
\\section{Skills Summary}
\\begin{tabular}{ l l }
\\textbf{Front-end:} & ~HTML5, CSS3, JavaScript (ES6+), React.js, [Other front-end skills] \\\\ % Add your front-end skills
\\textbf{Back-end:} & ~Node.js, Express.js, [Other back-end skills] \\\\ % Add your back-end skills
\\textbf{Dev Tools:} & ~Git, GitHub, [Other development tools] \\\\ % Add your development tools
\\textbf{Soft Skills:} & ~[List your soft skills] \\\\ % Add your soft skills
\\textbf{Tech Tools:} & ~[List additional technical tools] \\\\ % Add your tech tools
\\end{tabular}
%-----------Experience-----------------
\\section{Experience}
\\experienceSubheading
  {https://www.linkedin.com/in/yourprofile/}{Company Name}{} % Replace with company URL and name
  {Your Position}{Month Year – Month Year | Location} % Replace with your job title, dates, and location
\\resumeSubHeadingListStart
\\begin{itemize}
    \\item [Achievement 1: Describe what you accomplished with specific metrics if possible] % Replace with your first achievement
    \\item [Achievement 2: Use \\textbf{bold text} to highlight key skills or technologies] % Replace with your second achievement
    \\item [Achievement 3: Quantify your impact with percentages when possible] % Replace with your third achievement
    \\item [Achievement 4: Focus on results and outcomes rather than just responsibilities] % Replace with your fourth achievement
    \\item [Achievement 5: Keep each bullet point concise but informative] % Replace with your fifth achievement
    
\\end{itemize}
\\resumeSubHeadingListEnd
\\vspace{2pt}
\\resumeSubHeadingListEnd
%-----------PROJECTS-----------------
\\vspace{-5pt}
\\section{Projects}
\\resumeSubHeadingListStart
\\resumeSubItem {\\href{https://github.com/yourusername/project1}{Project Name 1} }\\hfill \\textit{Technology 1, Technology 2, Technology 3} \\\\ % Replace with your project URL, name and technologies used
\\begin{itemize}
    \\item [Describe what you built and its purpose] % Replace with project description
    \\item [Highlight a technical challenge you solved] % Replace with technical challenge
    \\item [Mention performance improvements or optimizations] % Replace with performance details
    \\item [Include any recognition or positive feedback received] % Replace with recognition details
    \\item [Describe a key feature you implemented] % Replace with key feature implementation
\\end{itemize}}
\\vspace{2pt}
\\resumeSubItem{\\href{https://github.com/yourusername/project2}{Project Name 2} }\\hfill \\textit{Technology 1, Technology 2, Technology 3} % Replace with your project URL, name and technologies used
\\begin{itemize}
    \\item [Describe what you built and its purpose] % Replace with project description
    \\item [Mention integrations with external services or APIs] % Replace with integration details
    \\item [Highlight UI/UX improvements and their impact] % Replace with UI/UX details
    \\item [Include metrics that demonstrate the project's success] % Replace with success metrics
\\end{itemize}}
\\vspace{2pt}
\\resumeSubHeadingListEnd
\\vspace{-5pt}
%-----------EDUCATION-----------------
\\section{Education}
  \\resumeSubHeadingListStart
    \\resumeSubheading
      {University/College Name}{Location} % Replace with your university/college name and location
      {Degree - Major}{Month Year - Month Year or "present"} % Replace with your degree, major and dates
    \\resumeSubHeadingListEnd
    \\resumeSubHeadingListStart
    \\resumeSubheading
      {High School Name}{Location} % Replace with your high school name and location
      {Senior Secondary| Board; Percentage\\%}{Year - Year} % Replace with your senior secondary details
    \\resumeSubHeadingListEnd
     \\resumeSubHeadingListStart
    \\resumeSubheading
      {School Name}{Location} % Replace with your school name and location
      {Secondary| Board; Percentage\\%}{Year - Year} % Replace with your secondary education details
      \\vspace{2pt}
    \\resumeSubHeadingListEnd
    
%-----------Awards& Certificates-----------------
\\section{Certificates}
\\begin{description}[font=$\\bullet$]
\\item {\\href{certificate-url}{Certificate Name – Issuing Organization} % Replace with your certificate URL, name and issuer
\\vspace{-5pt}
\\item {\\href{certificate-url}{Certificate Name – Issuing Organization} % Replace with additional certificate details
\\end{description}
\\vspace{-5pt}
\\section{Volunteer Experience}
  \\begin{description}[font=$\\bullet$]
\\item {Position in Organization (Date/Duration)} % Replace with volunteer position and organization
\\vspace{-5pt}
\\item {Position in Organization (Date/Duration)} % Replace with additional volunteer experience
\\vspace{-5pt}
\\item {Position in Organization (Date/Duration)} % Replace with additional volunteer experience
\\end{description}
    \\end{document}`;

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

  // Create or join a collaboration room
  const handleCollaboration = () => {
    if (!isCollaborating) {
      // Generate a new room ID if not provided
      const newRoomId = roomId || uuidv4().substring(0, 8);
      setRoomId(newRoomId);
      setIsCollaborating(true);
      
      // Copy room ID to clipboard
      navigator.clipboard.writeText(newRoomId)
        .then(() => addNotification("success", "Room ID copied to clipboard. Share it with collaborators!"));
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
              head: endIndex
            },
            scrollIntoView: true
          });
        }
        
        setActiveSectionId(sectionId);
      }
    }
  };

  // Set the initial template on component mount
  useEffect(() => {
    // This ensures the template is loaded on initial render
    setCode(resumeTemplate);
  }, []);

  // Create a client-side PDF (fallback when server is not available)
  const createClientSidePdf = () => {
    try {
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
          else if (!line.startsWith(" ") && !line.startsWith("•") && line.length < 40) {
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
  const handleEditorChange = useCallback((value: string) => {
    setCode(value);
    
    // Emit code change to other users if collaborating
    if (isCollaborating && socketRef.current) {
      socketRef.current.emit("code-change", { roomId, code: value });
    }
  }, [isCollaborating, roomId]);

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

  // Function to compile LaTeX using server-side API
  const compileLatex = async () => {
    setIsCompiling(true);
    setError(null);

    try {
      // Try to use the server API first
      const response = await fetch(`${API_URL}compile-latex`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ latex: code }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Set preview URL returned from server
      setPreviewUrl(`${API_URL}preview/${data.pdfFilename}`);
      setUseClientSidePdf(false);
      addNotification("success", "LaTeX compiled successfully!");
    } catch (err) {
      console.error("LaTeX compilation error:", err);

      // If server-side compilation fails, use client-side fallback
      addNotification(
        "info",
        "Server compilation failed. Using client-side rendering instead."
      );
      setUseClientSidePdf(true);
      createClientSidePdf();
    } finally {
      setIsCompiling(false);
    }
  };

  // Function to download PDF
  const downloadPdf = async () => {
    try {
      setIsCompiling(true);

      if (useClientSidePdf) {
        // Client-side PDF generation
        const pdfDataUri = createClientSidePdf();
        if (pdfDataUri) {
          // Create a link to download the PDF and click it
          const a = document.createElement("a");
          a.href = pdfDataUri;
          a.download = "resume.pdf";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          addNotification("success", "PDF downloaded successfully!");
        }
      } else {
        // Server-side PDF generation
        try {
          const response = await fetch(`${API_URL}download-pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ latex: code }),
      });

      if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
      }

      // Create a blob from the PDF content
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

      // Fallback to client-side PDF generation
      addNotification(
        "info",
        "Server download failed. Using client-side generation instead."
      );
      setUseClientSidePdf(true);
      const pdfDataUri = createClientSidePdf();
      if (pdfDataUri) {
        const a = document.createElement("a");
        a.href = pdfDataUri;
        a.download = "resume.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        addNotification(
          "success",
          "PDF downloaded successfully using client-side generation!"
        );
      }
    } finally {
      setIsCompiling(false);
    }
  };
  
  // Function to copy LaTeX code to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code)
      .then(() => addNotification("success", "LaTeX code copied to clipboard"));
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
                {activeUsers} active user{activeUsers !== 1 ? 's' : ''}
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
                  <div 
                    className="flex-1 overflow-hidden" 
                    ref={editorRef}
                  >
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
                      className="h-full text-base"
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
                  </div>
                  <div className="flex-1 bg-white overflow-hidden">
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
                        <pre className="whitespace-pre-wrap text-sm font-mono bg-red-100/50 p-3 rounded">{error}</pre>
                      </div>
                    ) : previewUrl ? (
                      <iframe
                        src={previewUrl}
                        className="w-full h-full"
                        title="PDF Preview"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <FaFileAlt className="w-12 h-12 mb-4 text-gray-400 opacity-50" />
                        <p className="text-center font-medium">Click "Compile" to preview</p>
                        <p className="text-sm text-gray-400 mt-1">Your resume will appear here</p>
                      </div>
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
                  className={`min-w-[150px] px-4 ${isCompiling ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {isCompiling ? "Compiling..." : "Compile LaTeX"}
                </Button>
                <Button
                  color="lime"
                  size="sm"
                  onClick={downloadPdf}
                  disabled={isCompiling}
                  icon={<FaDownload />}
                  className={`min-w-[150px] px-4 ${isCompiling ? "opacity-70 cursor-not-allowed" : ""}`}
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