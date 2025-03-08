//stockpage - page.js

"use client";

import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useSuspense,
  Suspense,
} from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";

import { useMethod } from "../../../context/MethodContext";

import gsap from "gsap";
import axios from "axios";

import Ticker from "../../ui/Ticker.js";
import DiscountedCashFlow from "../../ui/DCF/DiscountedCashFlow.js";
import DCFCalculation from "../../ui/DCF/DCFCalculation.js";
import DCFValue from "../../ui/DCF/DCFValue";
import ResidualCalculation from "../../ui/Residual/ResidualCalculation.js";
import ResidualIncome from "../../ui/Residual/ResidualIncome.js";
import ResidualValue from "@/app/ui/Residual/ResidualValue";
import ShareValue from "../../ui/DCF/DCFValue";
import StockInfo from "../../ui/StockInfo.js";
import Projection from "../../ui/Projection.js";
import Multiples from "@/app/ui/Multiples/Multiples";
import MultiplesValue from "@/app/ui/Multiples/MultiplesValue";
import Footer from "../../ui/Footer.js";
import SearchNav from "@/app/ui/NavBars/SearchNav";
import Consolidated from "@/app/ui/Consolidated";
import Financials from "@/app/ui/Financials";

export default function StockPage() {
  // This search input is now used only to trigger a new search/navigation.
  const [input, setInput] = useState("");
  // The ticker is obtained from the URL (the slug). No need to set it manually.
  const { ticker } = useParams();
  const { selectedMethod, setSelectedMethod } = useMethod("C");

  const router = useRouter();
  const searchParams = useSearchParams();
  const homeSelectedMethod = searchParams.get("selectedMethod");


  const currentYear = new Date().getFullYear()
  console.log("current Year" + currentYear)

  // When the query param is present, update the context:
  useEffect(() => {
    if (homeSelectedMethod && !selectedMethod) {
      setSelectedMethod(homeSelectedMethod);
    }
  }, [homeSelectedMethod, selectedMethod]);

  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  // States for fetched financial data
  const [stockInfo, setStockInfo] = useState(null);
  const [freeCashFlowEquityData, setFreeCashFlowEquityData] = useState(null);

  const [freeCashFlowFirmData, setFreeCashFlowFirmData] = useState(null);

  // States for all present values to average out in consoli value
  const [dcfValuePresentValue, setDCFPresentValue] = useState(null);
  const [residualIncomePresentValue, setResidualIncomePresentValue] =
    useState(null);
  const [multiplesPresentValue, setMultiplesPresentValue] = useState(null);
  const [consolidatedPresentValue, setConsolidatedPresentValue] =
    useState(null);
  // const [outstandingShares, setOutstandingShares] = useState([]);
  const [presentValue, setPresentValue] = useState(null);
  const [costOfEquity, setCostOfEquity] = useState(null);

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
    netDebtIssuance: 0,
    beta: null,

    currentRatio: 0,
    totalDebt: 0,
    debtToEbitda: 0,
    debtServicingRatio: 0,
    afterTaxCostOfDebt:0,
    equityWeighting:0,
    debtWeighting:0,

    fiveYearGrowthRate: null,
    tenYearGrowthRate: null,
    longTermGrowthRate: null,
    discountedCashFlow: 0,

    outstandingShares: null,
    riskFreeRate: null,
    marketRiskPremium: null,
    sector: null,
    peers: null,

    freeCashFlowFirm: null,


    last5Income: [],
    last5CashFlow: [],
    last5Ratios: [],
  });

  //Calculation component

  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState(null);

  //Error handling
  const inputRef = useRef(null); // Ref for GSAP shake effect
  const errorRef = useRef(null); // Ref for GSAP error message animation

  // Create a ref for StockInfo
  const stockInfoRef = useRef(null);

  const fmpApiKey = process.env.NEXT_PUBLIC_FINANCIAL_API_KEY;

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
    const newMethod = e.target.value;
    if (newMethod === "C") {
      // Temporarily set the method to DCF first.
      setSelectedMethod("DCF");
      // After a short delay, switch to Consolidated.
      setTimeout(() => {
        setSelectedMethod("C");
      }, 50);
    } else {
      setSelectedMethod(newMethod);
    }
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

  //on mount render to DCF and then to C
  useEffect(() => {
    if (selectedMethod === "C") {
      // Temporarily set the method to DCF first.
      setSelectedMethod("DCF");
      console.log("DCF Switch: " + selectedMethod);
      // After a short delay, switch to Consolidated.
      setTimeout(() => {
        setSelectedMethod("C");
        console.log("Consolidated switch back: " + selectedMethod);
      }, 50);
    }
  }, []);

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
    // If no ticker is present, do nothing.
    if (!ticker) return;

    async function fetchStockInfo() {
      try {
        const profileResponse = await fetch(
          `https://financialmodelingprep.com/stable/profile?symbol=${ticker}&apikey=${fmpApiKey}`
        );
        const profileData = await profileResponse.json();

        const quoteResponse = await fetch(
          `https://financialmodelingprep.com/stable/quote?symbol=${ticker}&apikey=${fmpApiKey}`
        );
        const quoteData = await quoteResponse.json();

        if (
          profileData &&
          profileData.length > 0 &&
          quoteData &&
          quoteData.length > 0
        ) {
          const stockProfileData = profileData[0];
          const stockQuoteData = quoteData[0];

          const formatMarketCloseTimeNY = (timestamp) => {
            const date = new Date(timestamp * 1000);
            const options = {
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "America/New_York",
              hour12: false,
            };
            const formattedTime = new Intl.DateTimeFormat(
              "en-US",
              options
            ).format(date);
            return `At close at ${formattedTime} ET`;
          };

          const marketCloseMessageNY = formatMarketCloseTimeNY(1738098001);

          setStockInfo({
            companyName: stockProfileData.companyName,
            price: stockProfileData.price,
            currency: stockProfileData.currency,
            change: stockQuoteData.change,
            percentage: stockQuoteData.changesPercentage,
            timestamp: marketCloseMessageNY,
            logoSrc: stockProfileData.image,
          });
          setErrorMessage(null);
        } else {
          setErrorMessage(`No matching results for "symbol=${ticker}"`);
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
  }, [ticker, fmpApiKey]);

  useEffect(() => {
    if (!ticker) return;

    const fetchFinancialData = async () => {
      const [
        profileData,
        quoteData,
        balanceSheetData,
        incomeData,
        cashFlowData,
        cashFlowGrowthData,
        discountedCashFlowData,
        customDiscountedCashFlowData,
        ratioData,
        treasuryData,
        marketRiskData,
        outstandingSharesData,
        peersData,
      ] = await Promise.all([
        fetchData(
          `https://financialmodelingprep.com/stable/profile?symbol=${ticker}&apikey=${fmpApiKey}`
        ),
        fetchData(
          `https://financialmodelingprep.com/stable/quote?symbol=${ticker}&apikey=${fmpApiKey}`
        ),
        fetchData(
          `https://financialmodelingprep.com/stable/balance-sheet-statement?symbol=${ticker}&apikey=${fmpApiKey}`
        ),
        fetchData(
          `https://financialmodelingprep.com/stable/income-statement?symbol=${ticker}&period=annual&apikey=${fmpApiKey}`
        ),

        fetchData(
          `https://financialmodelingprep.com/stable/cash-flow-statement?symbol=${ticker}&apikey=${fmpApiKey}`
        ),
        fetchData(
          `https://financialmodelingprep.com/stable/cash-flow-statement-growth?symbol=${ticker}&period=annual&apikey=${fmpApiKey}`
        ),
        fetchData(
          `https://financialmodelingprep.com/stable/discounted-cash-flow?symbol=${ticker}&apikey=${fmpApiKey}`
        ),
        fetchData(
          `https://financialmodelingprep.com/stable/custom-discounted-cash-flow?symbol=${ticker}&apikey=${fmpApiKey}`
        ),

        fetchData(
          `https://financialmodelingprep.com/stable/ratios?symbol=${ticker}&apikey=${fmpApiKey}`
        ),
        fetchData(
          `https://financialmodelingprep.com/stable/treasury?apikey=${fmpApiKey}`
        ),
        fetchData(
          `https://financialmodelingprep.com/stable/market_risk_premium?apikey=${fmpApiKey}`
        ),
        fetchData(
          `https://financialmodelingprep.com/stable/shares_float?symbol=symbol=${ticker}&apikey=${fmpApiKey}`
        ),

        fetchData(
          `https://financialmodelingprep.com/stable/stock_peers?symbol=symbol=${ticker}&apikey=${fmpApiKey}`
        ),
      ]);

      //------------------------------------------------------------------------------------

      //EPS
      const eps = quoteData[0].eps;

      //------------------------------------------------------------------------------------
      // 5 YEAR HISTORICAL DATA EXTRACTION

      const last5Income = (incomeData?.slice(0, 6) || []).reverse();
      const last5CashFlow = (cashFlowData?.slice(0, 6) || []).reverse();
      const last5Ratios = (ratioData?.slice(0, 6) || []).reverse();

      const salesHistory = last5Income.map((item) => ({
        year: item.date?.slice(0, 5), // e.g. "2022"
        value: item.revenue,
      }));

      const netIncomeHistory = last5Income.map((item) => ({
        year: item.date?.slice(0, 5),
        value: item.netIncome,
      }));

      const epsHistory = last5Income.map((item) => ({
        year: item.date?.slice(0, 5),
        value: item.eps, // or item.epsDiluted
      }));

      const cfoHistory = last5CashFlow.map((item) => ({
        year: item.date?.slice(0, 5),
        value: item.netCashProvidedByOperatingActivities,
      }));

      const roeHistory = last5Ratios.map((item) => ({
        year: item.date?.slice(0, 5),
        value: item.returnOnEquity, // FMP typically uses decimal form, e.g. 0.15 => 15%
      }));

      const roicHistory = last5Ratios.map((item) => ({
        year: item.date?.slice(0, 5),
        value: item.returnOnInvestedCapital, // property name may vary
      }));

      //------------------------------------------------------------------------------------

      //Current Ratio
      const currentRatio = ratioData[0]?.currentRatio || 0;

      //Debt to Ebitda Ratio

      const totalDebt = balanceSheetData[0]?.totalDebt || 0;

      const ebitda = incomeData[0]?.ebitda;

      const debtToEbitda = totalDebt / ebitda;

      const debtServicingRatio = "working on it";

      // Debt Servicing Ratio

      const operatingIncome = incomeData[0]?.operatingIncome;

      //------------------------------------------------------------------------------------

      // Determine sector and set ten-year growth rate using the sectorPerformance mapping
      const sector = profileData?.[0]?.sector || null;

      const startEquity = balanceSheetData[1]?.totalStockholdersEquity || 0;
      const currentEquity = balanceSheetData[0]?.totalStockholdersEquity || 0;

      //------------------------------------------------------------------------------------

      // PE ratio
      const currentPrice = stockInfo?.price || 0;
      const peRatioUnformatted = eps ? currentPrice / eps : 0;
      const peRatio = peRatioUnformatted.toFixed(2);

      //------------------------------------------------------------------------------------

      // Extract and use peers data:
      const peers = peersData[0]?.peersList;

      console.log("PEERS: " + peers);
      let averagePeerPE = null;
      if (peers && peers.length > 0) {
        const peerSymbols = peers.join(",");
        const quotesResponse = await axios.get(
          `https://financialmodelingprep.com/stable/quote/symbol=${peerSymbols}&apikey=${fmpApiKey}`
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

      const longTermGrowthRate = 3;

      // Retrieve net income and cash flow components
      const netIncome = incomeData?.[0]?.netIncome || 0;
      const mostRecentCashFlow = cashFlowData?.[0] || 0;

      const netDebtIssuance = parseFloat(
        mostRecentCashFlow?.netDebtIssuance || 0
      );

      console.log("netDebtIssuance  (not showing)" + netDebtIssuance);

      //------------------------------------------------------------------------------------

      // Retrieving five year cash growth rate from API
      const fiveYearGrowthRateUnformatted =
        cashFlowGrowthData?.[0]?.growthFreeCashFlow || 0;
      console.log(
        "fiveYearGrowthRateUnformatted" + fiveYearGrowthRateUnformatted
      );

      const fiveYearGrowthRate = parseFloat(
        fiveYearGrowthRateUnformatted * 100
      ).toFixed(2);

      //------------------------------------------------------------------------------------

      //Total Debt

      //------------------------------------------------------------------------------------


      // OLD MARKET RISK PREMIUM

      // const marketRiskPremium =
      //   marketRiskData?.find(
      //     (item) => item.country.toLowerCase() === "united states"
      //   )?.totalEquityRiskPremium || null;

      

      const outstandingShares =
        outstandingSharesData?.[0]?.outstandingShares || null;

      //------------------------------------------------------------------------------------
      // Retrieve Free Cash Flow to Firm
      const discountedCashFlow = discountedCashFlowData?.[0]?.dcf || 0;

      //------------------------------------------------------------------------------------

      //Compute FCFF

      // const depreciationAmortization =

      const freeCashFlowFirm = "EBIT x (1- ";

      //------------------------------------------------------------------------------------



      // Risk Free Rate + Market Risk Premium + after Tax Cost Of Debt
      const currentYearData = customDiscountedCashFlowData?.find(
        (item) => item.year === currentYear.toString()
      );
      const riskFreeRate = currentYearData ? currentYearData.riskFreeRate : 0;
      const marketRiskPremium = currentYearData ? currentYearData.marketRiskPremium : 0;
      const afterTaxCostOfDebt = currentYearData ? currentYearData.afterTaxCostOfDebt : 0;
      const equityWeighting = currentYearData ? currentYearData.equityWeighting : 0;
      const debtWeighting = currentYearData ? currentYearData.debtWeighting : 0;

      console.log("afterTaxCostOfDebt :" + afterTaxCostOfDebt)




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
        netDebtIssuance,
        beta: profileData?.[0]?.beta || null,

        currentRatio,
        totalDebt,
        debtToEbitda,
        debtServicingRatio,
        afterTaxCostOfDebt,
        equityWeighting,
        debtWeighting,

        fiveYearGrowthRate,
        tenYearGrowthRate,
        longTermGrowthRate,
        discountedCashFlow,
        outstandingShares,
        riskFreeRate,
        marketRiskPremium,
        sector,
        salesGrowthToPerpetuity,

        freeCashFlowFirm,

        salesHistory,
        netIncomeHistory,
        epsHistory,
        cfoHistory,
        roeHistory,
        roicHistory,
      });
    };

    fetchFinancialData();
  }, [ticker, fmpApiKey]);

  //------------------------------------------------------------------------------------

  const eps = financialData.eps || 0;
  

  //--------------------------
  // MULTIPLES PRESENT VALUE
  //--------------------------
  let multiplesPresentValueCalculated = null;

  function calculateMultiplesPresentValue() {
    console.log("----- Multiples Calculation Start -----");
    console.log(
      "eps:",
      eps,
      "financialData.averagePeerPE:",
      financialData.averagePeerPE
    );
    multiplesPresentValueCalculated = eps * financialData.averagePeerPE;
    console.log(
      "Calculated Multiples Present Value:",
      multiplesPresentValueCalculated
    );
    setMultiplesPresentValue(multiplesPresentValueCalculated);
  }

  useEffect(() => {
    console.log("Multiples useEffect running...");
    calculateMultiplesPresentValue();
  }, [
    financialData.outstandingShares,
    setPresentValue,
    setMultiplesPresentValue,
  ]);

  //--------------------------
  // RESIDUAL INCOME PRESENT VALUE
  //--------------------------
  function calculateResidualPresentValue() {
    console.log("----- Residual Income Calculation Start -----");
    console.log("ticker:", ticker);
    console.log("financialData.netIncome:", financialData.netIncome);
    console.log("financialData.currentEquity:", financialData.currentEquity);
    console.log("costOfEquity:", costOfEquity);
    console.log(
      "financialData.longTermGrowthRate:",
      financialData.longTermGrowthRate
    );

    try {
      if (
        !ticker ||
        financialData.netIncome === null ||
        financialData.currentEquity === null ||
        costOfEquity === null ||
        financialData.longTermGrowthRate === null
      )
        return console.log("Residual Income: Missing required values.");

      const coeDecimal = costOfEquity / 100;
      const g = financialData.longTermGrowthRate / 100;
      const startingRI =
        financialData.netIncome - financialData.currentEquity * coeDecimal;
      console.log("Starting Residual Income (startingRI):", startingRI);

      const forecastYears = 5;
      let pvResidualIncome = 0;
      for (let t = 1; t <= forecastYears; t++) {
        const RI_t = startingRI * Math.pow(1 + g, t);
        const discountedRI = RI_t / Math.pow(1 + coeDecimal, t);
        console.log(`Year ${t} - RI_t: ${RI_t}, discountedRI: ${discountedRI}`);
        pvResidualIncome += discountedRI;
      }

      const RI_final = startingRI * Math.pow(1 + g, forecastYears);
      const terminalValue = (RI_final * (1 + g)) / (coeDecimal - g);
      const discountedTerminalValue =
        terminalValue / Math.pow(1 + coeDecimal, forecastYears);
      console.log(
        "Terminal Value:",
        terminalValue,
        "Discounted Terminal Value:",
        discountedTerminalValue
      );

      pvResidualIncome += discountedTerminalValue;
      const totalResidualValue = financialData.currentEquity + pvResidualIncome;
      console.log(
        "Final Residual Income Present Value:",
        parseFloat(totalResidualValue.toFixed(2))
      );
      setResidualIncomePresentValue(parseFloat(totalResidualValue.toFixed(2)));
    } catch (error) {
      console.log("Error in calculateResidualPresentValue:", error);
    }
  }

  useEffect(() => {
    try {
      if (
        !ticker ||
        financialData.netIncome === null ||
        financialData.currentEquity === null ||
        costOfEquity === null ||
        financialData.longTermGrowthRate === null
      ) {
        console.log("Residual Income useEffect: Missing required values.");
        return;
      }
      calculateResidualPresentValue();
    } catch (error) {
      console.log("Error in Residual Income useEffect:", error);
    }
  }, [
    ticker,
    financialData.netIncome,
    financialData.currentEquity,
    costOfEquity,
    financialData.longTermGrowthRate,
    selectedMethod,
  ]);

  //--------------------------
  // CONSOLIDATED PRESENT VALUE
  //--------------------------
  useEffect(() => {
    console.log("----- Consolidated Calculation Start -----");
    console.log("Multiples Present Value:", multiplesPresentValue);
    // console.log("DCF Present Value (presentValue):", dcfValuePresentValue);
    console.log("Residual Income Present Value:", residualIncomePresentValue);

    // Call all the individual calculation functions
    calculateResidualPresentValue();
    // calculateDCFPresentValue();
    calculateMultiplesPresentValue();

    if (
      multiplesPresentValue !== null &&
      dcfValuePresentValue !== null &&
      residualIncomePresentValue !== null
    ) {
      const newConsolidatedValue =
        multiplesPresentValue +
        dcfValuePresentValue +
        residualIncomePresentValue;
      setConsolidatedPresentValue(newConsolidatedValue);
    } else {
      console.log("Consolidated calculation: One or more values are missing.");
    }
  }, [
    ticker,
    multiplesPresentValue,
    dcfValuePresentValue,
    residualIncomePresentValue,
    consolidatedPresentValue,
    selectedMethod,
    selectedCurrency,
  ]);

  // Log the updated values whenever they change
  useEffect(() => {
    console.log("Updated Values:");
    console.log("DCF Present Value (presentValue):", dcfValuePresentValue);
    console.log("Residual Income Present Value:", residualIncomePresentValue);
    console.log("Multiples Present Value:", multiplesPresentValue);
    console.log("New Consolidated Present Value 2:", consolidatedPresentValue);
    console.log("Selected Method:", selectedMethod);
  }, [
    dcfValuePresentValue,
    residualIncomePresentValue,
    multiplesPresentValue,
    selectedMethod,
  ]);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <SearchNav />
        <main className="flex-grow">
          <Suspense fallback={<div>Loading stock data...</div>}>
            <div className="flex flex-row">
              <div className="left">
                <div className="mb-32 flex flex-col items-start">
                  <div className="spacer h-12 ml-[120px] mt-4">
                    <div className="w-full max-w-[1500px] text-xs"></div>

                    {/* Stock Data */}
                    {stockInfo && (
                      <div className="mt-8 w-full max-w-[900px]">
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
                          presentValue={presentValue}
                        />

                        {/* Valuation Components */}
                        {selectedMethod === "DCF" ? (
                          <>
                            <DiscountedCashFlow
                              ticker={ticker}
                              setCostOfEquity={setCostOfEquity}
                              costOfEquity={costOfEquity}
                              freeCashFlowEquityData={freeCashFlowEquityData}
                              financialData={financialData}
                              selectedMethod={selectedMethod}
                              selectedCurrency={selectedCurrency}
                            />
                            {/* <DCFCalculation
                            ticker={ticker}
                            costOfEquity={costOfEquity}
                            freeCashFlowEquityData={freeCashFlowEquityData}
                            financialData={financialData}
                            presentValue={presentValue}
                            setPresentValue={setPresentValue}
                            dcfPresentValue={dcfValuePresentValue}
                            setDCFPresentValue={setDCFPresentValue}
                            selectedMethod={selectedMethod}
                          /> */}
                            <DCFValue
                              ticker={ticker}
                              price={stockInfo.price}
                              financialData={financialData}
                              presentValue={presentValue}
                              setPresentValue={setPresentValue}
                              dcfValuePresentValue={dcfValuePresentValue}
                              setDCFPresentValue={setDCFPresentValue}
                              selectedMethod={selectedMethod}
                            />
                          </>
                        ) : selectedMethod === "RI" ? (
                          <>
                            <ResidualIncome
                              ticker={ticker}
                              netIncome={stockInfo.price}
                              costOfEquity={costOfEquity}
                              financialData={financialData}
                              selectedMethod={selectedMethod}
                            />
                            <ResidualCalculation
                              ticker={ticker}
                              costOfEquity={costOfEquity}
                              freeCashFlowEquityData={freeCashFlowEquityData}
                              longTermGrowthRate={
                                financialData.longTermGrowthRate
                              }
                              outstandingShares={
                                financialData.outstandingShares
                              }
                              setPresentValue={setPresentValue}
                              presentValue={presentValue}
                              residualIncomePresentValue={
                                residualIncomePresentValue
                              }
                              setResidualIncomePresentValue={
                                setResidualIncomePresentValue
                              }
                              financialData={financialData}
                              selectedMethod={selectedMethod}
                            />
                            <ResidualValue
                              ticker={ticker}
                              price={stockInfo.price}
                              outstandingShares={
                                financialData.outstandingShares
                              }
                              presentValue={presentValue}
                              residualIncomePresentValue={
                                residualIncomePresentValue
                              }
                              setResidualIncomePresentValue={
                                setResidualIncomePresentValue
                              }
                              selectedMethod={selectedMethod}
                            />
                          </>
                        ) : selectedMethod === "RV" ? (
                          <>
                            <Multiples
                              netIncome={financialData.netIncome}
                              outstandingShares={
                                financialData.outstandingShares
                              }
                              financialData={financialData}
                              eps={eps}
                              averagePeerPE={financialData.averagePeerPE}
                              selectedMethod={selectedMethod}
                            />
                            <MultiplesValue
                              netIncome={financialData.netIncome}
                              outstandingShares={
                                financialData.outstandingShares
                              }
                              eps={eps}
                              price={stockInfo.price}
                              averagePeerPE={financialData.averagePeerPE}
                              multiplesPresentValue={multiplesPresentValue}
                              setMultiplesPresentValue={
                                setMultiplesPresentValue
                              }
                              setPresentValue={setPresentValue}
                              presentValue={presentValue}
                              selectedMethod={selectedMethod}
                            />
                          </>
                        ) : selectedMethod === "C" ? (
                          <>
                            <Consolidated
                              financialData={financialData}
                              multiplesPresentValue={multiplesPresentValue}
                              dcfPresentValue={dcfValuePresentValue}
                              residualIncomePresentValue={
                                residualIncomePresentValue
                              }
                              consolidatedPresentValue={
                                consolidatedPresentValue
                              }
                              freeCashFlowEquityData={freeCashFlowEquityData}
                              costOfEquity={costOfEquity}
                              eps={eps}
                              presentValue={presentValue}
                              setPresentValue={setPresentValue}
                            />
                          </>
                        ) : null}

                        {/* <Projection
                        freeCashFlowEquityData={freeCashFlowEquityData}
                        fiveYearGrowthRate={financialData.fiveYearGrowthRate}
                        tenYearGrowthRate={financialData.tenYearGrowthRate}
                        longTermGrowthRate={financialData.longTermGrowthRate}
                        selectedMethod={selectedMethod}
                      /> */}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="right mt-4 ml-16">
                <Financials financialData={financialData} />
              </div>
            </div>
          </Suspense>
        </main>
        {/* <Footer /> */}
      </div>
    </>
  );
}
