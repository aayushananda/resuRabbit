"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./Button";
import { CgSearch } from "react-icons/cg";

interface JobSearchProps {
  initialQuery?: string;
  initialLocation?: string;
  initialJobType?: string;
  initialCategory?: string;
  onSearch?: (
    query: string,
    location: string,
    jobType: string,
    category: string
  ) => void;
}

export default function JobSearch({
  initialQuery = "",
  initialLocation = "",
  initialJobType = "all",
  initialCategory = "",
  onSearch,
}: JobSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);
  const [jobType, setJobType] = useState(initialJobType);
  const [category, setCategory] = useState(initialCategory);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    setQuery(initialQuery);
    setLocation(initialLocation);
    setJobType(initialJobType);
    setCategory(initialCategory);
  }, [initialQuery, initialLocation, initialJobType, initialCategory]);

  const handleSearch = () => {
    if (onSearch) {
      onSearch(query, location, jobType, category);
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    setCategory(categoryName);
    setActiveTab(categoryName.toLowerCase());
    if (onSearch) {
      onSearch(query, location, jobType, categoryName);
    }
  };

  const handleJobTypeClick = (job: string) => {
    setQuery(job);
    if (onSearch) {
      onSearch(job, location, jobType, category);
    }
  };

  return (
    <div className="py-6 space-y-4">
      <h2 className="text-2xl font-bold text-center text-purple-900">
        Find Your Dream Job
      </h2>
      <div className="flex flex-col md:flex-row items-center justify-center gap-3">
        <div className="w-full md:w-1/3">
          <input
            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Job title, keywords, or company"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="w-full md:w-1/3">
          <input
            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Location (city, state, or remote)"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div className="w-full md:w-1/5">
          <select
            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
          >
            <option value="all">All Job Types</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </select>
        </div>
        <Button
          iconName="search"
          size="sm"
          color="purple"
          onClick={handleSearch}
        >
          Search
        </Button>
      </div>

      {/* Job Categories Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex overflow-x-auto scrollbar-hide">
          <button
            className={`whitespace-nowrap py-2 px-4 border-b-2 text-sm font-medium ${
              activeTab === "all"
                ? "border-purple-500 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => handleCategoryClick("")}
          >
            All Categories
          </button>
          <button
            className={`whitespace-nowrap py-2 px-4 border-b-2 text-sm font-medium ${
              activeTab === "technology"
                ? "border-purple-500 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => handleCategoryClick("Technology")}
          >
            Technology
          </button>
          <button
            className={`whitespace-nowrap py-2 px-4 border-b-2 text-sm font-medium ${
              activeTab === "finance"
                ? "border-purple-500 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => handleCategoryClick("Finance")}
          >
            Finance
          </button>
          <button
            className={`whitespace-nowrap py-2 px-4 border-b-2 text-sm font-medium ${
              activeTab === "healthcare"
                ? "border-purple-500 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => handleCategoryClick("Healthcare")}
          >
            Healthcare
          </button>
          <button
            className={`whitespace-nowrap py-2 px-4 border-b-2 text-sm font-medium ${
              activeTab === "education"
                ? "border-purple-500 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => handleCategoryClick("Education")}
          >
            Education
          </button>
          <button
            className={`whitespace-nowrap py-2 px-4 border-b-2 text-sm font-medium ${
              activeTab === "government"
                ? "border-purple-500 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => handleCategoryClick("Government")}
          >
            Government
          </button>
          <button
            className={`whitespace-nowrap py-2 px-4 border-b-2 text-sm font-medium ${
              activeTab === "marketing"
                ? "border-purple-500 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => handleCategoryClick("Marketing")}
          >
            Marketing
          </button>
          <button
            className={`whitespace-nowrap py-2 px-4 border-b-2 text-sm font-medium ${
              activeTab === "hospitality"
                ? "border-purple-500 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => handleCategoryClick("Hospitality")}
          >
            Hospitality
          </button>
        </nav>
      </div>

      {/* Popular Job Titles */}
      <div className="flex flex-wrap justify-center gap-2 mx-auto max-w-4xl">
        <button
          className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm hover:bg-purple-200"
          onClick={() => handleJobTypeClick("Software Engineer")}
        >
          Software Engineer
        </button>
        <button
          className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm hover:bg-purple-200"
          onClick={() => handleJobTypeClick("Data Analyst")}
        >
          Data Analyst
        </button>
        <button
          className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm hover:bg-purple-200"
          onClick={() => handleJobTypeClick("Product Manager")}
        >
          Product Manager
        </button>
        <button
          className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm hover:bg-purple-200"
          onClick={() => handleJobTypeClick("Bank PO")}
        >
          Bank PO
        </button>
        <button
          className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm hover:bg-purple-200"
          onClick={() => handleJobTypeClick("Teacher")}
        >
          Teacher
        </button>
        <button
          className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm hover:bg-purple-200"
          onClick={() => handleJobTypeClick("Doctor")}
        >
          Doctor
        </button>
        <button
          className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm hover:bg-purple-200"
          onClick={() => handleJobTypeClick("Civil Services")}
        >
          Civil Services
        </button>
        <button
          className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm hover:bg-purple-200"
          onClick={() => handleJobTypeClick("Digital Marketing")}
        >
          Digital Marketing
        </button>
      </div>
    </div>
  );
}
