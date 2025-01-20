//home - page.js

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
  const [initialFCFE, setInitialFCFE] = useState(null);
  const [growthRate, setGrowthRate] = useState(null);
  const [discountRate, setDiscountRate] = useState(null);

  const fmpApiKey = process.env.NEXT_PUBLIC_FINANCIAL_API_KEY;

  // Handle search on Enter key press
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      setTicker(input.toUpperCase());
    }
  };

  // Fetch stock info when the ticker changes
  useEffect(() => {
    const fetchStockInfo = async () => {
      if (!ticker) return; // Skip if ticker is empty

      try {
        const response = await fetch(
          `https://financialmodelingprep.com/api/v3/profile/${ticker}?apikey=${fmpApiKey}`
        );
        const data = await response.json();

        const logo_response = await fetch(`https://api.api-ninjas.com/v1/logo`);

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
      <Ticker />
      <div className="title-wrapper">
        <h1 className="title">Intrinsic.</h1>
        <input
          className="search-bar"
          type="text"
          placeholder="Enter Stock Ticker (e.g., GOOG)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
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
          <Financials
            Ticker={ticker}
            setInitialFCFE={setInitialFCFE}
            setGrowthRate={setGrowthRate}
            setDiscountRate={setDiscountRate}
          />
          <Calculation
            Ticker={ticker}
            discountRate={discountRate}
            initialFCFE={initialFCFE}
            growthRate={growthRate}
          />
          <ShareValue Ticker={ticker} />
          <Projection Ticker={ticker} />
        </>
      )}
    </>
  );
}
