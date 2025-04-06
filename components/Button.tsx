import React from "react";
import clsx from "clsx";
import { CgSearch } from "react-icons/cg";
import {
  FaBuilding,
  FaFileAlt,
  FaStar,
  FaChartLine,
  FaSignInAlt,
  FaUserPlus,
} from "react-icons/fa";
import { MdWork, MdLocationOn, MdFilterList } from "react-icons/md";
import { HiRefresh } from "react-icons/hi";

type ButtonProps = {
  color?: "orange" | "purple" | "lime" | "primary";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  iconName?:
    | "search"
    | "job"
    | "resume"
    | "score"
    | "apply"
    | "view"
    | "filter"
    | "reset"
    | "login"
    | "signup"
    | "company"
    | "location";
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  href?: string;
  disabled?: boolean;
};

export function Button({
  color = "primary",
  size = "md",
  icon,
  iconName,
  children,
  className,
  onClick,
  type = "button",
  disabled = false,
  ...props
}: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  // Determine icon based on iconName prop
  let iconElement = icon;
  if (!icon && iconName) {
    switch (iconName) {
      case "search":
        iconElement = <CgSearch />;
        break;
      case "job":
        iconElement = <MdWork />;
        break;
      case "resume":
        iconElement = <FaFileAlt />;
        break;
      case "score":
        iconElement = <FaChartLine />;
        break;
      case "apply":
        iconElement = <FaStar />;
        break;
      case "view":
        iconElement = <FaFileAlt />;
        break;
      case "filter":
        iconElement = <MdFilterList />;
        break;
      case "reset":
        iconElement = <HiRefresh />;
        break;
      case "login":
        iconElement = <FaSignInAlt />;
        break;
      case "signup":
        iconElement = <FaUserPlus />;
        break;
      case "company":
        iconElement = <FaBuilding />;
        break;
      case "location":
        iconElement = <MdLocationOn />;
        break;
    }
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "button-cutout group mx-4 inline-flex items-center bg-gradient-to-b from-25% to-75% bg-[length:100%_400%] font-bold transition-[filter,background-position] duration-300 hover:bg-bottom",
        size === "sm" && "gap-2.5 py-2 text-base",
        size === "md" && "gap-3 px-1 text-lg py-2.5",
        size === "lg" && "text-xl gap-3 px-2 py-3",
        color === "orange" &&
          "from-brand-orange to-brand-lime text-black hover:text-black",
        color === "purple" &&
          "from-brand-purple to-brand-lime text-white hover:text-black",
        color === "lime" && "from-brand-lime to-brand-orange text-black",
        color === "primary" &&
          "from-primary to-brand-lime text-white hover:text-black",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
    >
      {iconElement && (
        <>
          <div
            className={clsx(
              "flex items-center justify-center transition-transform group-hover:-rotate-[25deg]",
              size === "sm" && "h-5 w-5",
              size === "md" && "h-6 w-6",
              size === "lg" && "h-8 w-8"
            )}
          >
            {iconElement}
          </div>
          <div className="w-px self-stretch bg-black/25" />
        </>
      )}
      {children}
    </button>
  );
}
