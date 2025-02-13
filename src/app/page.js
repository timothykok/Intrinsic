"use client";

import { useState, useEffect, useRef, useMemo, useContext } from "react";

import { useMethod } from "../context/MethodContext.js";

import { useRouter } from "next/navigation";
import gsap from "gsap";
import axios from "axios";
import Ticker from "./ui/Ticker.js";

import Footer from "./ui/Footer.js";

export default function Home() {
  const [input, setInput] = useState(""); // Raw input from the user
  const [ticker, setTicker] = useState(""); // Debounced ticker value

  const router = useRouter();

  const [selectedMethod, setSelectedMethod] = useState(""); // Default to DCF method
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
    startEquity: 0,
    peRatio: null,
    eps: null,
    averagePeerPE:null,
    depreciationAmortization: 0,
    capitalExpenditure: 0,
    changeInWorkingCapital: 0,
    netBorrowing: 0,
    beta: null,
    riskFreeRate: null,
    marketRiskPremium: null,
    sector: null,
    peers: null,
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
    Energy: 6.18,
    "Financial Services": 12.07,
    Healthcare: 12.45,
    Industrials: 12.97,
    "Real Estate": 10.4,
    Technology: 19.8,
    Utilities: 10.05,
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
  const handleKeyDown = async (e) => {
    if (e.key === "Enter") {
      // If input is empty, trigger error and shake
      if (!input.trim()) {
        setErrorMessage("Please enter a valid stock ticker.");
        triggerShake();
        triggerErrorMessage();
        return;
      }

      // Convert input to uppercase and trim it
      const tickerInput = input.toUpperCase().trim();

      try {
        // Validate the ticker by fetching its profile data
        const profileResponse = await fetch(
          `https://financialmodelingprep.com/api/v3/profile/${tickerInput}?apikey=${fmpApiKey}`
        );
        const profileData = await profileResponse.json();

        // Check if we got valid data
        if (profileData && profileData.length > 0) {
          // Clear any previous errors and navigate to the slug page
          setErrorMessage(null);
          setTicker(tickerInput);
          setSelectedMethod(selectedMethod);
          // When navigating, include the selectedMethod in the query string:
          router.push(`/stocks/${tickerInput}?${selectedMethod}`);
        } else {
          // If no valid data, trigger error message and shake
          setErrorMessage(`No matching results for "${tickerInput}"`);
          triggerShake();
          triggerErrorMessage();
        }
      } catch (error) {
        console.error("Error validating ticker:", error);
        setErrorMessage(
          "An error occurred while verifying the ticker. Please try again."
        );
        triggerShake();
        triggerErrorMessage();
      }
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

  // Calculate PV of FCFE
  useEffect(() => {
    try {
      if (
        freeCashFlowEquityData !== null &&
        fiveYearGrowthRate !== null &&
        tenYearGrowthRate !== null &&
        longTermGrowthRate !== null &&
        costOfEquity !== null
      ) {
        let pv = 0;

        // 1. Convert growth rates to decimal form if needed
        const fiveYearG = fiveYearGrowthRate / 100;
        const tenYearG = tenYearGrowthRate / 100;
        const longTermG = longTermGrowthRate / 100;
        const coe = costOfEquity / 100;

        // 2. Calculate PV of FCFE from Year 1 to Year 5
        for (let t = 1; t <= 5; t++) {
          const projectedFCFE =
            freeCashFlowEquityData * Math.pow(1 + fiveYearG, t);
          const discountedFCFE = projectedFCFE / Math.pow(1 + coe, t);
          pv += discountedFCFE;
        }

        // 3. Calculate PV of FCFE from Year 6 to Year 10
        let fcfeYearN = freeCashFlowEquityData * Math.pow(1 + fiveYearG, 5); // Start from Year 5 FCFE
        for (let t = 6; t <= 10; t++) {
          fcfeYearN *= 1 + tenYearG; // Grow each year separately
          const discountedFCFE = fcfeYearN / Math.pow(1 + coe, t);
          pv += discountedFCFE;
        }

        // 4. Calculate Perpetuity Value at Year 11
        const fcfeYear10 = fcfeYearN; // Already grown to Year 10
        const perpetuityValue =
          (fcfeYear10 * (1 + longTermG)) / (coe - longTermG);
        const discountedPerpetuityValue =
          perpetuityValue / Math.pow(1 + coe, 10); // Discount to Year 0

        // 5. Add discounted perpetuity to PV
        pv += discountedPerpetuityValue;

        // 6. Set the final present value
        setPresentValue(parseFloat(pv.toFixed(2)));

        console.log("PRESENT VALUE: " + presentValue);
      }
    } catch (error) {
      console.log(error);
    }
  }, [
    freeCashFlowEquityData,
    fiveYearGrowthRate,
    tenYearGrowthRate,
    longTermGrowthRate,
    costOfEquity,
  ]);

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
        outstandingSharesData,
        peersData,
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

        fetchData(
          `https://financialmodelingprep.com/api/v4/stock_peers?symbol=${ticker}&apikey=${fmpApiKey}`
        ),
      ]);

      //------------------------------------------------------------------------------------

      // Determine sector and set ten-year growth rate using the sectorPerformance mapping
      const sector = profileData?.[0]?.sector || null;

      const startEquity = balanceSheetData[1]?.totalStockholdersEquity || 0;
      const currentEquity = balanceSheetData[0]?.totalStockholdersEquity || 0;

      //------------------------------------------------------------------------------------

      //outstanding shares
      const outstandingShares =
      outstandingSharesData?.[0]?.outstandingShares || null;
    console.log("HOME OUTSTANDING SHARES: " + outstandingShares);
    setOutstandingShares(outstandingShares);





      // PE ratio
      const currentPrice = stockInfo?.price || 0;
      const peRatio = eps ? currentPrice / eps : 0;

      
      //------------------------------------------------------------------------------------

      // Peer Data
      const peers = peersData.data[0]?.peersList;

      const peerSymbols = peers.join(",");
      const quotesResponse = await axios.get(
        `https://financialmodelingprep.com/api/v3/quote/${peerSymbols}?apikey=${fmpApiKey}`
      );
      const peerQuotes = quotesResponse.data;

      const validPeerQuotes = peerQuotes.filter((peer) => peer.pe && peer.pe > 0);
const averagePeerPE =
  validPeerQuotes.reduce((sum, peer) => sum + peer.pe, 0) /
  validPeerQuotes.length;

      //------------------------------------------------------------------------------------

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
            growthRates.reduce((sum, rate) => sum + rate, 0) /
            growthRates.length;
          // Optional: Cap or adjust the growth rate if needed (e.g., not more than 3-4%)
          salesGrowthToPerpetuity = Math.min(salesGrowthToPerpetuity, 4);
        }
      }

      //------------------------------------------------------------------------------------

      // Get ten year growthr rate from sector array
      const tenYearGrowthRate = sectorPerformance[sector] || "N/A";
      setTenYearGrowthRate(tenYearGrowthRate.toFixed(2));

      // Retrieve net income and cash flow components
      const netIncome = incomeData?.[0]?.netIncome || 0;
      const mostRecentCashFlow = cashFlowData?.[0] || {};
      const netBorrowing =
        parseFloat(mostRecentCashFlow.commonStockIssued || 0) -
        parseFloat(mostRecentCashFlow.debtRepayment || 0);

      //------------------------------------------------------------------------------------

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

      //------------------------------------------------------------------------------------

      // Retrieve risk-free rate and market risk premium from treasury and market data
      const riskFreeRate = parseFloat(treasuryData?.[0]?.year10) || null;

      const marketRiskPremium =
        marketRiskData?.find(
          (item) => item.country.toLowerCase() === "united states"
        )?.totalEquityRiskPremium || null;

      console.log("market risk premium HOME: " + marketRiskPremium);

     

      //------------------------------------------------------------------------------------

      // Update the financialData state object with all fetched metrics
      setFinancialData({
        netIncome,
        currentEquity,
        startEquity,
        peRatio,
        eps,
    averagePeerPE:null,
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


  //EPS
  const eps = useMemo(() => {
    if (!outstandingShares || !financialData.netIncome) return 0;
    return financialData.netIncome / outstandingShares;
  }, [outstandingShares, financialData.netIncome]);


  //Peers 
  useEffect(() => {
    const fetchAveragePeerPE = async () => {
      try {
        const peersResponse = await fetch(
          `https://financialmodelingprep.com/api/v4/stock_peers?symbol=${ticker}&apikey=${fmpApiKey}`
        );
        const peersData = await peersResponse.json();
        const peers = peersData[0]?.peersList;
        if (!peers || peers.length === 0) return;
  
        const peerSymbols = peers.join(",");
        const quotesResponse = await axios.get(
          `https://financialmodelingprep.com/api/v3/quote/${peerSymbols}?apikey=${fmpApiKey}`
        );
        const peerQuotes = quotesResponse.data;
        const validPeerQuotes = peerQuotes.filter(
          (peer) => peer.pe && peer.pe > 0
        );
        const averagePeerPE =
          validPeerQuotes.reduce((sum, peer) => sum + peer.pe, 0) /
          validPeerQuotes.length;
  
        setFinancialData((prevData) => ({
          ...prevData,
          averagePeerPE,
        }));
      } catch (error) {
        console.error("Error fetching peer data:", error);
      }
    };
  
    fetchAveragePeerPE();
  }, [ticker, fmpApiKey]);


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

    // Update financialData with Cost of Equity
    setFinancialData((prevData) => ({
      ...prevData,
      costOfEquity: calculatedCostOfEquity,
    }));
  }, [
    financialData.beta,
    financialData.riskFreeRate,
    financialData.marketRiskPremium,
    ticker,
  ]);

  // Compute Free Cash Flow to Equity
  const calculatedFreeCashFlowEquity = useMemo(() => {
    const {
      netIncome,
      depreciationAmortization,
      capitalExpenditure,
      netBorrowing,
      changeInWorkingCapital,
    } = financialData;
    return (
      netIncome +
      depreciationAmortization +
      capitalExpenditure +
      netBorrowing -
      changeInWorkingCapital
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

          {/* Search Bar Section */}
          <div className="relative w-[800px] mt-8 mb-4">
            <input
              ref={inputRef}
              className="w-full h-[40px] px-4 border border-[#E5E5E5] rounded-lg placeholder-gray-600 shadow-sm focus:ring-4 focus:ring-black outline-none focus:border-black transition-all"
              type="text"
              placeholder="Enter Stock Ticker (e.g., GOOG)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {errorMessage && (
              <p ref={errorRef} className="text-red-400 text-xs font-bold mt-2">
                {errorMessage}
              </p>
            )}

            {/* Dropdowns - Positioned Right Under Search Bar */}
            <div className="absolute right-0 top-full mt-4 flex items-center text-[#989898]">
              {/* Currency Dropdown */}
              <div className="relative">
                <select
                  value={selectedCurrency}
                  onChange={handleCurrencyChange}
                  className="w-[70px] px-2 py-1 bg-white appearance-none outline-none focus:underline font-medium pr-6"
                  style={{
                    backgroundImage: `url('/down-arrow.svg')`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 6px center",
                    backgroundSize: "6px",
                  }}
                >
                  <option value="USD">USD</option>
                  <option disabled>EUR (Coming Soon!)</option>
                </select>
              </div>

              {/* Divider - Moves closer when method dropdown is shorter */}
              <div className="h-full flex items-center text-[#989898] text-sm font-light mx-2 pl-2">
                |
              </div>

              {/* Method Dropdown - Auto-adjusting width based on selected option */}
              <div className="relative flex items-center">
                <select
                  value={selectedMethod}
                  onChange={handleMethodChange}
                  className="px-2 py-1 bg-white appearance-none outline-none focus:underline font-medium pr-8"
                  style={{
                    width: "max-content", // Ensures the width is only as wide as the text
                    minWidth: "120px", // Ensures a minimum width so UI is stable
                  }}
                >
                  <option value="DCF">DISCOUNTED CASH FLOW</option>
                  <option value="RI">RESIDUAL INCOME</option>
                  <option value="C">CONSOLIDATED</option>
                  <option value="Multiples">MULTIPLES</option>
                </select>

                {/* Dropdown Icon (Absolutely Positioned) */}
                <img
                  src="/down-arrow.svg"
                  alt="Dropdown Arrow"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-[6px]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
