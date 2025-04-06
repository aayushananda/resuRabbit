"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./Button";
import RoomOutlinedIcon from "@mui/icons-material/RoomOutlined";
import placeholderLogo from "../public/images/ResuLogo.png";

// Job type from our API
interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  link: string;
  source: string;
  salary?: string;
  postedDate?: string;
  jobType?: string;
  logo?: string;
}

interface FilterType {
  jobType: string[];
  experience: string[];
  location: string[];
  salary: { min: string; max: string };
}

interface AllJobsProps {
  query?: string;
  location?: string;
  jobType?: string;
  category?: string;
  filters?: FilterType;
}

export default function AllJobs({
  query = "",
  location = "",
  jobType = "all",
  category = "",
  filters = {
    jobType: [],
    experience: [],
    location: [],
    salary: { min: "", max: "" },
  },
}: AllJobsProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);

        // Build the query string based on props
        const queryParams = new URLSearchParams();
        if (query) queryParams.append("query", query);
        if (location) queryParams.append("location", location);
        if (jobType !== "all") queryParams.append("jobType", jobType);
        if (category) queryParams.append("category", category);

        const response = await fetch(`/api/jobs?${queryParams.toString()}`);
        const result = await response.json();

        if (result.success) {
          let filteredJobs = [...result.data];

          // Apply additional filters
          if (filters.jobType.length > 0) {
            filteredJobs = filteredJobs.filter(
              (job) =>
                job.jobType &&
                filters.jobType.some((type) =>
                  job.jobType?.toLowerCase().includes(type.toLowerCase())
                )
            );
          }

          if (filters.location.length > 0) {
            filteredJobs = filteredJobs.filter((job) =>
              filters.location.some((loc) =>
                job.location.toLowerCase().includes(loc.toLowerCase())
              )
            );
          }

          // Salary filtering if both min and max are provided
          if (filters.salary.min && filters.salary.max) {
            const min = parseInt(filters.salary.min, 10);
            const max = parseInt(filters.salary.max, 10);

            if (!isNaN(min) && !isNaN(max)) {
              filteredJobs = filteredJobs.filter((job) => {
                if (!job.salary) return false;

                // Extract numbers from salary string
                const salaryNumbers = job.salary.match(/\d+/g);
                if (!salaryNumbers || salaryNumbers.length === 0) return false;

                // Use the first number as an approximation
                const salaryValue = parseInt(salaryNumbers[0], 10);
                return salaryValue >= min && salaryValue <= max;
              });
            }
          }

          setJobs(filteredJobs);
        } else {
          setError(result.message || "Failed to fetch jobs");
        }
      } catch (err) {
        setError("An error occurred while fetching jobs");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [query, location, jobType, category, filters]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-800"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-red-50 p-4 rounded-md text-red-600 min-h-[200px] flex items-center justify-center">
        <p>{error}</p>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex-1 bg-gray-50 p-8 rounded-md text-gray-600 min-h-[400px] flex flex-col items-center justify-center">
        <p className="text-lg mb-4">No jobs found matching your criteria</p>
        <p>Try adjusting your search filters</p>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Found {jobs.length} jobs
      </h3>

      <div className="space-y-6">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  <Image
                    src={job.logo || placeholderLogo}
                    alt={`${job.company} logo`}
                    width={60}
                    height={60}
                    className="rounded-md object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {job.title}
                  </h3>
                  <p className="mt-1 text-base font-medium text-gray-700">
                    {job.company}
                  </p>
                  <div className="mt-1 flex items-center text-sm text-gray-500">
                    <RoomOutlinedIcon className="h-4 w-4 text-gray-400 mr-1" />
                    <span>{job.location}</span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {job.jobType && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {job.jobType}
                      </span>
                    )}
                    {job.salary && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {job.salary}
                      </span>
                    )}
                    {job.postedDate && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {job.postedDate}
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                    {job.description}
                  </p>

                  <div className="mt-4 flex space-x-3">
                    <a
                      href={job.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button color="purple" size="sm" iconName="apply">
                        Apply Now
                      </Button>
                    </a>
                    <Link href={`/jobs/${job.id}`}>
                      <Button color="lime" size="sm" iconName="view">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {job.source && (
              <div className="bg-gray-50 px-6 py-2 text-right text-xs text-gray-500">
                Source: {job.source}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
