"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import Logo from "../public/images/ResuLogo.png";
import Link from "next/link";

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
    <div className="flex w-screen justify-evenly mt-4 items-center mb-4">
      <div className="flex gap-1 items-center">
        <Image src={Logo} width={60} height={60} alt="ResuLogo" />
        <Link href="/"><h1 className="text-3xl text-[#6300B3] font-bold">ResuRabbit</h1></Link>
      </div>
      <div>
        {navigation.map((item) => (
          <a
            key={item.name}
            href={item.href}
            className={`m-4 px-3 py-2 rounded-md transition duration-300 ${
              pathname === item.href ? "text-[#6300B3]" : "text-black"
            }`}
          >
            {item.name}
          </a>
        ))}
      </div>
      <div className="flex gap-3">
        <Link href="/signup"><button className="border-2 py-2 w-36 rounded-md border-[#6300B3] text-[#6300B3]">
          Sign Up
        </button></Link>
        <Link href="/login"><button className="border-2 bg-[#6300B3] py-2 w-36 rounded-md border-[#6300B3] text-white">
          Login
        </button></Link>
      </div>
    </div>
  );
}
