"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useMethod } from "../../../context/MethodContext";

import gsap from "gsap";
import axios from "axios";

export default function HomeNav() {
  return (
    <>
      <div className="flex flex-row justify-between ml-[122px] mr-[122px] align-center pt-12 items-center font-sm ">

        <div className="pt-2">
          <Link href="/">
            <img
              src="/Intrinsic..png"
              alt="View More"
              className="w-[100px] h-[20px]"
              href="/"
            />
          </Link>
        </div>

        <div className="flex gap-2 font-normal text-sm text-[#949494]">
          <div className="hover:bg-[#EEEEEE]  hover:font-sm hover:text-stone-500  p-2 rounded-md pr-4 pl-4">
            <Link href="/"> Resources </Link>
          </div>

          <div className="hover:bg-[#EEEEEE]  hover:font-sm hover:text-stone-500  p-2 rounded-md pr-4 pl-4">
            <Link href="/"> Watchlist </Link>
          </div>

          <div className="hover:bg-[#EEEEEE]  hover:font-sm hover:text-stone-500  p-2 rounded-md pr-4 pl-4">
            <Link href="/"> Login </Link>
          </div>
        </div>
      </div>
    </>
  );
}
