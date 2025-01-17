"use client";

import { useState, useEffect } from "react";
import Ticker from "./ui/Ticker.js";
import Financials from "./ui/Financials.js";
import Calculation from "./ui/Calculation";
import ShareValue from "./ui/ShareValue";
import StockInfo from "./ui/StockInfo.js";
import Projection from "./ui/Projection.js";

export default function Home() {
  const [input, setInput] = useState(""); // Raw input from the user
  const [ticker, setTicker] = useState(""); // Debounced ticker value
  const [stockInfo, setStockInfo] = useState(null);

  const fmpApiKey = process.env.NEXT_PUBLIC_FINANCIAL_API_KEY;

  // Debounce the ticker input
  useEffect(() => {
    const timer = setTimeout(() => {
      setTicker(input.toUpperCase()); // Update the ticker after delay
    }, 500); // 500ms delay

    return () => clearTimeout(timer); // Clear timeout if input changes
  }, [input]);

  // Fetch stock info when the ticker changes
  useEffect(() => {
    const fetchStockInfo = async () => {
      if (!ticker) return; // Skip if ticker is empty

      try {
        const response = await fetch(
          `https://financialmodelingprep.com/api/v3/profile/${ticker}?apikey=${fmpApiKey}`
        );
        const data = await response.json();

        if (data && data.length > 0) {
          const stockData = data[0];
          setStockInfo({
            companyName: stockData.companyName,
            price: stockData.price,
            currency: stockData.currency,
            change: stockData.changes,
            percentage: (stockData.changes / stockData.price) * 100,
            timestamp: "At close at 11:59 UTC +11",
            logoSrc: stockData.image,
          });
        } else {
          setStockInfo(null); // Clear state if no valid data is returned
        }
      } catch (error) {
        console.error("Error fetching stock info:", error);
        setStockInfo(null);
      }
    };

    fetchStockInfo();
  }, [ticker]);

  return (
    <>
      <div className="title-wrapper">
        <h1 className="title">Intrinsic.</h1>
        <input
          className="search-bar"
          type="text"
          placeholder="Enter Stock Ticker (e.g., GOOG)"
          value={input}
          onChange={(e) => setInput(e.target.value)} // Update raw input
        />
      </div>

      {stockInfo && (
        <>
          <StockInfo
            logoSrc={stockInfo.logoSrc}
            companyName={stockInfo.companyName}
            ticker={ticker}
            price={stockInfo.price}
            currency={stockInfo.currency}
            change={stockInfo.change}
            percentage={stockInfo.percentage}
            timestamp={stockInfo.timestamp}
          />
          <Financials Ticker={ticker} />
          <Calculation Ticker={ticker} />
          <ShareValue Ticker={ticker} />
          <Projection Ticker={ticker} />
        </>
      )}
    </>
  );
}