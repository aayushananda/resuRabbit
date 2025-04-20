"use client";
import React, { useState, useEffect, useRef } from 'react';
import { basicSetup } from 'codemirror';
import { EditorView, keymap } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { indentWithTab } from '@codemirror/commands';
import { StreamLanguage } from '@codemirror/language';
import { stex } from '@codemirror/legacy-modes/mode/stex';
import ResumeTemplates from './ResumeTemplates';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Notification types
type NotificationType = 'success' | 'error' | 'info';

interface Notification {
  type: NotificationType;
  message: string;
  id: number;
}

const LaTeXEditor = () => {
  const resumeTemplate = `\\documentclass[a4paper,20pt]{article}
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
	    
\\section*{Skills Summary}
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
  const [editorView, setEditorView] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [error, setError] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationCounter, setNotificationCounter] = useState(0);
  
  const editorRef = useRef(null);
  
  // Add notification function
  const addNotification = (type: NotificationType, message: string) => {
    const id = notificationCounter;
    setNotificationCounter(prev => prev + 1);
    
    setNotifications(prev => [...prev, { type, message, id }]);
    
    // Auto remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, 5000);
  };
  
  // Function to remove notification
  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };
  
  useEffect(() => {
    if (editorRef.current && !editorView) {
      const startState = EditorState.create({
        doc: code,
        extensions: [
          basicSetup,
          keymap.of([indentWithTab]),
          StreamLanguage.define(stex),
          EditorView.updateListener.of(update => {
            if (update.docChanged) {
              setCode(update.state.doc.toString());
            }
          }),
          EditorView.theme({
            "&": {
              height: "100%",
              width: "100%", // Ensure full width
              border: "1px solid #ddd",
              fontSize: "14px",
              overflow: "auto" // Add overflow auto to prevent overflow
            }
          })
        ]
      });
      
      const view = new EditorView({
        state: startState, 
        parent: editorRef.current
      });
      
      setEditorView(view);
    }
    
    return () => {
      if (editorView) {
        editorView.destroy();
      }
    };
  }, [code, editorView]);
  
  // Function to handle template selection
  const handleSelectTemplate = (templateCode) => {
    if (editorView) {
      const transaction = editorView.state.update({
        changes: {
          from: 0,
          to: editorView.state.doc.length,
          insert: templateCode
        }
      });
      editorView.dispatch(transaction);
      setCode(templateCode);
    }
    setShowTemplates(false);
    addNotification('success', 'Template loaded successfully!');
  };
  
  // Function to compile LaTeX using server-side API
  const compileLatex = async () => {
    setIsCompiling(true);
    setError(null);
    
    try {
      // Send LaTeX code to server for compilation
      const response = await fetch(`${API_URL}/compile-latex`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latex: code }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server returned ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Set preview URL returned from server
      setPreviewUrl(`${API_URL}/preview/${data.pdfFilename}`);
      addNotification('success', 'LaTeX compiled successfully!');
    } catch (err) {
      console.error('LaTeX compilation error:', err);
      const errorMsg = `Error compiling LaTeX: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMsg);
      addNotification('error', errorMsg);
    } finally {
      setIsCompiling(false);
    }
  };
  
  // Function to download PDF
  const downloadPdf = async () => {
    try {
      setIsCompiling(true);
      addNotification('info', 'Preparing PDF for download...');
      
      const response = await fetch(`${API_URL}/download-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latex: code }),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || `Server returned ${response.status}`);
      }
      
      // Create a blob from the PDF content
      const blob = await response.blob();
      
      // Create a link to download the PDF and click it
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'resume.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      addNotification('success', 'PDF downloaded successfully!');
    } catch (err) {
      console.error('PDF download error:', err);
      const errorMsg = `Error downloading PDF: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMsg);
      addNotification('error', errorMsg);
    } finally {
      setIsCompiling(false);
    }
  };
  
  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-full w-full">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
              notification.type === 'success' ? 'bg-green-100 text-green-800 border-l-4 border-green-500' : 
              notification.type === 'error' ? 'bg-red-100 text-red-800 border-l-4 border-red-500' : 
              'bg-blue-100 text-blue-800 border-l-4 border-blue-500'
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
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">LaTeX Resume Editor for ResuRabbit</h1>
      <NotificationSystem />
      
      {showTemplates ? (
        <ResumeTemplates onSelectTemplate={handleSelectTemplate} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Editor Section - Left */}
          <div className="flex flex-col h-[650px]">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">Edit LaTeX</h2>
              <button 
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                onClick={() => setShowTemplates(true)}
              >
                Choose Template
              </button>
            </div>
            <div className="flex-1 overflow-hidden" ref={editorRef}></div>
          </div>
          
          {/* Preview Section - Right */}
          <div className="flex flex-col h-[650px]">
            <h2 className="text-xl font-semibold mb-2">
              Preview
            </h2>
            <div className="flex-1 border rounded overflow-hidden bg-gray-50">
              {isCompiling ? (
                <div className="flex items-center justify-center h-full w-full">
                  <LoadingSpinner />
                  <span className="ml-3 text-gray-600">Compiling LaTeX...</span>
                </div>
              ) : error ? (
                <div className="bg-red-100 text-red-700 p-4 h-full overflow-auto">
                  <p className="font-bold mb-2">Compilation Error:</p>
                  <pre className="whitespace-pre-wrap">{error}</pre>
                </div>
              ) : previewUrl ? (
                <iframe 
                  src={previewUrl} 
                  className="w-full h-full"
                  title="PDF Preview" 
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <p>Click "Compile LaTeX" to see preview</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="flex gap-4 mt-4">
        <button 
          className="flex items-center justify-center bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400 min-w-[140px]"
          onClick={compileLatex}
          disabled={isCompiling}
        >
          {isCompiling ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              Compiling...
            </>
          ) : 'Compile LaTeX'}
        </button>
        <button 
          className="flex items-center justify-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 min-w-[140px]"
          onClick={downloadPdf}
          disabled={isCompiling}
        >
          {isCompiling ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : 'Download PDF'}
        </button>
      </div>
    </div>
  );
};

export default LaTeXEditor;