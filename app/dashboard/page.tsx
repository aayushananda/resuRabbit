"use client";

import { useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [name, setName] = useState(session?.user?.name || "John Doe");
  const [email, setEmail] = useState(session?.user?.email || "john.doe@example.com");
  const [password, setPassword] = useState("");

  const appliedJobs = [
    { id: 1, title: "Frontend Developer", company: "Tech Corp", status: "Pending", appliedDate: "2025-04-10" },
    { id: 2, title: "UI/UX Designer", company: "Design Studio", status: "Interview", appliedDate: "2025-04-05" },
    { id: 3, title: "Full Stack Engineer", company: "Innovate Inc.", status: "Rejected", appliedDate: "2025-03-28" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-[#6300B3] mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col items-center">
              <Image
                src="https://avatar.iran.liara.run/public?username=john.doe"
                width={120}
                height={120}
                alt="Profile"
                className="rounded-full mb-4"
              />
              <h2 className="text-xl font-semibold text-gray-800">{name}</h2>
              <p className="text-gray-500">{email}</p>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Change Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#6300B3] focus:border-[#6300B3]"
                  placeholder="Enter new name"
                />
                <button
                  className="mt-2 w-full bg-[#6300B3] text-white py-2 px-4 rounded-md hover:bg-[#7a00d9] transition-colors"
                  onClick={() => alert("Name change not implemented yet")}
                >
                  Update Name
                </button>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Change Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#6300B3] focus:border-[#6300B3]"
                  placeholder="Enter new email"
                />
                <button
                  className="mt-2 w-full bg-[#6300B3] text-white py-2 px-4 rounded-md hover:bg-[#7a00d9] transition-colors"
                  onClick={() => alert("Email change not implemented yet")}
                >
                  Update Email
                </button>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Change Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#6300B3] focus:border-[#6300B3]"
                  placeholder="Enter new password"
                />
                <button
                  className="mt-2 w-full bg-[#6300B3] text-white py-2 px-4 rounded-md hover:bg-[#7a00d9] transition-colors"
                  onClick={() => alert("Password change not implemented yet")}
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Applied Jobs</h2>
            {appliedJobs.length === 0 ? (
              <p className="text-gray-500">No jobs applied yet.</p>
            ) : (
              <div className="space-y-4">
                {appliedJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-md hover:bg-gray-50"
                  >
                    <div>
                      <h3 className="text-lg font-medium text-gray-800">{job.title}</h3>
                      <p className="text-sm text-gray-500">{job.company}</p>
                      <p className="text-sm text-gray-500">Applied on: {job.appliedDate}</p>
                    </div>
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded-full ${
                        job.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : job.status === "Interview"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}