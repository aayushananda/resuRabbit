"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./Button";
import { FaMapMarkerAlt } from "react-icons/fa";
import google from "../public/images/google_logo.png";
import google_logo from "../public/images/google.png";
import apple from "../public/images/apple_logo.png";
import intel from "../public/images/intel_logo.png";
import microsoft from "../public/images/microsoft_logo.png";
import flipkart from "../public/images/flipkart_logo.png";
import yt from "../public/images/yt_logo.png";
import Resu from "../public/images/ResuLogo.png";
import RoomOutlinedIcon from "@mui/icons-material/RoomOutlined";

interface JobCardProps {
  title: string;
  type: "FULL-TIME" | "PART-TIME";
  salary: string;
  company: string;
  location: string;
  applicants: number;
  logo: any;
  id: string;
  applyLink: string;
}

const JobCard: React.FC<JobCardProps> = ({
  title,
  type,
  salary,
  company,
  location,
  applicants,
  logo,
  id,
  applyLink,
}) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-5 w-80 border">
      <h3 className="text-lg font-semibold">{title}</h3>
      <span
        className={`text-sm font-bold ${
          type === "FULL-TIME" ? "text-blue-600" : "text-green-600"
        }`}
      >
        {type}
      </span>
      <p className="text-sm text-gray-600">Salary: {salary}</p>
      <div className="flex items-center my-2">
        <Image
          src={logo}
          alt={company}
          width={30}
          height={24}
          className="mr-2"
        />
        <span className="text-sm font-semibold">{company}</span>
      </div>
      <div className="flex items-center text-gray-500 text-sm">
        <FaMapMarkerAlt className="mr-1" />
        {location}
      </div>
      <p className="text-xs text-gray-500 mt-2">{applicants}+ applicants</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={`/jobs/${id}`}>
          <Button size="sm" color="purple" iconName="view">
            View details
          </Button>
        </Link>
        <a href={applyLink} target="_blank" rel="noopener noreferrer">
          <Button size="sm" color="lime" iconName="apply">
            Apply now
          </Button>
        </a>
      </div>
    </div>
  );
};

const FeaturedJobs = () => {
  const jobs: JobCardProps[] = [
    {
      title: "Technical Support Specialist",
      type: "PART-TIME",
      salary: "20,000 INR - 25,000 INR",
      company: "Google Inc.",
      location: "New Delhi, India",
      applicants: 10,
      logo: google_logo,
      id: "technical-support-specialist",
      applyLink: "https://example.com/apply-technical-support-specialist",
    },
    {
      title: "Senior UI/UX Designer",
      type: "FULL-TIME",
      salary: "$30,000 - $55,000",
      company: "Apple",
      location: "Boston, USA",
      applicants: 9,
      logo: apple,
      id: "senior-ui-ux-designer",
      applyLink: "https://example.com/apply-senior-ui-ux-designer",
    },
    {
      title: "Marketing Officer",
      type: "PART-TIME",
      salary: "15,000 INR - 35,000 INR",
      company: "Intel Corp",
      location: "Bangalore, India",
      applicants: 30,
      logo: intel,
      id: "marketing-officer",
      applyLink: "https://example.com/apply-marketing-officer",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto pt-10 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Featured Jobs
        </h2>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
          Discover opportunities from leading companies
        </p>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job, index) => (
          <div
            key={index}
            className="bg-white overflow-hidden shadow-lg rounded-lg"
          >
            <div className="px-6 py-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Image
                    src={job.logo ?? Resu}
                    width={56}
                    height={56}
                    alt={`${job.company} logo`}
                    className="rounded-md"
                  />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {job.title}
                  </h3>
                  <p className="text-gray-500">{job.company}</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-500">
                  <RoomOutlinedIcon className="h-4 w-4 text-gray-400 mr-1" />
                  {job.location}
                </div>
                <div className="mt-2 flex space-x-2">
                  <span
                    className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                      job.type === "FULL-TIME"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {job.type}
                  </span>
                  <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {job.salary}
                  </span>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={`/jobs/${job.id}`}>
                  <Button size="sm" color="purple" iconName="view">
                    View details
                  </Button>
                </Link>
                <a
                  href={job.applyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="sm" color="lime" iconName="apply">
                    Apply now
                  </Button>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link href="/jobs">
          <Button color="purple" iconName="job">
            View all jobs
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default FeaturedJobs;
