"use client";

import Link from "next/link";

interface ProfileDropdownProps {
  onClose: () => void;
  onSignOut: () => void;
}

export default function ProfileDropdown({ onClose, onSignOut }: ProfileDropdownProps) {
  return (
    <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-10">
      <div className="py-1">
        <Link
          href="/dashboard"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          onClick={onClose}
        >
          Dashboard
        </Link>
        <button
          onClick={() => {
            onSignOut();
            onClose();
          }}
          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}