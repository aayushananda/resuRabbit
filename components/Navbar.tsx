"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import Logo from "../public/images/ResuLogo.png";
import Link from "next/link";
import { Button } from "./Button";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Find Jobs", href: "/jobs" },
  { name: "Employees", href: "#" },
  { name: "Admin", href: "#" },
  { name: "About Us", href: "#" },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="bg-white" >
      <div className="py-5 px-8 mx-auto max-w-7xl">
        <div className="flex items-center justify-between space-x-1">
          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className="text-2xl font-bold flex items-center gap-1"
            >
              <Image src={Logo} width={50} height={50} alt="ResuLogo" />
              <p className="text-[#6300B3]">resuRabbit</p>
            </Link>
            <div className="hidden md:block">
              <div className="flex items-center space-x-6 font-semibold text-[#10101099]">
                <Link
                  href="/jobs"
                  className="hover:text-[#6300B3] hover:border-b-2 hover:border-b-[#6300B3] pb-1"
                >
                  Find Jobs
                </Link>
                <Link
                  href="/companies"
                  className="hover:text-[#6300B3] hover:border-b-2 hover:border-b-[#6300B3] pb-1"
                >
                  Companies
                </Link>
                <Link
                  href="/resume-builder"
                  className="hover:text-[#6300B3] hover:border-b-2 hover:border-b-[#6300B3] pb-1"
                >
                  Resume Builder
                </Link>
                <Link
                  href="/resume-scorer"
                  className="hover:text-[#6300B3] hover:border-b-2 hover:border-b-[#6300B3] pb-1"
                >
                  Resume Scorer
                </Link>
              </div>
            </div>
          </div>
          <div className="hidden md:flex md:items-center md:space-x-3">
            <Link href="/signup">
              <Button color="lime" iconName="signup">
                Sign Up
              </Button>
            </Link>
            <Link href="/login">
              <Button iconName="login">Login</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
