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
import { io, Socket } from "socket.io-client";
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

  // Add notification function - memoized with useCallback
  const addNotification = useCallback((type: NotificationType, message: string) => {
    const id = notificationCounter;
    setNotificationCounter((prev) => prev + 1);
    setNotifications((prev) => [...prev, { type, message, id }]);
    
    // Auto remove notification after 5 seconds
    setTimeout(() => {
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== id)
      );
    }, 5000);
  }, [notificationCounter]);

  // Function to remove notification - memoized with useCallback
  const removeNotification = useCallback((id: number) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  }, []);

  // Initialize socket connection for collaboration
  useEffect(() => {
    if (isCollaborating && roomId) {
      // Cleanup previous connection if it exists
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      
      // Initialize Socket.IO connection
      socketRef.current = io(SOCKET_URL, {
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
      
      // Join room
      socketRef.current.emit("join-room", roomId);
      
      // Listen for code updates from other users
      socketRef.current.on("code-update", (data: { code: string }) => {
        // Update the code state if it's different
        setCode((prevCode) => {
          if (prevCode !== data.code) {
            return data.code;
          }
          return prevCode;
        });
      });
      
      // Listen for user count updates
      socketRef.current.on("user-count", (count: number) => {
        setActiveUsers(count);
      });

      // Handle reconnection
      socketRef.current.on("reconnect", () => {
        // Rejoin room on reconnection
        socketRef.current?.emit("join-room", roomId);
        addNotification("info", "Reconnected to collaboration room");
      });

      // Handle disconnection
      socketRef.current.on("disconnect", () => {
        addNotification("error", "Disconnected from collaboration server");
      });
      
      // Notify user
      addNotification("info", `Connected to room: ${roomId}`);
      
      // Clean up on unmount or when disconnecting
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    }
  }, [isCollaborating, roomId, addNotification]);

  // Create or join a collaboration room
  const handleCollaboration = useCallback(() => {
    if (!isCollaborating) {
      // Generate a new room ID if not provided
      const newRoomId = roomId || uuidv4().substring(0, 8);
      setRoomId(newRoomId);
      setIsCollaborating(true);
      
      // Copy room ID to clipboard
      navigator.clipboard.writeText(newRoomId)
        .then(() => addNotification("success", "Room ID copied to clipboard. Share it with collaborators!"))
        .catch(() => addNotification("error", "Failed to copy room ID to clipboard"));
    } else {
      // Disconnect from room
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsCollaborating(false);
      setActiveUsers(1);
      addNotification("info", "Disconnected from collaboration room");
    }
  }, [isCollaborating, roomId, addNotification]);

  // Join an existing room
  const joinRoom = useCallback(() => {
    const enteredRoomId = prompt("Enter room ID to collaborate:");
    if (enteredRoomId && enteredRoomId.trim()) {
      setRoomId(enteredRoomId.trim());
      setIsCollaborating(true);
    }
  }, []);

  // Function to navigate to section in the editor - improved with better editor integration
  const navigateToSection = useCallback((sectionId: string) => {
    const section = latexSections.find((s) => s.id === sectionId);
    if (!section) return;
    
    const match = code.match(section.regex);
    if (match && match[0]) {
      const startIndex = code.indexOf(match[0]);
      if (startIndex >= 0) {
        const endIndex = startIndex + match[0].length;
        
        // Set the active section
        setActiveSectionId(sectionId);
        
        // Focus the editor
        if (editorRef.current) {
          editorRef.current.focus();
          
          // If we have a reference to the CodeMirror instance
          // Scroll the editor to the section (this is a placeholder - actual implementation would depend on CodeMirror version)
          if (cmRef.current?.view) {
            // This is a simplified version - in a real app you would need to calculate the line number
            const lines = code.substring(0, startIndex).split('\n').length;
            // This is for illustration - actual implementation depends on the CodeMirror version
            // cmRef.current.view.dispatch({ effects: EditorView.scrollIntoView(lines) });
          }
        }
      }
    }
  }, [code, latexSections]);

  // Create a client-side PDF (fallback when server is not available)
  const createClientSidePdf = useCallback(() => {
    try {
      const doc = new jsPDF();
      // Simple conversion of LaTeX to PDF (very basic)
      const lines = code
        .split("\n")
        .filter(
          (line) =>
            !line.startsWith("\\") &&
            !line.startsWith("%") &&
            line.trim() !== ""
        )
        .map((line) =>
          line
            .replace(/\\textbf{([^}]*)}/g, "$1")
            .replace(/\\textit{([^}]*)}/g, "$1")
            .replace(/\\href{[^}]*}{([^}]*)}/g, "$1")
            .replace(/\\LARGE/g, "")
            .replace(/\\small/g, "")
            .replace(/\$\\vert\$/g, "|")
            .replace(/\\item/g, "- ")
            .replace(/\\begin{.*}/g, "")
            .replace(/\\end{.*}/g, "")
            .replace(/{/g, "")
            .replace(/}/g, "")
            .replace(/\\\\/g, "")
            .trim()
        );
      
      // Add content to PDF
      let y = 20;
      lines.forEach((line) => {
        if (line.trim() !== "") {
          if (line.includes("YOUR FULL NAME")) {
            doc.setFontSize(16);
            doc.text("YOUR FULL NAME", 105, y, { align: "center" });
            doc.setFontSize(10);
          } else {
            if (y > 280) {
              doc.addPage();
              y = 20;
            }
            
            // Limit line length to prevent overflow
            if (line.length > 100) {
              const words = line.split(' ');
              let currentLine = '';
              
              words.forEach(word => {
                if ((currentLine + ' ' + word).length <= 100) {
                  currentLine += (currentLine ? ' ' : '') + word;
                } else {
                  doc.text(currentLine, 10, y);
                  y += 7;
                  currentLine = word;
                }
              });
              
              if (currentLine) {
                doc.text(currentLine, 10, y);
              }
            } else {
              doc.text(line, 10, y);
            }
          }
          y += 7;
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
  }, [code, addNotification]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      
      // Ensure socket is disconnected
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [previewUrl]);

  // Function to handle code changes - memoized with useCallback
  const handleEditorChange = useCallback((value: string) => {
    setCode(value);
    
    // Emit code change to other users if collaborating
    if (isCollaborating && socketRef.current?.connected) {
      // Debounce to avoid too frequent updates - can further optimize with useDebounce hook
      const timeoutId = setTimeout(() => {
        socketRef.current?.emit("code-change", { roomId, code: value });
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isCollaborating, roomId]);

  // Function to handle template selection - memoized with useCallback
  const handleSelectTemplate = useCallback((templateCode: string) => {
    setCode(templateCode);
    
    // Send update to collaborators if in a room
    if (isCollaborating && socketRef.current?.connected) {
      socketRef.current.emit("code-change", { roomId, code: templateCode });
    }
    
    setShowTemplates(false);
    addNotification("success", "Template loaded successfully!");
  }, [isCollaborating, roomId, addNotification]);

  // Function to compile LaTeX using server-side API - memoized with useCallback
  const compileLatex = useCallback(async () => {
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
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
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
  }, [code, addNotification, createClientSidePdf]);

  // Function to download PDF - memoized with useCallback
  const downloadPdf = useCallback(async () => {
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
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
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
  }, [useClientSidePdf, createClientSidePdf, code, addNotification]);
  
  // Function to copy LaTeX code to clipboard - memoized with useCallback
  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(code)
      .then(() => addNotification("success", "LaTeX code copied to clipboard"))
      .catch(() => addNotification("error", "Failed to copy code to clipboard"));
  }, [code, addNotification]);

  // Toggle dashboard function - memoized with useCallback
  const toggleDashboard = useCallback(() => {
    setShowDashboard(prev => !prev);
  }, []);

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-full w-full">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
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
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-[#C599E599]/40 h-screen flex flex-col">
      <div className="container mx-auto px-4 py-4 flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-