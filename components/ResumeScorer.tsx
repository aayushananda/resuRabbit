"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { Button } from "./Button";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

const ResumeScorer = () => {
  const [resumeText, setResumeText] = useState("");
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const calculateATSScore = (text: string) => {
    setIsLoading(true);
    const wordCount = text.split(" ").length;
    const hasKeywords = (keyword: string) =>
      text.toLowerCase().includes(keyword.toLowerCase());

    let score = 0;
    const analysisResults = [];

    if (wordCount > 100) score += 20;
    if (hasKeywords("experience")) {
      score += 20;
      analysisResults.push('✓ Contains "experience" keyword');
    }
    if (hasKeywords("skills")) {
      score += 20;
      analysisResults.push('✓ Contains "skills" keyword');
    }
    if (hasKeywords("education")) {
      score += 20;
      analysisResults.push('✓ Contains "education" keyword');
    }
    if (text.length > 500) score += 20;

    setTimeout(() => {
      setAtsScore(Math.min(score, 100));
      setAnalysis(analysisResults);
      setIsLoading(false);
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (resumeText.trim()) {
      setErrorMessage("");
      calculateATSScore(resumeText);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setFileName(file.name);
      setIsLoading(true);
      setErrorMessage("");
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        let fullText = "";

        console.log(`PDF loaded with ${pdf.numPages} pages`);

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str || "")
            .join(" ");
          fullText += pageText + " ";
          console.log(`Page ${i} text:`, pageText);
        }

        if (!fullText.trim()) {
          throw new Error("No readable text found in the PDF.");
        }

        setResumeText(fullText.trim());
        setIsLoading(false);
      } catch (error: any) {
        console.error("Detailed error parsing PDF:", error);
        setIsLoading(false);
        setErrorMessage(
          `Failed to parse PDF: ${error.message}. Please ensure the PDF contains selectable text and try again, or paste the text manually.`
        );
        setResumeText("");
      }
    } else {
      setErrorMessage("Please upload a valid PDF file.");
    }
  };

  return (
    <div className="w-3/4 p-6 rounded-xl shadow-2xl text-gray-100 shadow-[#6300B3]/50">
      <h2 className="text-3xl font-bold text-black mb-6">ATS Resume Scorer</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-black/80">
            Upload PDF or Paste Resume
          </label>

          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer hover:bg-gray-100 transition-all">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-8 h-8 mb-3 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 0113 5a5 5 0 014.9 4.097A4 4 0 0117 16H7z"
                  ></path>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 13v6m-3-3l3-3 3 3"
                  ></path>
                </svg>
                <p className="text-sm text-gray-400">
                  {fileName || "Click to upload PDF (or paste text below)"}
                </p>
              </div>
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>

          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            className="w-full h-64 p-3 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all text-black placeholder-gray-500"
            placeholder="Or paste your resume text here..."
          />
          <div className="mb-4">
            {errorMessage && (
              <p className="text-red-400 text-sm">{errorMessage}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !resumeText.trim()}
          className="w-full text-lg bg-[#6300B3] hover:bg-purple-800 py-1.5 px-4 text-white rounded-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg
                className="inline animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Analyzing...
            </>
          ) : (
            "Calculate ATS Score"
          )}
        </button>
      </form>

      {atsScore !== null && (
        <div className="mt-6 animate-in fade-in">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white">Your ATS Score</h3>
            <div className="mt-2 flex items-center">
              <div className="relative w-full h-2 bg-gray-700 rounded-full">
                <div
                  className="absolute h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${atsScore}%` }}
                ></div>
              </div>
              <span className="ml-3 text-xl font-bold text-indigo-400">
                {atsScore}%
              </span>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-300">Analysis:</h4>
              <ul className="mt-2 space-y-1 text-sm text-gray-400">
                {analysis.length > 0 ? (
                  analysis.map((item, index) => (
                    <li key={index} className="flex items-center">
                      <span className="text-green-400 mr-2">✓</span> {item}
                    </li>
                  ))
                ) : (
                  <li>No specific keywords detected</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeScorer;
