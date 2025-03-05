import JobSearch from "@/components/JobSearch";
import Filter from "@/components/Filter";
import AllJobs from "@/components/AllJobs";

export default function main() {
  return (
    <div className="p-6 min-h-screen">
      <JobSearch />
      <div className="flex gap-4 mt-6">
        <Filter />
        <AllJobs />
      </div>
    </div>
  );
}
