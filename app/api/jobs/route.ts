import { NextResponse, NextRequest } from "next/server";
import * as cheerio from "cheerio";
import axios from "axios";

// Interface for job listing
interface JobListing {
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
  category?: string;
}

const MOCK_JOBS: JobListing[] = [
  // Tech Jobs
  {
    id: "1",
    title: "Software Engineer (Frontend)",
    company: "Google",
    location: "Bangalore, India",
    description:
      "As a Software Engineer at Google, you will work on a specific project critical to Google's needs with opportunities to switch teams and projects as you and our fast-paced business grow and evolve.",
    link: "https://careers.google.com",
    source: "LinkedIn",
    salary: "₹25,00,000 - ₹40,00,000 per year",
    postedDate: "2 days ago",
    jobType: "Full-time",
    logo: "/images/google_logo.png",
    category: "Technology",
  },
  {
    id: "2",
    title: "Backend Developer",
    company: "Microsoft",
    location: "Hyderabad, India",
    description:
      "Join our team to build scalable backend services for our cloud products.",
    link: "https://careers.microsoft.com",
    source: "Naukri",
    salary: "₹20,00,000 - ₹35,00,000 per year",
    postedDate: "5 days ago",
    jobType: "Full-time",
    logo: "/images/microsoft_logo.png",
    category: "Technology",
  },
  {
    id: "3",
    title: "Data Engineering Intern",
    company: "Flipkart",
    location: "Bangalore, India",
    description:
      "As a Data Engineering Intern, you will work with big data technologies to build scalable data pipelines.",
    link: "https://careers.flipkart.com",
    source: "InternShala",
    salary: "₹40,000 - ₹60,000 per month",
    postedDate: "1 week ago",
    jobType: "Internship",
    logo: "/images/flipkart_logo.png",
    category: "Technology",
  },
  {
    id: "4",
    title: "Full Stack Developer",
    company: "Intel",
    location: "Bangalore, India",
    description:
      "Looking for talented Full Stack Developers to join our growing team.",
    link: "https://jobs.intel.com",
    source: "Monster",
    salary: "₹18,00,000 - ₹30,00,000 per year",
    postedDate: "3 days ago",
    jobType: "Full-time",
    logo: "/images/intel_logo.png",
    category: "Technology",
  },

  // Finance Jobs
  {
    id: "5",
    title: "Investment Banking Analyst",
    company: "HDFC Bank",
    location: "Mumbai, India",
    description:
      "Join HDFC Bank's investment banking team to analyze financial data, prepare financial models, and support M&A transactions.",
    link: "https://www.hdfcbank.com/careers",
    source: "LinkedIn",
    salary: "₹12,00,000 - ₹18,00,000 per year",
    postedDate: "1 week ago",
    jobType: "Full-time",
    logo: "/images/ResuLogo.png",
    category: "Finance",
  },
  {
    id: "6",
    title: "Financial Analyst",
    company: "ICICI Bank",
    location: "Delhi, India",
    description:
      "Analyze financial data to forecast business, industry, and economic conditions to make informed investment decisions.",
    link: "https://www.icicibank.com/careers",
    source: "Naukri",
    salary: "₹8,00,000 - ₹15,00,000 per year",
    postedDate: "2 weeks ago",
    jobType: "Full-time",
    logo: "/images/ResuLogo.png",
    category: "Finance",
  },

  // Healthcare Jobs
  {
    id: "7",
    title: "Medical Officer",
    company: "Apollo Hospitals",
    location: "Chennai, India",
    description:
      "Provide medical care to patients, diagnose and treat illnesses, and coordinate with other healthcare professionals.",
    link: "https://www.apollohospitals.com/careers",
    source: "LinkedIn",
    salary: "₹10,00,000 - ₹15,00,000 per year",
    postedDate: "3 days ago",
    jobType: "Full-time",
    logo: "/images/ResuLogo.png",
    category: "Healthcare",
  },
  {
    id: "8",
    title: "Pharmacist",
    company: "Medanta",
    location: "Gurgaon, India",
    description:
      "Dispense medications, provide pharmaceutical care, and counsel patients on medication use.",
    link: "https://www.medanta.org/careers",
    source: "Monster",
    salary: "₹5,00,000 - ₹8,00,000 per year",
    postedDate: "1 week ago",
    jobType: "Full-time",
    logo: "/images/ResuLogo.png",
    category: "Healthcare",
  },

  // Marketing Jobs
  {
    id: "9",
    title: "Digital Marketing Manager",
    company: "Byju's",
    location: "Bangalore, India",
    description:
      "Lead digital marketing campaigns, manage SEO/SEM, and optimize digital marketing efforts to increase customer acquisition.",
    link: "https://byjus.com/careers",
    source: "LinkedIn",
    salary: "₹12,00,000 - ₹20,00,000 per year",
    postedDate: "5 days ago",
    jobType: "Full-time",
    logo: "/images/ResuLogo.png",
    category: "Marketing",
  },
  {
    id: "10",
    title: "Social Media Specialist",
    company: "Zomato",
    location: "Gurgaon, India",
    description:
      "Create and manage content for various social media platforms, analyze performance metrics, and improve social media presence.",
    link: "https://www.zomato.com/careers",
    source: "WellFound",
    salary: "₹6,00,000 - ₹10,00,000 per year",
    postedDate: "2 weeks ago",
    jobType: "Full-time",
    logo: "/images/ResuLogo.png",
    category: "Marketing",
  },

  // Government Jobs
  {
    id: "11",
    title: "Bank PO",
    company: "State Bank of India",
    location: "Multiple Locations, India",
    description:
      "Join as a Probationary Officer to manage banking operations, customer service, and business development.",
    link: "https://sbi.co.in/careers",
    source: "SarkariResult",
    salary: "₹8,00,000 - ₹12,00,000 per year",
    postedDate: "1 month ago",
    jobType: "Full-time",
    logo: "/images/ResuLogo.png",
    category: "Government",
  },
  {
    id: "12",
    title: "Civil Services Officer",
    company: "UPSC",
    location: "Delhi, India",
    description:
      "Join the prestigious Indian Administrative Service (IAS) to serve the nation in administrative roles.",
    link: "https://upsc.gov.in",
    source: "UPSC Official",
    salary: "₹15,00,000 - ₹25,00,000 per year",
    postedDate: "3 months ago",
    jobType: "Full-time",
    logo: "/images/ResuLogo.png",
    category: "Government",
  },

  // Education Jobs
  {
    id: "13",
    title: "Assistant Professor",
    company: "IIT Delhi",
    location: "Delhi, India",
    description:
      "Teach undergraduate and graduate courses, conduct research, and guide student projects.",
    link: "https://home.iitd.ac.in/jobs.php",
    source: "LinkedIn",
    salary: "₹12,00,000 - ₹18,00,000 per year",
    postedDate: "2 weeks ago",
    jobType: "Full-time",
    logo: "/images/ResuLogo.png",
    category: "Education",
  },
  {
    id: "14",
    title: "School Teacher",
    company: "Delhi Public School",
    location: "Delhi, India",
    description:
      "Teach various subjects at the secondary level, develop curriculum, and mentor students.",
    link: "https://www.dpsrkp.net/careers",
    source: "Naukri",
    salary: "₹5,00,000 - ₹8,00,000 per year",
    postedDate: "1 week ago",
    jobType: "Full-time",
    logo: "/images/ResuLogo.png",
    category: "Education",
  },

  // Hospitality Jobs
  {
    id: "15",
    title: "Hotel Manager",
    company: "Taj Hotels",
    location: "Mumbai, India",
    description:
      "Oversee daily operations of the hotel, manage staff, and ensure excellent guest experience.",
    link: "https://careers.tajhotels.com",
    source: "Monster",
    salary: "₹10,00,000 - ₹15,00,000 per year",
    postedDate: "3 days ago",
    jobType: "Full-time",
    logo: "/images/ResuLogo.png",
    category: "Hospitality",
  },
  {
    id: "16",
    title: "Chef",
    company: "ITC Hotels",
    location: "Kolkata, India",
    description:
      "Create and prepare innovative dishes, manage kitchen operations, and ensure food quality.",
    link: "https://www.itchotels.com/careers",
    source: "LinkedIn",
    salary: "₹8,00,000 - ₹12,00,000 per year",
    postedDate: "1 week ago",
    jobType: "Full-time",
    logo: "/images/ResuLogo.png",
    category: "Hospitality",
  },

  // More Tech Jobs
  {
    id: "17",
    title: "DevOps Engineer",
    company: "Amazon",
    location: "Hyderabad, India",
    description:
      "Join our team to help automate and improve deployment, scaling, and operations.",
    link: "https://amazon.jobs",
    source: "LinkedIn",
    salary: "₹18,00,000 - ₹30,00,000 per year",
    postedDate: "4 days ago",
    jobType: "Full-time",
    logo: "/images/ResuLogo.png",
    category: "Technology",
  },
  {
    id: "18",
    title: "Machine Learning Engineer",
    company: "Microsoft",
    location: "Bangalore, India",
    description:
      "Work on cutting-edge ML models to improve our products and services.",
    link: "https://careers.microsoft.com",
    source: "WellFound",
    salary: "₹30,00,000 - ₹50,00,000 per year",
    postedDate: "2 weeks ago",
    jobType: "Full-time",
    logo: "/images/microsoft_logo.png",
    category: "Technology",
  },
  {
    id: "19",
    title: "Mobile App Developer (Android)",
    company: "YouTube",
    location: "Gurgaon, India",
    description:
      "Build and maintain Android applications for YouTube platform.",
    link: "https://careers.google.com",
    source: "Naukri",
    salary: "₹20,00,000 - ₹35,00,000 per year",
    postedDate: "4 days ago",
    jobType: "Full-time",
    logo: "/images/yt_logo.png",
    category: "Technology",
  },
  {
    id: "20",
    title: "Frontend Developer Internship",
    company: "Flipkart",
    location: "Remote, India",
    description:
      "Join our frontend team to build engaging user experiences for our e-commerce platform.",
    link: "https://careers.flipkart.com",
    source: "InternShala",
    salary: "₹35,000 - ₹50,000 per month",
    postedDate: "3 days ago",
    jobType: "Internship",
    logo: "/images/flipkart_logo.png",
    category: "Technology",
  },
];

