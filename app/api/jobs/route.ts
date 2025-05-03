import { NextResponse, NextRequest } from "next/server";
import jobs from "./jobs.json"

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

const MOCK_JOBS: JobListing[] = jobs

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
