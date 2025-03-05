const jobs = [
  { title: "Technical Support Specialist", type: "Part-Time", salary: "20,000 - 25,000 INR", company: "Google Inc.", location: "New Delhi, India" },
  { title: "Senior UI/UX Designer", type: "Full-Time", salary: "$120,000 - $150,000", company: "Apple", location: "Boston, USA" },
];

export default function AllJobs(){
  return (
    <div className="w-3/4 p-4">
      <h2 className="text-xl font-semibold">All Jobs</h2>
      <div className="grid grid-cols-2 gap-4 mt-4">
        {jobs.map((job, index) => (
          <div key={index} className="border p-4 rounded shadow-md">
            <h3 className="font-semibold">{job.title}</h3>
            <p>{job.type} - Salary: {job.salary}</p>
            <p>{job.company} - {job.location}</p>
            <button className="mt-2 bg-purple-600 text-white px-4 py-2 rounded">Apply Now</button>
          </div>
        ))}
      </div>
    </div>
  );
};