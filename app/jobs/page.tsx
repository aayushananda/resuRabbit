"use client";

import { useState } from "react";
import JobSearch from "@/components/JobSearch";
import Filter from "@/components/Filter";
import AllJobs from "@/components/AllJobs";

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [searchJobType, setSearchJobType] = useState("all");
  const [searchCategory, setSearchCategory] = useState("");
  const [filters, setFilters] = useState({
    jobType: [],
    experience: [],
    location: [],
    salary: { min: "", max: "" },
  });

  const handleSearch = (
    query: string,
    location: string,
    jobType: string,
    category: string
  ) => {
    setSearchQuery(query);
    setSearchLocation(location);
    setSearchJobType(jobType);
    setSearchCategory(category);
  };

  const handleFilterChange = (newFilters: {
    jobType: string[];
    experience: string[];
    location: string[];
    salary: { min: string; max: string };
  }) => {
    setFilters(newFilters);
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-900 mb-2">
          Find Your Dream Job
        </h1>
        <p className="text-gray-600 mb-6">
          Discover opportunities across various fields from top companies in
          India
        </p>

        <JobSearch
          initialQuery={searchQuery}
          initialLocation={searchLocation}
          initialJobType={searchJobType}
          initialCategory={searchCategory}
          onSearch={handleSearch}
        />

        <div className="flex flex-col md:flex-row gap-6 mt-6">
          <Filter onFilterChange={handleFilterChange} />
          <AllJobs
            query={searchQuery}
            location={searchLocation}
            jobType={searchJobType}
            category={searchCategory}
            filters={filters}
          />
        </div>
      </div>
    </div>
  );
}
