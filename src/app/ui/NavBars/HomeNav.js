"use client";

import Link from "next/link";
import { useState } from "react";

export default function HomeNav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Navigation Header */}
      <div className="flex justify-between items-center px-4 pt-12 md:hidden">
        <Link href="/">
          <img
            src="/Intrinsic..png"
            alt="Intrinsic Logo"
            className="w-[100px] h-[20px]"
          />
        </Link>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {/* Hamburger Icon */}
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Slide-Out Mobile Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-gray-100 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4">
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="mb-4"
          >
            {/* Close Icon */}
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="py-2">Resources</div>
          </Link>
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="py-2">Watchlist</div>
          </Link>
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="py-2">Login</div>
          </Link>
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex justify-between items-center  md:mx-[122px] pt-12 font-sm">
        <div>
          <Link href="/">
            <img
              src="/Intrinsic..png"
              alt="Intrinsic Logo"
              className="w-[100px] h-[20px]"
            />
          </Link>
        </div>
        <div className="flex gap-2 font-normal text-sm text-[#949494]">
          <div className="hover:bg-[#EEEEEE] p-2 rounded-md pr-4 pl-4">
            <Link href="/">Resources</Link>
          </div>
          <div className="hover:bg-[#EEEEEE] p-2 rounded-md pr-4 pl-4">
            <Link href="/">Watchlist</Link>
          </div>
          <div className="hover:bg-[#EEEEEE] p-2 rounded-md pr-4 pl-4">
            <Link href="/">Login</Link>
          </div>
        </div>
      </div>
    </>
  );
}