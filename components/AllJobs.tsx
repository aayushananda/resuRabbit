import Image from "next/image";
import google from "../public/images/google.png"
import apple from "../public/images/apple_logo.png"
import Resu from "../public/images/ResuLogo.png"

import RoomOutlinedIcon from '@mui/icons-material/RoomOutlined';

const jobs = [
  { title: "Technical Support Specialist", type: "Part-Time", salary: "20,000 - 25,000 INR", company: "Google Inc.", location: "New Delhi, India", image: google },
  { title: "Senior UI/UX Designer", type: "Full-Time", salary: "$120,000 - $150,000", company: "Apple", location: "Boston, USA", image: apple },
    { title: "Technical Support Specialist", type: "Part-Time", salary: "20,000 - 25,000 INR", company: "Google Inc.", location: "New Delhi, India" },
  { title: "Senior UI/UX Designer", type: "Full-Time", salary: "$120,000 - $150,000", company: "Apple", location: "Boston, USA" },
    { title: "Technical Support Specialist", type: "Part-Time", salary: "20,000 - 25,000 INR", company: "Google Inc.", location: "New Delhi, India", image: google },
];

export default function AllJobs(){
  return (
    <div className="w-3/4 p-4">
      <h2 className="text-xl font-semibold">All Jobs (99+)</h2>
      <div className="grid grid-cols-2 gap-4 mt-4">
        {jobs.map((job, index) => (
          <div key={index} className="border p-4 rounded shadow-md bg-[#EFE2F8]">
            <h3 className="font-semibold">{job.title}</h3>
            <div className="flex gap-2">
              <p style={{ backgroundColor: job.type === "Full-Time" ? "rgba(227, 197, 252, 0.5)" : "rgba(225, 252, 230, 0.5)", padding: "1px 6px", color: job.type === "Full-Time" ? "#6300B3" : "green", fontWeight: "bold", }}>
              {job.type}</p>
              <p> Salary: {job.salary}</p>
            </div>
            <div className="flex gap-1 py-4">
              <div className="flex items-center">
                <Image src={job.image ?? Resu} width={40} height={20} alt="Company Logo"></Image>
              </div>
              <div>
                <p>{job.company}</p>
                <div className="flex">
                  <RoomOutlinedIcon className="size-3"/>
                  <p className="text-[12px]">{job.location}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-between">
                <button className="mt-2 bg-[#6300B3] text-white px-4 py-2 rounded">Apply Now</button>
                <button className="mt-2 border-[#6300B3] border-2 text-black px-4 py-2 rounded">View Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};