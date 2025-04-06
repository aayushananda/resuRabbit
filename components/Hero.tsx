import Link from "next/link";
import InteractiveComponent from "./interactiveComponent";
import { Button } from "./Button";

export default function Hero() {
  return (
    <div className="relative">
      <div className="bg-[#C599E599]/40 h-[596px] flex flex-col items-center justify-center">
        <div className="max-w-4xl w-full px-4 md:px-0 flex flex-col items-center">
          <div className="flex-col text-center">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-3">
              Find a Job That Aligns With Your Interest and Skills
            </h1>
            <p className="text-sm md:text-base mb-6">
              Thousands Of Jobs In All The Leading Sector Are Waiting For You
            </p>
            <div className="mt-6 bg-white px-4 py-4 rounded-lg flex flex-col md:flex-row items-center justify-between w-full gap-3">
              <div className="flex flex-col md:flex-row w-full gap-2">
                <input
                  placeholder="Job Title, KeyWord"
                  type="text"
                  className="w-full md:w-auto px-3 py-2 border rounded-md outline-none"
                ></input>
                <input
                  placeholder="Location"
                  type="text"
                  className="w-full md:w-auto px-3 py-2 border rounded-md outline-none"
                ></input>
              </div>
              <Link href="/jobs">
                <Button size="sm" color="purple" iconName="search">
                  Find Job
                </Button>
              </Link>
            </div>
            <p className="text-sm mt-4">
              Suggestion: UI/UX Designer, Programming, Digital Marketing, Video,
              Animation.
            </p>
            <div className="mt-6 flex flex-col md:flex-row gap-4 pt-4 justify-center">
              <Link href="/resume-builder" className="w-full md:w-auto">
                <Button color="lime" iconName="resume">
                  Resume Builder
                </Button>
              </Link>
              <Link href="/resume-scorer" className="w-full md:w-auto">
                <Button iconName="score">Resume Score</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 pt-20 pl-0 md:pl-52">
        <div className="w-full h-full">
          <InteractiveComponent position={[2.4, -0.35, 0]} scale={0.25} />
        </div>
      </div>
    </div>
  );
}
