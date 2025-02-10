//home - page.js

"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import gsap from "gsap";
import axios from "axios";
import Ticker from "./ui/Ticker.js";
import DiscountedCashFlow from "./ui/DiscountedCashFlow.js";
import DCFCalculation from "./ui/DCFCalculation.js";
import ResidualCalculation from "./ui/ResidualCalculation.js";
import ResidualIncome from "./ui/ResidualIncome.js";
import ShareValue from "./ui/ShareValue";
import StockInfo from "./ui/StockInfo.js";
import Projection from "./ui/Projection.js";
import Footer from "./ui/Footer.js";

export default function Home() {
  const [input, setInput] = useState(""); // Raw input from the user
  const [ticker, setTicker] = useState(""); // Debounced ticker value

  const [selectedMethod, setSelectedMethod] = useState("DCF"); // Default to DCF method
  const [selectedCurrency, setSelectedCurrency] = useState("USD"); // Default to DCF method

  //Financials
  const [stockInfo, setStockInfo] = useState(null);
  const [freeCashFlowEquityData, setFreeCashFlowEquityData] = useState(null);
  const [fiveYearGrowthRate, setFiveYearGrowthRate] = useState(null);
  const [tenYearGrowthRate, setTenYearGrowthRate] = useState(null);
  const [longTermGrowthRate, setLongTermGrowthRate] = useState(null);



  const [financialData, setFinancialData] = useState({
    netIncome: null,
    currentEquity: 0,
    startEquity:0,

    depreciationAmortization: 0,
    capitalExpenditure: 0,
    changeInWorkingCapital: 0,
    netBorrowing: 0,
    beta: null,
    riskFreeRate: null,
    marketRiskPremium: null,
    sector: null,
  
  });
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

  const sectorPerformance = {
    "Basic Materials": 8.98,
    "Communication Services": 11.27,
    "Consumer Cyclical": 12.07,
    "Consumer Defensive": 10.92,
    "Energy": 6.18,
    "Financial Services": 12.07,
    "Healthcare": 12.45,
    "Industrials": 12.97,
    "Real Estate": 10.4,
    "Technology": 19.8,
    "Utilities": 10.05,
  };

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

  const handleMethodChange = (e) => {
    setSelectedMethod(e.target.value);
  };

  const handleCurrencyChange = (e) => {
    setSelectedCurrency(e.target.value);
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

  const fetchData = async (url) => {
    try {
      const response = await axios.get(url);
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching data from ${url}:`, error);
      return null;
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
          const stockProfileData = profileData[0];
          console.log("profile data =", stockProfileData);

          const stockQuoteData = quoteData[0];
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

  useEffect(() => {
    if (!ticker) return;

    const fetchFinancialData = async () => {
      const [
        profileData,
        balanceSheetData,
        incomeData,
        cashFlowData,
        ratioData,
        treasuryData,
        marketRiskData,
        outstandingSharesData
      ] = await Promise.all([
        fetchData(
          `https://financialmodelingprep.com/api/v3/profile/${ticker}?apikey=${fmpApiKey}`
        ),
        fetchData(
          `https://financialmodelingprep.com/api/v3/balance-sheet-statement/${ticker}?apikey=${fmpApiKey}`
        ),
        fetchData(
          `https://financialmodelingprep.com/api/v3/income-statement/${ticker}?period=annual&apikey=${fmpApiKey}`
        ),
        fetchData(
          `https://financialmodelingprep.com/api/v3/cash-flow-statement/${ticker}?period=annual&apikey=${fmpApiKey}`
        ),
        fetchData(
          `https://financialmodelingprep.com/api/v3/ratios/${ticker}?apikey=${fmpApiKey}`
        ),
        fetchData(
          `https://financialmodelingprep.com/api/v4/treasury?apikey=${fmpApiKey}`
        ),
        fetchData(
          `https://financialmodelingprep.com/api/v4/market_risk_premium?apikey=${fmpApiKey}`
        ),
        fetchData(
            `https://financialmodelingprep.com/api/v4/shares_float?symbol=${ticker}&apikey=${fmpApiKey}`
        ),
      ]);

      

      // Determine sector and set ten-year growth rate using the sectorPerformance mapping
      const sector = profileData?.[0]?.sector || null;

      const startEquity = balanceSheetData[1]?.totalStockholdersEquity || 0;
      const currentEquity = balanceSheetData[0]?.totalStockholdersEquity || 0;


// Compute the historical revenue growth rates if we have at least 2 years of data
let salesGrowthToPerpetuity = null;
if (incomeData && incomeData.length >= 2) {
  const growthRates = [];
  // Assuming incomeData is sorted with the most recent year first:
  for (let i = 0; i < Math.min(incomeData.length - 1, 5 - 1); i++) {
    const currentRevenue = parseFloat(incomeData[i].revenue);
    const previousRevenue = parseFloat(incomeData[i + 1].revenue);
    if (previousRevenue > 0) {
      const growth = (currentRevenue / previousRevenue - 1) * 100;
      growthRates.push(growth);
    }
  }
  if (growthRates.length > 0) {
    // Average the growth rates
    salesGrowthToPerpetuity =
      growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;
    // Optional: Cap or adjust the growth rate if needed (e.g., not more than 3-4%)
    salesGrowthToPerpetuity = Math.min(salesGrowthToPerpetuity, 4);
  }
}


      const tenYearGrowthRate = sectorPerformance[sector] || "N/A";
      setTenYearGrowthRate(tenYearGrowthRate.toFixed(2));

      // Retrieve net income and cash flow components
      const netIncome = incomeData?.[0]?.netIncome || 0;
      const mostRecentCashFlow = cashFlowData?.[0] || {};
      const netBorrowing =
        parseFloat(mostRecentCashFlow.commonStockIssued || 0) -
        parseFloat(mostRecentCashFlow.debtRepayment || 0);

      // Calculate five-year growth rate using ratios data
      const fiveYearGrowthRate = (() => {
        if (!ratioData || ratioData.length < 5) return "Insufficient data";
        const roeValues = ratioData
          .slice(0, 5)
          .map((year) => parseFloat(year.returnOnEquity || 0))
          .filter((roe) => !isNaN(roe) && roe > 0);
        if (roeValues.length === 0) return "Invalid data";
        const avgROE =
          roeValues.reduce((sum, roe) => sum + roe, 0) / roeValues.length;
        const payoutRatio = parseFloat(ratioData[0].payoutRatio || 0);
        if (isNaN(payoutRatio) || payoutRatio < 0 || payoutRatio > 1)
          return "Invalid data";
        return ((1 - payoutRatio) * avgROE * 100).toFixed(2);
      })();
      setFiveYearGrowthRate(fiveYearGrowthRate);

      // Retrieve risk-free rate and market risk premium from treasury and market data
      const riskFreeRate = parseFloat(treasuryData?.[0]?.year10) || null;


     
      const marketRiskPremium =
        marketRiskData?.find(
          (item) => item.country.toLowerCase() === "united states"
        )?.totalEquityRiskPremium || null;

        console.log("market risk premium HOME: " + marketRiskPremium )


        const outstandingShares = outstandingSharesData?.[0]?.outstandingShares || null;
        console.log("HOME OUTSTANDING SHARES: " + outstandingShares)
        setOutstandingShares(outstandingShares)

      // Update the financialData state object with all fetched metrics
      setFinancialData({
        netIncome,

        currentEquity,
        startEquity,



        depreciationAmortization:
          mostRecentCashFlow.depreciationAndAmortization || 0,
        capitalExpenditure: mostRecentCashFlow.capitalExpenditure || 0,
        changeInWorkingCapital: mostRecentCashFlow.changeInWorkingCapital || 0,
        netBorrowing,
        beta: profileData?.[0]?.beta || null,
        riskFreeRate,
        marketRiskPremium,
        sector,
        salesGrowthToPerpetuity,
      });

      // Set a default long-term growth rate (here, 3%)
      setLongTermGrowthRate(3);
    };

    fetchFinancialData();
  }, [ticker]);

   // 2️⃣ Compute Cost of Equity (CAPM)
    useEffect(() => {
      if (
        financialData.beta == null ||
        financialData.riskFreeRate == null ||
        financialData.marketRiskPremium == null
      )
        return;
  
      const calculatedCostOfEquity = (
        financialData.riskFreeRate +
        financialData.beta * financialData.marketRiskPremium
      ).toFixed(2);
  
      setCostOfEquity(calculatedCostOfEquity);
  
      // 🔹 Update financialData with Cost of Equity
      setFinancialData((prevData) => ({
        ...prevData,
        costOfEquity: calculatedCostOfEquity,
      }));
    }, [
      financialData.beta,
      financialData.riskFreeRate,
      financialData.marketRiskPremium,
    ]);
  
    // 4️⃣ Compute Free Cash Flow to Equity
    const calculatedFreeCashFlowEquity = useMemo(() => {
      const {
        netIncome,
        depreciationAmortization,
        capitalExpenditure,
        netBorrowing,
        changeInWorkingCapital
      } = financialData;
      return (
        netIncome + depreciationAmortization + capitalExpenditure + netBorrowing - changeInWorkingCapital
      );
    }, [financialData]);
  
    useEffect(() => {
      setFreeCashFlowEquityData(calculatedFreeCashFlowEquity);
    }, [calculatedFreeCashFlowEquity]);
 
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
              <p
                ref={errorRef}
                className="text-red-400 text-xs font-bold mt-2 ml-2"
              >
                {errorMessage}
              </p>
            )}
          </div>

          <div className="spacer h-8 mt-8"></div>
          <div className="w-[800px]">
            <div className="flex mr-auto space-x-4">
              <select
                value={selectedCurrency}
                onChange={handleCurrencyChange}
                className="border border-gray-300 rounded rounded-md px-4 py-2"
              >
                <option value="USD">USD</option>
                <option disabled value="EUR">
                  EUR (Coming Soon!){" "}
                </option>
                <option disabled value="AUD">
                  AUD (Coming Soon!){" "}
                </option>
                <option disabled value="JYP">
                  JYP (Coming Soon!){" "}
                </option>
                <option disabled value="MYR">
                  MYR (Coming Soon!){" "}
                </option>
              </select>

              <select
                value={selectedMethod}
                onChange={handleMethodChange}
                className="border border-gray-300 rounded  rounded-md w-[300px] px-4 py-2 shadow-sm"
              >
                <option
                  className="border border-gray-300 rounded  rounded-md  px-4 py-2"
                  value="DCF"
                >
                  Discounted Cash Flow
                </option>
                <option
                  className="border border-gray-300 rounded  rounded-md  px-4 py-2"
                  value="RI"
                >
                  Residual Income
                </option>
              </select>
            </div>
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

              {selectedMethod === "DCF" && (
                <>
                  <DiscountedCashFlow
                    ticker={ticker}
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
                    financialData={financialData}
                    setFinancialData={setFinancialData}
                  />

                  <DCFCalculation
                    ticker={ticker}
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
                    ticker={ticker}
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
                </>
              )}

              {selectedMethod === "RI" && (
                <>
                  <ResidualIncome
                    ticker={ticker}
                    netIncome={stockInfo.price} // Example calculation for net income
                    costOfEquity={costOfEquity}
                    financialData={financialData}
                  />

                  <ResidualCalculation
                    ticker={ticker}
                    costOfEquity={costOfEquity}
                    freeCashFlowEquityData={freeCashFlowEquityData}
                    longTermGrowthRate={longTermGrowthRate}
                    outstandingShares={outstandingShares}
                    setOutstandingShares={setOutstandingShares}
                    presentValue={presentValue}
                    financialData={financialData}
                    setPresentValue={setPresentValue}
                  />
                  <ShareValue
                    ticker={ticker}
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
                </>
              )}

              {/* <StockChart ticker={ticker} />    */}
            </div>
          </>
        )}
      </div>

      <Footer />
    </>
  );
}
