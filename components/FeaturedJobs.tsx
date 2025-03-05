'use client';

import Image from 'next/image';
import { FaMapMarkerAlt } from 'react-icons/fa';
import google from "../public/images/google_logo.png"
import google_logo from "../public/images/google.png"
import apple from "../public/images/apple_logo.png"
import intel from "../public/images/intel_logo.png"
import microsoft from "../public/images/microsoft_logo.png"
import flipkart from "../public/images/flipkart_logo.png"
import yt from "../public/images/yt_logo.png"

interface JobCardProps {
  title: string;
  type: 'FULL-TIME' | 'PART-TIME';
  salary: string;
  company: string;
  location: string;
  applicants: number;
  logo: any;
}

const JobCard: React.FC<JobCardProps> = ({ title, type, salary, company, location, applicants, logo }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-5 w-80 border">
      <h3 className="text-lg font-semibold">{title}</h3>
      <span className={`text-sm font-bold ${type === 'FULL-TIME' ? 'text-blue-600' : 'text-green-600'}`}>{type}</span>
      <p className="text-sm text-gray-600">Salary: {salary}</p>
      <div className="flex items-center my-2">
        <Image src={logo} alt={company} width={30} height={24} className="mr-2" />
        <span className="text-sm font-semibold">{company}</span>
      </div>
      <div className="flex items-center text-gray-500 text-sm">
        <FaMapMarkerAlt className="mr-1" />
        {location}
      </div>
      <p className="text-xs text-gray-500 mt-2">{applicants}+ applicants</p>
      <div className="flex justify-between mt-4">
        <button className="border border-[#6300B3] text-[#6300B3] px-4 py-2 rounded">View details</button>
        <button className="bg-[#6300B3] text-white px-4 py-2 rounded">Apply now</button>
      </div>
    </div>
  );
};

const FeaturedJobs = () => {
  const jobs: JobCardProps[] = [
    {
      title: 'Technical Support Specialist',
      type: 'PART-TIME',
      salary: '20,000 INR - 25,000 INR',
      company: 'Google Inc.',
      location: 'New Delhi, India',
      applicants: 10,
      logo: google_logo,
    },
    {
      title: 'Senior UI/UX Designer',
      type: 'FULL-TIME',
      salary: '$30,000 - $55,000',
      company: 'Apple',
      location: 'Boston, USA',
      applicants: 9,
      logo: apple,
    },
    {
      title: 'Marketing Officer',
      type: 'PART-TIME',
      salary: '15,000 INR - 35,000 INR',
      company: 'Intel Corp',
      location: 'Bangalore, India',
      applicants: 30,
      logo: intel,
    },
  ];

  return (
    <section className="text-center py-10 w-screen">
      <h2 className="text-2xl font-bold">Featured Jobs</h2>
      <p className="text-gray-500">Choose jobs from the top employers and apply for the same.</p>
      <div className="flex justify-center gap-6 mt-6 flex-wrap">
        {jobs.map((job, index) => (
          <JobCard key={index} {...job} />
        ))}
      </div>
      <a href="#" className="text-[#6300B3] font-semibold block mt-4">View all</a>
      <hr className="my-6 w-3/4 mx-auto" />
      <h3 className="text-lg font-semibold">Top companies hiring now</h3>
      <div className="flex justify-center gap-8 p-5 items-center">
        <Image src={google} alt="Google" width={120} height={40}/>
        <Image src={microsoft} alt="Microsoft" width={120} height={40}/>
        <Image src={flipkart} alt="Flipkart" width={120} height={40} />
        <Image src={yt} alt="YouTube" width={120} height={40} />
        <Image src={apple} alt="Apple" width={120} height={40} />
      </div>
    </section>
  );
};

export default FeaturedJobs;
