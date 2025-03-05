export default function Filter(){
  return (
    <div className="p-4 rounded-md w-1/4">
      <h3 className="text-xl font-semibold pb-4">Filter</h3>
      <div className="bg-[#F2F2F2] p-4 rounded-md">
        <label className="block mt-2">Salary Range</label>
        <div className="flex gap-2">
          <input className="border p-2 rounded w-full" placeholder="Min" />
          <input className="border p-2 rounded w-full" placeholder="Max" />
        </div>
        <h3 className="text-lg font-semibold mt-4">Job Type</h3>
        <div>
          <label className="block"><input type="checkbox" /> Full-Time</label>
          <label className="block"><input type="checkbox" /> Part-Time</label>
          <label className="block"><input type="checkbox" /> Internship</label>
        </div>
      </div>
    </div>
  );
};