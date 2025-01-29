//home - page.js

"use client";

import { useState, useEffect } from "react";
import Ticker from "./ui/Ticker.js";
import Financials from "./ui/Financials.js";
import Calculation from "./ui/Calculation";
import ShareValue from "./ui/ShareValue";
import StockInfo from "./ui/StockInfo.js";
import Projection from "./ui/Projection.js";
import Valuation from "./ui/Valuation.js";

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
        const profileResponse = await fetch(
          `https://financialmodelingprep.com/api/v3/profile/${ticker}?apikey=${fmpApiKey}`
        );
        const profileData = await profileResponse.json();
    
        const quoteResponse = await fetch(
          `https://financialmodelingprep.com/api/v3/quote/${ticker}?apikey=${fmpApiKey}`
        );
        const quoteData = await quoteResponse.json();
    
        if (profileData && profileData.length > 0 && quoteData && quoteData.length > 0) {
          const stockProfileData = profileData[0]; // Fix: Remove `.data`
          console.log("profile data =", stockProfileData);
    
          const stockQuoteData = quoteData[0]; // Fix: Remove `.data`
          console.log("stock quote data =", stockQuoteData);


          const formatMarketCloseTimeNY = (timestamp) => {
            const date = new Date(timestamp * 1000); // Convert from seconds to milliseconds
          
            const options = {
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'America/New_York', // New York timezone (ET)
              hour12: false, // Keep it in 24-hour format
            };
          
            const formattedTime = new Intl.DateTimeFormat('en-US', options).format(date);
            return `At close at ${formattedTime} ET`; // ET covers both EST and EDT
            
          };
        
  
          const marketCloseMessageNY = formatMarketCloseTimeNY(1738098001);
          console.log(marketCloseMessageNY);
    
          setStockInfo({
            companyName: stockProfileData.companyName,
            price: stockProfileData.price,
            currency: stockProfileData.currency,
            change: stockQuoteData.change, // Fix: change field name
            percentage: stockQuoteData.changesPercentage, // Fix: field name
            timestamp: marketCloseMessageNY,
            logoSrc: stockProfileData.image,
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
      <div className="spacer h-24"></div>
      <div className="title-wrapper flex flex-col items-center py-8 px-4">
        {/* Title Section */}
        <div className="title-container">
          <h1 className="title text-4xl font-bold text-gray-800">Intrinsic.</h1>
        </div>

        {/* Spacing Section */}
        <div className="spacer h-24"></div>

        {/* Search Bar Section */}
        <div className="search-bar-container">
          <input
            className="search-bar w-[800px] h-[40px] px-4 border border-gray-100 rounded-lg shadow-m placeholder-gray-600 "
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

          <Valuation
            Ticker={ticker}
            price={stockInfo.price}
            outStandingShares={outstandingShares}
            presentValue={presentValue}
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
