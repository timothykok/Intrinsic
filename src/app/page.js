"use client";

import Image from "next/image";
import Ticker from "./ui/Ticker.js";
import Financials from "./ui/Financials.js";
import Calculation from "./ui/Calculation";
import ShareValue from "./ui/ShareValue";
import Projection from "./ui/Projection";
import StockInfo from "./ui/StockInfo.js";

import { useState } from "react";

export default function Home() {
  const [ticker, setTicker] = useState("");

  const handleInputChange = (event) => {
    setTicker(event.target.value);
  };

  return (
    <>
      <Ticker Ticker={ticker} />

      <div className="title-wrapper">
        <h1 className="title"> Intrinsic. </h1>

        <input
          className="search-bar"
          type="text"
          placeholder="Enter Stock"
          onChange={handleInputChange}
        />
      </div>

      <StockInfo
        logoSrc="/path/to/logo.png"
        companyName="Apple"
        ticker="APPL"
        price={243.79}
        currency="USD"
        change={1.74}
        percentage={0.74}
        timestamp="At close at 11:59 UTC +11"
      />

      <Financials Ticker={ticker} />
      <Calculation Ticker={ticker} />
      <ShareValue Ticker={ticker} />
      <Projection Ticker = {ticker}/>
    </>
  );
}
