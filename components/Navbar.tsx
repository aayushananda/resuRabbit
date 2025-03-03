'use client'

import { useState } from "react";
import Image from "next/image";
import Logo from "../public/images/ResuLogo.png";

const navigation = [
  { name: "Home", href: "#" },
  { name: "Find Jobs", href: "#" },
  { name: "Employees", href: "#" },
  { name: "Admin", href: "#" },
  { name: "About Us", href: "#" },
];

export default function Navbar() {
  const [active, setActive] = useState("Home");

  return (
    <div className="flex w-screen justify-evenly mt-4 items-center mb-4">
      <div className="flex gap-1 items-center">
        <Image src={Logo} width={60} height={60} alt="ResuLogo" />
        <h1 className="text-3xl text-[#6300B3] font-bold">ResuRabbit</h1>
      </div>
      <div>
        {navigation.map((item) => (
          <a
            key={item.name}
            href={item.href}
            onClick={() => setActive(item.name)}
            className={`m-4 px-3 py-2 rounded-md transition duration-300 ${
              active === item.name ? "text-[#6300B3]" : "text-black"
            }`}
          >
            {item.name}
          </a>
        ))}
      </div>
      <div className="flex gap-3">
        <button className="border-2 py-2 w-36 rounded-md border-[#6300B3] text-[#6300B3]">
          Contact Us
        </button>
        <button className="border-2 bg-[#6300B3] py-2 w-36 rounded-md border-[#6300B3] text-white">
          Login
        </button>
      </div>
    </div>
  );
}
