"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useMethod } from "../../../context/MethodContext";

import gsap from "gsap";
import axios from "axios";

export default function SearchNav() {
  // This search input is now used only to trigger a new search/navigation.
  const [input, setInput] = useState("");
  // The ticker is obtained from the URL (the slug). No need to set it manually.
  const { ticker } = useParams();
  const { selectedMethod, setSelectedMethod } = useMethod("C");

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const homeSelectedMethod = searchParams.get("selectedMethod");

  // When the query param is present, update the context:
  useEffect(() => {
    if (homeSelectedMethod && !selectedMethod) {
      setSelectedMethod(homeSelectedMethod);
    }
  }, []);

  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  // States for fetched financial data
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
    averagePeerPE: null,
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
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  //Error handling
  const inputRef = useRef(null); // Ref for GSAP shake effect
  const errorRef = useRef(null); // Ref for GSAP error message animation

  // Create a ref for StockInfo
  const stockInfoRef = useRef(null);

  const FMP_API = "/api/fmp";

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

  // --- Functions for UI effects ---

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
  // --- Search bar handling ---
  // When a user enters a new ticker and presses Enter, navigate to the new slug page.
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (!input.trim()) {
        setErrorMessage("Please enter a valid stock ticker.");
        triggerShake();
        triggerErrorMessage();
        return;
      }
      // Navigate to the new slug page; the ticker in the URL will update automatically.
      router.push(`/stocks/${input.toUpperCase().trim()}`);
      setErrorMessage(null);
      // Clear the input field (optional)
      setInput("");
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

  // This effect fetches the basic stock info when the URL ticker changes.
  useEffect(() => {
    if (!ticker) return;

    async function fetchStockInfo() {
      try {
        const [profileResponse, quoteResponse] = await Promise.all([
          axios.get(`${FMP_API}/api/v3/profile/${ticker}`),
          axios.get(`${FMP_API}/api/v3/quote/${ticker}`)
        ]);

        const profileData = profileResponse.data;
        const quoteData = quoteResponse.data;

        if (profileData?.length > 0 && quoteData?.length > 0) {
          const stockProfileData = profileData[0];
          const stockQuoteData = quoteData[0];

          setStockInfo({
            companyName: stockProfileData.companyName,
            price: stockProfileData.price,
            currency: stockProfileData.currency,
            change: stockQuoteData.change,
            percentage: stockQuoteData.changesPercentage,
            timestamp: stockQuoteData.timestamp,
            logoSrc: stockProfileData.image,
          });
          setErrorMessage(null);
        } else {
          setErrorMessage(`No matching results for "${ticker}"`);
          triggerShake();
          triggerErrorMessage();
          setStockInfo(null);
        }
      } catch (error) {
        console.error("Error fetching stock info:", error);
        setErrorMessage(
          "An error occurred while fetching data. Please try again."
        );
        triggerShake();
        triggerErrorMessage();
        setStockInfo(null);
      } finally {
        setLoading(false);
      }
    }

    setLoading(true);
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
        outstandingSharesData,
        peersData,
      ] = await Promise.all([
        fetchData(`${FMP_API}/stable/profile?symbol=${ticker}`),
        fetchData(`${FMP_API}/stable/balance-sheet-statement?symbol=${ticker}`),
        fetchData(`${FMP_API}/stable/income-statement?symbol=${ticker}&period=annual`),
        fetchData(`${FMP_API}/stable/cash-flow-statement?symbol=${ticker}&period=annual`),
        fetchData(`${FMP_API}/stable/ratios?symbol=${ticker}`),
        fetchData(`${FMP_API}/stable/treasury-rates`),
        fetchData(`${FMP_API}/stable/market-risk-premium`),
        fetchData(`${FMP_API}/stable/shares-float?symbol=${ticker}`),
        fetchData(`${FMP_API}/stable/stock-peers?symbol=${ticker}`),
      ]);

      //------------------------------------------------------------------------------------

      // Determine sector and set ten-year growth rate using the sectorPerformance mapping
      const sector = profileData?.[0]?.sector || null;

      const startEquity = balanceSheetData?.[1]?.totalStockholdersEquity || 0;
      const currentEquity = balanceSheetData?.[0]?.totalStockholdersEquity || 0;

      //------------------------------------------------------------------------------------

      // PE ratio
      const currentPrice = stockInfo?.price || 0;
      const peRatio = eps ? currentPrice / eps : 0;

      //------------------------------------------------------------------------------------

      // Extract and use peers data:
      const peers = peersData?.[0]?.peersList;
      let averagePeerPE = null;
      if (peers && peers.length > 0) {
        const peerSymbols = peers.join(",");
        const quotesResponse = await axios.get(
          `${FMP_API}/stable/batch-quote?symbols=${peerSymbols}`
        );
        const peerQuotes = quotesResponse.data;
        const validPeerQuotes = peerQuotes.filter(
          (peer) => peer.pe && peer.pe > 0
        );
        if (validPeerQuotes.length > 0) {
          averagePeerPE =
            validPeerQuotes.reduce((sum, peer) => sum + peer.pe, 0) /
            validPeerQuotes.length;
        }
      }

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

      const outstandingShares =
        outstandingSharesData?.[0]?.outstandingShares || null;
      console.log("HOME OUTSTANDING SHARES: " + outstandingShares);
      setOutstandingShares(outstandingShares);

      //------------------------------------------------------------------------------------

      // Update the financialData state object with all fetched metrics
      setFinancialData({
        netIncome,
        currentEquity,
        startEquity,
        peRatio,
        eps,
        averagePeerPE,
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
      {/* Mobile Navigation Header */}
      <div className="flex justify-between items-center gap-24 p-8 pt-12 lg:hidden ">
        <div className="w-full align-center justify-center flex-col">
          <div>
            <Link href="/">
              <img
                src="/Intrinsic..png"
                alt="Intrinsic Logo"
                className="w-[100px] h-[20px]"
              />
            </Link>
          </div>
          <div>
          <p>
          search bar
        </p>
          </div>
       
        </div>

       

        <div>
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
      </div>

      {/* Slide-Out Mobile Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-gray-100 z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4">
          <button onClick={() => setIsMobileMenuOpen(false)} className="mb-4">
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

      <div className="flex flex-row justify-between ml-[122px] mr-[122px] align-center pt-12 mb-2 items-center font-sm text-[#989898]  ">
        {/* Container for title and search bar */}
        <div className="w-7xl flex align-center gap-4 mt-6">
          {/* Title */}

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

          {/* Search Bar */}
          <div className="relative w-[450px] mb-4 text-[#989898] lg-hidden ">
            <input
              ref={inputRef}
              className="w-[450px] h-[40px] px-4 border border-[#E5E5E5] rounded-lg placeholder-gray-600 shadow-sm focus:ring-4 focus:ring-black outline-none focus:border-black transition-all "
              type="text"
              placeholder="Enter Stock Ticker (e.g., GOOG)                                                  ⌘K"
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
            <div className="absolute right-0 top-full mt-2 flex items-center text-[#989898]">
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
                  <option disabled>AUD (Coming Soon!)</option>
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
                    backgroundImage: `url('/down-arrow.svg')`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 6px center",
                    backgroundSize: "6px",
                  }}
                >
                  <option value="C">CONSOLIDATED</option>
                  <option value="DCF">DISCOUNTED CASH FLOW</option>
                  <option value="RI">RESIDUAL INCOME</option>
                  <option value="RV">RELATIVE VALUATION</option>
                </select>

                {/* Dropdown Icon (Absolutely Positioned) */}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 font-light text-xs text-[#949494] uppercase">
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
