import React from "react";

export default function JobSearch(){
  return (
    <div className="p-4 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-semibold">Job Search</h2>
      <p className="text-gray-600">Search for your desired job matching your skills</p>
      <div className="flex gap-2 mt-4">
        <input className="border p-2 rounded w-full" placeholder="Enter Job title" />
        <input className="border p-2 rounded w-full" placeholder="Enter location" />
        <input className="border p-2 rounded w-full" placeholder="Years of experience" />
        <button className="bg-purple-600 text-white px-4 py-2 rounded">Search</button>
      </div>
    </div>
  );
};