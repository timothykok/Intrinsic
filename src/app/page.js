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

  //Financials
  const [stockInfo, setStockInfo] = useState(null);
  const [freeCashFlowEquityData, setFreeCashFlowEquityData] = useState(null);
  const [fiveYearGrowthRate, setFiveYearGrowthRate] = useState(null);
  const [tenYearGrowthRate, setTenYearGrowthRate] = useState(null);
  const [longTermGrowthRate, setLongTermGrowthRate] = useState(null);

  //Calculation component
  const [outstandingShares, setOutstandingShares] = useState([]);
  const [presentValue, setPresentValue] = useState(null);

  const [costOfEquity, setCostOfEquity] = useState(null);

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

        // const logo_response = await fetch(`https://api.api-ninjas.com/v1/logo`);

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
      <div className="title-wrapper flex flex-col items-center py-8 px-4">
        {/* Title Section */}
        <div className="title-container">
          <h1 className="title text-4xl font-bold text-gray-800">Intrinsic.</h1>
        </div>

        {/* Spacing Section */}
        <div className="spacer h-12"></div>

        {/* Search Bar Section */}
        <div className="search-bar-container">
          <input
            className="search-bar w-[800px] h-10 px-4 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            type="text"
            placeholder="Enter Stock Ticker (e.g., GOOG)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
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
            setCostOfEquity={setCostOfEquity}
            costOfEquity={costOfEquity}
            setFreeCashFlowEquityData={setFreeCashFlowEquityData}
            freeCashFlowEquityData={freeCashFlowEquityData}
            fiveYearGrowthRate={fiveYearGrowthRate}
            setFiveYearGrowthRate={setFiveYearGrowthRate}
            setTenYearGrowthRate={setTenYearGrowthRate}
            tenYearGrowthRate={tenYearGrowthRate}
            setLongTermGrowthRate={setLongTermGrowthRate}
            longTermGrowthRate={longTermGrowthRate}
          />

          <Calculation
            Ticker={ticker}
            costOfEquity={costOfEquity}
            freeCashFlowEquityData={freeCashFlowEquityData}
            tenYearGrowthRate={tenYearGrowthRate}
            longTermGrowthRate={longTermGrowthRate}
            outstandingShares={outstandingShares}
            setOutstandingShares={setOutstandingShares}
            presentValue={presentValue}
            setPresentValue={setPresentValue}
          />
          <ShareValue
            Ticker={ticker}
            price={stockInfo.price}
            outStandingShares={outstandingShares}
            presentValue={presentValue}
          />
          <Projection
            Ticker={ticker}
            freeCashFlowEquityData={freeCashFlowEquityData}
            fiveYearGrowthRate={fiveYearGrowthRate}
            tenYearGrowthRate={tenYearGrowthRate}
            longTermGrowthRate={longTermGrowthRate}
          />

          {/* <NewFinancials Ticker ={ticker}/> */}
        </>
      )}
    </>
  );
}
