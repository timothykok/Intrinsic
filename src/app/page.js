//home - page.js

"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap"; 
import Ticker from "./ui/Ticker.js";
import Financials from "./ui/Financials.js";
import Calculation from "./ui/Calculation";
import ShareValue from "./ui/ShareValue";
import StockInfo from "./ui/StockInfo.js";
import Projection from "./ui/Projection.js";

import Footer from "./ui/Footer.js";


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

   //Error handling
   const [errorMessage, setErrorMessage] = useState(null);
   const inputRef = useRef(null); // Ref for GSAP shake effect
   const errorRef = useRef(null); // Ref for GSAP error message animation


  // Create a ref for StockInfo
  const stockInfoRef = useRef(null);

   // Function to trigger the shake effect
   const triggerShake = () => {
    gsap.killTweensOf(inputRef.current);
    if (inputRef.current) {
      gsap.fromTo(
        inputRef.current,
        { x: -6 }, // Start further left
        {
          x: 6, // Move further right
          duration: 0.1,
          repeat: 4, // Shake more times
          yoyo: true,
          ease: "power1.inOut",
        }
      );
    }
  };

   // Function to show error message with animation
   const triggerErrorMessage = () => {
    if (errorRef.current) {
      gsap.fromTo(
        errorRef.current,
        { opacity: 0, y: -10 }, // Start transparent & lifted
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" } // Smooth fade-in effect
      );
    }
  };


  // Handle search on Enter key press
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (!input.trim()) {
        setErrorMessage("Please enter a valid stock ticker.");
        triggerShake(); // Shake effect
        triggerErrorMessage(); // Error fade-in
        return;
      }

      setErrorMessage(null); // Clear previous errors
      setTicker(input.toUpperCase().trim());
    }
  };

  // Scroll to StockInfo component when stockInfo is updated
  useEffect(() => {
    if (stockInfo && stockInfoRef.current) {
      stockInfoRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [stockInfo]);

 

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

        if (
          profileData &&
          profileData.length > 0 &&
          quoteData &&
          quoteData.length > 0
        ) {
          const stockProfileData = profileData[0]; // Fix: Remove `.data`
          console.log("profile data =", stockProfileData);

          const stockQuoteData = quoteData[0]; // Fix: Remove `.data`
          console.log("stock quote data =", stockQuoteData);

          const formatMarketCloseTimeNY = (timestamp) => {
            const date = new Date(timestamp * 1000); // Convert from seconds to milliseconds

            const options = {
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "America/New_York", // New York timezone (ET)
              hour12: false, // Keep it in 24-hour format
            };

            const formattedTime = new Intl.DateTimeFormat(
              "en-US",
              options
            ).format(date);
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

          setErrorMessage(null); // Clear any previous error
        } else {
          setErrorMessage(`No matching results for "${ticker}"`); // Show error
          triggerShake();
          triggerErrorMessage();
          setStockInfo(null); // Clear stock data
        }
      } catch (error) {
        console.error("Error fetching stock info:", error);
        setErrorMessage(
          "An error occurred while fetching data. Please try again."
        );
        triggerShake();
        triggerErrorMessage();
        setStockInfo(null);
      }
    };

    fetchStockInfo();
  }, [ticker]);




  return (
    <>
      <div className="mb-64">
        <Ticker />
        <div className="spacer h-24"></div>
        <div className="title-wrapper flex flex-col items-center py-8 px-4">
          {/* Title Section */}
          <div className="title-container">
            {/* <h1 className="title text-4xl font-bold text-gray-800">Intrinsic.</h1> */}
            <img
              src="/Intrinsic..png"
              alt="View More"
              className="w-[716px] h-[140px]"
            />
          </div>

          {/* Spacing Section */}
          <div className="spacer h-8"></div>

          {/* Search Bar Section */}
          <div className="relative w-[800px] mx-auto">
            {/* Input Field */}
            <input
             ref={inputRef} // Attach ref for shake effect
             className=" relative w-full h-[40px] mt-8 px-4 border border-[#E5E5E5] rounded-lg placeholder-gray-600 shadow-sm focus:outline focus:outline-black focus:outline-[3.5px] focus:outline-offset-[-2px] transition-[outline-width,outline-color] delay-100"
              type="text"
              placeholder="Enter Stock Ticker (e.g., GOOG)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            
            />

            {errorMessage && (
              <p ref={errorRef} className="text-red-400 text-xs font-bold mt-2 ml-2">
                {errorMessage}
              </p>
            )}
          </div>
        </div>

        {stockInfo && (
          <>
            <div className="">
              <StockInfo
                ref={stockInfoRef}
                logoSrc={stockInfo.logoSrc}
                companyName={stockInfo.companyName}
                ticker={ticker}
                price={stockInfo.price}
                currency={stockInfo.currency}
                change={stockInfo.change}
                percentage={stockInfo.percentage}
                timestamp={stockInfo.timestamp}
                outStandingShares={outstandingShares}
                presentValue={presentValue}
              />

              {/* <Valuation
            Ticker={ticker}
            price={stockInfo.price}
            outStandingShares={outstandingShares}
            presentValue={presentValue}
          /> */}

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
                fiveYearGrowthRate={fiveYearGrowthRate}
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

      

            {/* <StockChart ticker={ticker} />    */}
            </div>
          </>
        )}
      </div>

      <Footer />
    </>
  );
}
