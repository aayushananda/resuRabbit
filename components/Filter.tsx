"use client";

import { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { Button } from "./Button";

interface FilterProps {
  onFilterChange?: (filters: {
    jobType: string[];
    experience: string[];
    location: string[];
    salary: { min: string; max: string };
  }) => void;
}

export default function Filter({ onFilterChange }: FilterProps) {
  const [jobType, setJobType] = useState<string[]>([]);
  const [experience, setExperience] = useState<string[]>([]);
  const [location, setLocation] = useState<string[]>([]);
  const [salary, setSalary] = useState({ min: "", max: "" });

  const handleJobTypeChange = (type: string) => {
    const updatedTypes = jobType.includes(type)
      ? jobType.filter((t) => t !== type)
      : [...jobType, type];

    setJobType(updatedTypes);

    if (onFilterChange) {
      onFilterChange({
        jobType: updatedTypes,
        experience,
        location,
        salary,
      });
    }
  };

  const handleExperienceChange = (exp: string) => {
    const updatedExp = experience.includes(exp)
      ? experience.filter((e) => e !== exp)
      : [...experience, exp];

    setExperience(updatedExp);

    if (onFilterChange) {
      onFilterChange({
        jobType,
        experience: updatedExp,
        location,
        salary,
      });
    }
  };

  const handleLocationChange = (loc: string) => {
    const updatedLoc = location.includes(loc)
      ? location.filter((l) => l !== loc)
      : [...location, loc];

    setLocation(updatedLoc);

    if (onFilterChange) {
      onFilterChange({
        jobType,
        experience,
        location: updatedLoc,
        salary,
      });
    }
  };

  const handleSalaryChange = (field: "min" | "max", value: string) => {
    const updatedSalary = { ...salary, [field]: value };
    setSalary(updatedSalary);

    if (onFilterChange) {
      onFilterChange({
        jobType,
        experience,
        location,
        salary: updatedSalary,
      });
    }
  };

  return (
    <div className="p-4 rounded-md w-full md:w-1/4 bg-white shadow-md border border-gray-200">
      <h3 className="text-xl font-semibold pb-4 text-purple-900">Filters</h3>

      <div className="space-y-6">
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Salary Range</h4>
          <div className="flex gap-2">
            <input
              className="border p-2 rounded w-full text-sm"
              placeholder="Min"
              value={salary.min}
              onChange={(e) => handleSalaryChange("min", e.target.value)}
            />
            <input
              className="border p-2 rounded w-full text-sm"
              placeholder="Max"
              value={salary.max}
              onChange={(e) => handleSalaryChange("max", e.target.value)}
            />
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-700 mb-2">Job Type</h4>
          <div className="space-y-1">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded text-purple-600 focus:ring-purple-500"
                checked={jobType.includes("Full-time")}
                onChange={() => handleJobTypeChange("Full-time")}
              />
              <span className="text-gray-700">Full-Time</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded text-purple-600 focus:ring-purple-500"
                checked={jobType.includes("Part-time")}
                onChange={() => handleJobTypeChange("Part-time")}
              />
              <span className="text-gray-700">Part-Time</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded text-purple-600 focus:ring-purple-500"
                checked={jobType.includes("Contract")}
                onChange={() => handleJobTypeChange("Contract")}
              />
              <span className="text-gray-700">Contract</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded text-purple-600 focus:ring-purple-500"
                checked={jobType.includes("Internship")}
                onChange={() => handleJobTypeChange("Internship")}
              />
              <span className="text-gray-700">Internship</span>
            </label>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-700 mb-2">Experience Level</h4>
          <div className="space-y-1">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded text-purple-600 focus:ring-purple-500"
                checked={experience.includes("Entry-level")}
                onChange={() => handleExperienceChange("Entry-level")}
              />
              <span className="text-gray-700">Entry Level (0-2 years)</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded text-purple-600 focus:ring-purple-500"
                checked={experience.includes("Mid-level")}
                onChange={() => handleExperienceChange("Mid-level")}
              />
              <span className="text-gray-700">Mid Level (3-5 years)</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded text-purple-600 focus:ring-purple-500"
                checked={experience.includes("Senior")}
                onChange={() => handleExperienceChange("Senior")}
              />
              <span className="text-gray-700">Senior (5+ years)</span>
            </label>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-700 mb-2">Top Locations</h4>
          <div className="space-y-1">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded text-purple-600 focus:ring-purple-500"
                checked={location.includes("Bangalore")}
                onChange={() => handleLocationChange("Bangalore")}
              />
              <span className="text-gray-700">Bangalore</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded text-purple-600 focus:ring-purple-500"
                checked={location.includes("Hyderabad")}
                onChange={() => handleLocationChange("Hyderabad")}
              />
              <span className="text-gray-700">Hyderabad</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded text-purple-600 focus:ring-purple-500"
                checked={location.includes("Delhi")}
                onChange={() => handleLocationChange("Delhi")}
              />
              <span className="text-gray-700">Delhi NCR</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded text-purple-600 focus:ring-purple-500"
                checked={location.includes("Mumbai")}
                onChange={() => handleLocationChange("Mumbai")}
              />
              <span className="text-gray-700">Mumbai</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded text-purple-600 focus:ring-purple-500"
                checked={location.includes("Remote")}
                onChange={() => handleLocationChange("Remote")}
              />
              <span className="text-gray-700">Remote</span>
            </label>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-700 mb-2">Engineering Fields</h4>
          <div className="space-y-1">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded text-purple-600 focus:ring-purple-500"
              />
              <span className="text-gray-700">Software Development</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded text-purple-600 focus:ring-purple-500"
              />
              <span className="text-gray-700">Data Engineering</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded text-purple-600 focus:ring-purple-500"
              />
              <span className="text-gray-700">DevOps</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded text-purple-600 focus:ring-purple-500"
              />
              <span className="text-gray-700">QA & Testing</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded text-purple-600 focus:ring-purple-500"
              />
              <span className="text-gray-700">Machine Learning</span>
            </label>
          </div>
        </div>

        <div className="mt-8 mb-4 flex justify-center">
          <Button
            color="purple"
            iconName="reset"
            onClick={() => {
              setJobType([]);
              setExperience([]);
              setLocation([]);
              setSalary({ min: "", max: "" });

              if (onFilterChange) {
                onFilterChange({
                  jobType: [],
                  experience: [],
                  location: [],
                  salary: { min: "", max: "" },
                });
              }
            }}
          >
            Reset Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
