import Link from "next/link";
import Hero_png from "../public/images/Hero.png";
import Image from "next/image";
import InteractiveComponent from "./interactiveComponent";

export default function Hero() {
  return (
    <div className="relative">
      <div className="bg-[#C599E599]/40 h-[596px] flex flex-col items-center justify-center">
        <div className="w-[692px] flex items-center justify-center">
          <div className="w-[692px] flex-col">
            <h1 className="text-3xl font-semibold mb-1">
              Find a Job That Aligns With Your Interest and Skills
            </h1>
            <p className="text-sm">
              Thousands Of Jobs In All The Leading Sector Are Waiting For You
            </p>
            <div className="mt-6 bg-white px-2 py-3 rounded-lg flex items-center justify-between">
              <div className="flex gap-2">
                <input
                  placeholder="Job Title, KeyWord"
                  type="text"
                  className="w-40 px-3 outline-none"
                ></input>
                <input
                  placeholder="Location"
                  type="text"
                  className="w-40 px-3 outline-none"
                ></input>
              </div>
              <button className="border-2 bg-[#6300B3] py-2 w-32 border-[#6300B3] text-white font-semibold rounded-sm">
                Find Job
              </button>
            </div>
            <p className="text-sm mt-4">
              Suggestion: UI/UX Designer, Programing, Digital Marketing, Video,
              Animation.
            </p>
            <div className="mt-6 flex gap-6 pt-4">
              <Link href="/resume-builder">
                <button className="border-2 bg-[#6300B3] py-2 w-36 border-[#6300B3] text-white font-semibold rounded-sm">
                  Resume Builder
                </button>
              </Link>
              <Link href="/resume-scorer">
                <button className="border-2 bg-[#6300B3] py-2 w-36 border-[#6300B3] text-white font-semibold rounded-sm">
                  Resume Score
                </button>
              </Link>
            </div>
          </div>
          <Image src={Hero_png} height={400} width={400} alt="Hero Png"></Image>
        </div>
      </div>
      <div className="absolute inset-0 ">
        <InteractiveComponent />
      </div>
    </div>
  );
}
