"use client";

import React, { useState } from "react";
import { jsPDF } from "jspdf";
import { Button } from "./Button";

const ResumeBuilder = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    summary: "",
    experience: "",
    education: "",
    skills: "",
  });

  const [generatedResume, setGeneratedResume] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateResume = (e) => {
    e.preventDefault();
    const resume = {
      header: `${formData.fullName}\n${formData.email} | ${formData.phone}`,
      sections: [
        {
          title: "Professional Summary",
          content: formData.summary,
        },
        {
          title: "Work Experience",
          content: formData.experience,
        },
        {
          title: "Education",
          content: formData.education,
        },
        {
          title: "Skills",
          content: formData.skills.split(",").map((skill) => skill.trim()),
        },
      ],
    };
    setGeneratedResume(resume);
  };

  const downloadPDF = () => {
    if (!generatedResume) return;

    const doc = new jsPDF();
    let yPos = 20;

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(generatedResume.header.split("\n")[0], 20, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(generatedResume.header.split("\n")[1], 20, yPos);
    yPos += 10;

    doc.setLineWidth(0.5);
    doc.line(20, yPos, 190, yPos);
    yPos += 10;

    generatedResume.sections.forEach((section) => {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(section.title, 20, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      if (Array.isArray(section.content)) {
        section.content.forEach((item) => {
          doc.text(`• ${item}`, 25, yPos);
          yPos += 6;
        });
      } else {
        const splitText = doc.splitTextToSize(section.content, 170);
        splitText.forEach((line) => {
          doc.text(line, 25, yPos);
          yPos += 6;
        });
      }
      yPos += 5;
    });

    doc.save(`${formData.fullName}_Resume.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-4">Resume Builder</h2>
        <form onSubmit={generateResume} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:border-green-400"
              />
            </div>
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:border-green-400"
              />
            </div>
            <div>
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:border-green-400"
              />
            </div>
          </div>
          <textarea
            name="summary"
            placeholder="Professional Summary"
            value={formData.summary}
            onChange={handleChange}
            className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:border-green-400 h-24"
          />
          <textarea
            name="experience"
            placeholder="Work Experience (Company - Role - Duration - Responsibilities)"
            value={formData.experience}
            onChange={handleChange}
            className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:border-green-400 h-32"
          />
          <textarea
            name="education"
            placeholder="Education (Degree - Institution - Year)"
            value={formData.education}
            onChange={handleChange}
            className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:border-green-400 h-24"
          />
          <input
            type="text"
            name="skills"
            placeholder="Skills (comma-separated)"
            value={formData.skills}
            onChange={handleChange}
            className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:border-green-400"
          />
          <button
            type="submit"
            className="w-full text-lg bg-purple-700 hover:bg-purple-800 py-1.5 px-4 text-white rounded-sm font-semibold"
          >
            Generate ATS-Friendly Resume
          </button>
        </form>
      </div>

      {generatedResume && (
        <div className="bg-gray-800 p-6 rounded-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-white">
              Generated Resume
            </h3>
            <button
              onClick={downloadPDF}
              className="bg-purple-700 hover:bg-purple-800 py-1.5 px-4 text-white rounded-sm font-semibold text-sm"
            >
              Download as PDF
            </button>
          </div>
          <div className="space-y-4">
            <div className="text-center border-b border-gray-700 pb-4">
              <p className="text-white font-bold text-lg">
                {generatedResume.header.split("\n")[0]}
              </p>
              <p className="text-gray-400 text-sm">
                {generatedResume.header.split("\n")[1]}
              </p>
            </div>

            {generatedResume.sections.map((section, index) => (
              <div key={index}>
                <h4 className="text-green-400 font-semibold">
                  {section.title}
                </h4>
                {Array.isArray(section.content) ? (
                  <ul className="mt-2 space-y-1 text-sm text-gray-400">
                    {section.content.map((item, idx) => (
                      <li key={idx} className="flex items-center">
                        <span className="text-green-400 mr-2">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-gray-400">
                    {section.content}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeBuilder;
