import React from "react";

export default function JobSearch(){
  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold">Job Search</h2>
      <p className="text-gray-600">Search for your desired job matching your skills</p>
      <div className="flex gap-2 mt-4 bg-[#F2F2F2] px-4 py-2">
        <input className="p-2 rounded w-full bg-[#F2F2F2] border-r-2" placeholder="Enter Job title" />
        <input className="p-2 rounded w-full bg-[#F2F2F2] border-r-2" placeholder="Enter location" />
        <input className="p-2 rounded w-full bg-[#F2F2F2]" placeholder="Years of experience" />
        <button className="bg-[#6300B3] text-white px-6 py-2 rounded">Search</button>
      </div>
    </div>
  );
};