// In a real-world scenario, we would implement actual web scraping functions
// but for the prototype, we'll use mock data
async function scrapeJobs(
  query: string,
  location: string,
  jobType: string,
  category?: string
): Promise<JobListing[]> {
  // This would be where actual web scraping happens
  // Using cheerio and axios to scrape job listing websites from:
  // LinkedIn, Naukri.com, Monster, WellFound, InternShala, etc.

  // Sample scraping code for Naukri.com (would implement in a production app)
  // const fetchNaukriJobs = async () => {
  //   try {
  //     const response = await axios.get('https://www.naukri.com/jobs-in-india');
  //     const $ = cheerio.load(response.data);
  //     const jobs: JobListing[] = [];
  //
  //     $('.jobTuple').each((i, el) => {
  //       const title = $(el).find('.title').text().trim();
  //       const company = $(el).find('.companyInfo').text().trim();
  //       // More scraping logic...
  //
  //       jobs.push({
  //         id: `naukri-${i}`,
  //         title,
  //         company,
  //         // other fields...
  //         source: 'Naukri.com'
  //       });
  //     });
  //
  //     return jobs;
  //   } catch (error) {
  //     console.error('Error scraping Naukri.com:', error);
  //     return [];
  //   }
  // };

  // For this example, we'll just filter our mock data based on query parameters
  let filteredJobs = [...MOCK_JOBS];

  if (query) {
    const queryLower = query.toLowerCase();
    filteredJobs = filteredJobs.filter(
      (job) =>
        job.title.toLowerCase().includes(queryLower) ||
        job.company.toLowerCase().includes(queryLower) ||
        job.description.toLowerCase().includes(queryLower)
    );
  }

  if (location && location !== "remote") {
    const locationLower = location.toLowerCase();
    filteredJobs = filteredJobs.filter((job) =>
      job.location.toLowerCase().includes(locationLower)
    );
  }

  if (jobType && jobType !== "all") {
    const jobTypeLower = jobType.toLowerCase();
    filteredJobs = filteredJobs.filter((job) =>
      job.jobType?.toLowerCase().includes(jobTypeLower)
    );
  }

  if (category) {
    const categoryLower = category.toLowerCase();
    filteredJobs = filteredJobs.filter((job) =>
      job.category?.toLowerCase().includes(categoryLower)
    );
  }

  return filteredJobs;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "";
  const location = searchParams.get("location") || "";
  const jobType = searchParams.get("jobType") || "all";
  const category = searchParams.get("category") || "";

  try {
    const jobs = await scrapeJobs(query, location, jobType, category);

    return NextResponse.json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch job listings",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
