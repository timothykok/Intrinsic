//stockpage - page.js

"use client";

import { useState, useEffect, useRef, useMemo, useSuspense, Suspense } from "react";
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

export default function StockPage() {
  // This search input is now used only to trigger a new search/navigation.
  const [input, setInput] = useState("");
  // The ticker is obtained from the URL (the slug). No need to set it manually.
  const { ticker } = useParams();
  const { selectedMethod, setSelectedMethod } = useMethod();

  const router = useRouter();
  const searchParams = useSearchParams();
  const homeSelectedMethod = searchParams.get("selectedMethod");

  // When the query param is present, update the context:
  useEffect(() => {
    if (homeSelectedMethod) {
      setSelectedMethod(homeSelectedMethod);
    }
  }, [homeSelectedMethod, setSelectedMethod]);

  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  // States for fetched financial data
  const [stockInfo, setStockInfo] = useState(null);
  const [freeCashFlowEquityData, setFreeCashFlowEquityData] = useState(null);

  // States for all present values to average out in consoli value
  const [dcfValuePresentValue, setDCFPresentValue] = useState(0);
  const [residualIncomePresentValue, setResidualIncomePresentValue] =
    useState(0);
  const [multiplesPresentValue, setMultiplesPresentValue] = useState(0);
  const [consolidatedPresentValue, setConsolidatedPresentValue] =
    useState(0);
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
    netBorrowing: 0,
    beta: null,
    fiveYearGrowthRate: null,
    tenYearGrowthRate: null,
    longTermGrowthRate: null,

    outstandingShares: null,
    riskFreeRate: null,
    marketRiskPremium: null,
    sector: null,
    peers: null,
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
    // If no ticker is present, do nothing.
    if (!ticker) return;

    async function fetchStockInfo() {
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
  }, [ticker, fmpApiKey]);

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

      // PE ratio
      const currentPrice = stockInfo?.price || 0;
      const peRatioUnformatted = eps ? currentPrice / eps : 0;
      const peRatio = peRatioUnformatted.toFixed(2);

      //------------------------------------------------------------------------------------

      // Extract and use peers data:
      const peers = peersData[0]?.peersList;
      let averagePeerPE = null;
      if (peers && peers.length > 0) {
        const peerSymbols = peers.join(",");
        const quotesResponse = await axios.get(
          `https://financialmodelingprep.com/api/v3/quote/${peerSymbols}?apikey=${fmpApiKey}`
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
        fiveYearGrowthRate,
        tenYearGrowthRate,
        longTermGrowthRate,
        outstandingShares,
        riskFreeRate,
        marketRiskPremium,
        sector,
        salesGrowthToPerpetuity,
      });
    };

    fetchFinancialData();
  }, [ticker, fmpApiKey]);

  //------------------------------------------------------------------------------------
  //EPS
  const eps = useMemo(() => {
    if (!financialData.outstandingShares || !financialData.netIncome) return 0;
    return financialData.netIncome / financialData.outstandingShares;
  }, [financialData.outstandingShares, financialData.netIncome]);

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

  //------------------------------------------------------------------------------------
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

  //------------------------------------------------------------------------------------
  //PRESENT VALUE OF DCF
  // Calculate PV of FCFE


  function calculateDCFPresentValue(){
    console.log("calculate DCFPresentValue Function running")
    try {
      if (
        freeCashFlowEquityData !== null &&
        financialData.fiveYearGrowthRate !== null &&
        financialData.tenYearGrowthRate !== null &&
        financialData.longTermGrowthRate !== null &&
        costOfEquity !== null
      ) {
        let pv = 0;

        // 1. Convert growth rates to decimal form if needed
        const fiveYearG = financialData.fiveYearGrowthRate / 100;
        const tenYearG = financialData.tenYearGrowthRate / 100;
        const longTermG = financialData.longTermGrowthRate / 100;
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
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    
    try {
      if (
        freeCashFlowEquityData !== null &&
        financialData.fiveYearGrowthRate !== null &&
        financialData.tenYearGrowthRate !== null &&
        financialData.longTermGrowthRate !== null &&
        costOfEquity !== null
      ) {
        let pv = 0;

        // 1. Convert growth rates to decimal form if needed
        const fiveYearG = financialData.fiveYearGrowthRate / 100;
        const tenYearG = financialData.tenYearGrowthRate / 100;
        const longTermG = financialData.longTermGrowthRate / 100;
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
      }
    } catch (error) {
      console.log(error);
    }
  }, [
    freeCashFlowEquityData,
    financialData.fiveYearGrowthRate,
    financialData.tenYearGrowthRate,
    financialData.longTermGrowthRate,
    costOfEquity,
    setPresentValue,
    selectedMethod,
    ticker
  ]);
  //------------------------------------------------------------------------------------

  //MULTIPLES PRESENT VALUE



  let multiplesPresentValueCalculated = null;

  function calculateMultiplesPresentValue(){
    multiplesPresentValueCalculated = eps * financialData.averagePeerPE;

    setMultiplesPresentValue(multiplesPresentValueCalculated);
    console.log("set multiple pv running:" + multiplesPresentValue);
  }


  // setting Present Value
  useEffect(() => {
   
    multiplesPresentValueCalculated = eps * financialData.averagePeerPE;

    setMultiplesPresentValue(multiplesPresentValueCalculated);
    console.log("set multiple pv running:" + multiplesPresentValue);
  }, [
    financialData.outstandingShares,
    setPresentValue,
    setMultiplesPresentValue,
  ]);

  //------------------------------------------------------------------------------------
  //RESIDUAL PRESENT VALUE


  function calculateResidualPresentValue(){

    console.log("calculate Residual Present Value Function running")
    try {
      // Ensure required data is available.
      // (Remove balanceSheetData check because we are using currentEquity and netIncome)
      if (
        !ticker ||
        financialData.netIncome === null ||
        financialData.currentEquity === null ||
        costOfEquity === null ||
        financialData.longTermGrowthRate === null
      )
        return;

      // Convert percentages to decimals
      const coeDecimal = costOfEquity / 100; // e.g., 10% becomes 0.10
      const g = financialData.longTermGrowthRate / 100; // e.g., 3% becomes 0.03

      // Calculate the starting residual income (for the most recent year)
      // Residual Income = Net Income - (Current Equity * Cost of Equity)
      const startingRI =
        financialData.netIncome - financialData.currentEquity * coeDecimal;

      // Choose a forecast period—for example, 5 years.
      const forecastYears = 5;
      let pvResidualIncome = 0;

      // Forecast and discount residual incomes over the forecast period.
      for (let t = 1; t <= forecastYears; t++) {
        // Forecast residual income for year t.
        // Here we assume residual income grows at rate "g" each year.
        const RI_t = startingRI * Math.pow(1 + g, t);
        // Discount to present value.
        const discountedRI = RI_t / Math.pow(1 + coeDecimal, t);
        pvResidualIncome += discountedRI;
      }

      // Calculate terminal value at the end of the forecast period.
      // Using a perpetuity formula:
      // Terminal Value = (Residual Income in Year (forecastYears) * (1 + g)) / (coeDecimal - g)
      const RI_final = startingRI * Math.pow(1 + g, forecastYears);
      const terminalValue = (RI_final * (1 + g)) / (coeDecimal - g);
      const discountedTerminalValue =
        terminalValue / Math.pow(1 + coeDecimal, forecastYears);

      pvResidualIncome += discountedTerminalValue;

      // According to the Residual Income Model, the total intrinsic value is:
      // Intrinsic Value = Current Book Value of Equity + PV of Residual Incomes
      residualIncomePresentValue =
        financialData.currentEquity + pvResidualIncome;

      setResidualIncomePresentValue(
        parseFloat(residualIncomePresentValue.toFixed(2))
      );

      console.log(
        "residual income present value: " + residualIncomePresentValue
      );
    } catch (error) {
      console.log(error);
    }
  }

  // Calculate present value based on Residual Income Model
  useEffect(() => {
    
    try {
      // Ensure required data is available.
      // (Remove balanceSheetData check because we are using currentEquity and netIncome)
      if (
        !ticker ||
        financialData.netIncome === null ||
        financialData.currentEquity === null ||
        costOfEquity === null ||
        financialData.longTermGrowthRate === null
      )
        return;

      // Convert percentages to decimals
      const coeDecimal = costOfEquity / 100; // e.g., 10% becomes 0.10
      const g = longTermGrowthRate / 100; // e.g., 3% becomes 0.03

      // Calculate the starting residual income (for the most recent year)
      // Residual Income = Net Income - (Current Equity * Cost of Equity)
      const startingRI =
        financialData.netIncome - financialData.currentEquity * coeDecimal;

      // Choose a forecast period—for example, 5 years.
      const forecastYears = 5;
      let pvResidualIncome = 0;

      // Forecast and discount residual incomes over the forecast period.
      for (let t = 1; t <= forecastYears; t++) {
        // Forecast residual income for year t.
        // Here we assume residual income grows at rate "g" each year.
        const RI_t = startingRI * Math.pow(1 + g, t);
        // Discount to present value.
        const discountedRI = RI_t / Math.pow(1 + coeDecimal, t);
        pvResidualIncome += discountedRI;
      }

      // Calculate terminal value at the end of the forecast period.
      // Using a perpetuity formula:
      // Terminal Value = (Residual Income in Year (forecastYears) * (1 + g)) / (coeDecimal - g)
      const RI_final = startingRI * Math.pow(1 + g, forecastYears);
      const terminalValue = (RI_final * (1 + g)) / (coeDecimal - g);
      const discountedTerminalValue =
        terminalValue / Math.pow(1 + coeDecimal, forecastYears);

      pvResidualIncome += discountedTerminalValue;

      // According to the Residual Income Model, the total intrinsic value is:
      // Intrinsic Value = Current Book Value of Equity + PV of Residual Incomes
      residualIncomePresentValue =
        financialData.currentEquity + pvResidualIncome;

      setResidualIncomePresentValue(
        parseFloat(residualIncomePresentValue.toFixed(2))
      );

      console.log(
        "residual income present value: " + residualIncomePresentValue
      );
    } catch (error) {
      console.log(error);
    }
  }, [
    ticker,
    financialData.netIncome,
    financialData.currentEquity,
    costOfEquity,
    financialData.longTermGrowthRate,
    selectedMethod,
  ]);

  //------------------------------------------------------------------------------------
  //CONSOLIDATED PRESENT VALUE

  useEffect(() => {

    calculateResidualPresentValue()
    calculateDCFPresentValue()
    calculateMultiplesPresentValue()

    if (
      multiplesPresentValue &&
      dcfValuePresentValue &&
      residualIncomePresentValue
    ) {
      const newConsolidatedValue =
        (multiplesPresentValue +
          dcfValuePresentValue +
          residualIncomePresentValue) /
        3;
      setConsolidatedPresentValue(newConsolidatedValue);
    }
  }, [multiplesPresentValue, dcfValuePresentValue, residualIncomePresentValue, ticker]);

  console.log("Selected Method FROM STOCK PAGE: ", selectedMethod);

  useEffect(() => {
    console.log("DCF Present Value:", dcfValuePresentValue);
    console.log("Residual Income Present Value:", residualIncomePresentValue);
    console.log("Multiples Present Value:", multiplesPresentValue);
}, [dcfValuePresentValue, residualIncomePresentValue, multiplesPresentValue]);

  useEffect(() => {
    console.log("selectedMethod updated:", selectedMethod);
  }, [selectedMethod]);

  

if (loading) return <div>Loading...</div>;

  return (
    <Suspense>


  
    <>
      <SearchNav />
      <main>
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
                    />
                    <DCFCalculation
                      ticker={ticker}
                      costOfEquity={costOfEquity}
                      freeCashFlowEquityData={freeCashFlowEquityData}
                      financialData={financialData}
                      presentValue={presentValue}
                      setPresentValue={setPresentValue}
                      dcfPresentValue={dcfValuePresentValue}
                      setDCFPresentValue={setDCFPresentValue}
                      selectedMethod={selectedMethod}
                    />
                    <DCFValue
                      ticker={ticker}
                      price={stockInfo.price}
                      financialData={financialData}
                      presentValue={presentValue}
                      dcfPresentValue={dcfValuePresentValue}
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
                      longTermGrowthRate={financialData.longTermGrowthRate}
                      outstandingShares={financialData.outstandingShares}
                      setPresentValue={setPresentValue}
                      presentValue={presentValue}
                      residualIncomePresentValue={residualIncomePresentValue}
                      setResidualIncomePresentValue={
                        setResidualIncomePresentValue
                      }
                      financialData={financialData}
                      selectedMethod={selectedMethod}
                    />
                    <ResidualValue
                      ticker={ticker}
                      price={stockInfo.price}
                      outstandingShares={financialData.outstandingShares}
                      presentValue={presentValue}
                      residualIncomePresentValue={residualIncomePresentValue}
                      setResidualIncomePresentValue={
                        setResidualIncomePresentValue
                      }
                      selectedMethod={selectedMethod}
                    />
                  </>
                ) : selectedMethod === "M" ? (
                  <>
                    <Multiples
                      netIncome={financialData.netIncome}
                      outstandingShares={financialData.outstandingShares}
                      financialData={financialData}
                      eps={eps}
                      averagePeerPE={financialData.averagePeerPE}
                      selectedMethod={selectedMethod}
                    />
                    <MultiplesValue
                      netIncome={financialData.netIncome}
                      outstandingShares={financialData.outstandingShares}
                      eps={eps}
                      price={stockInfo.price}
                      averagePeerPE={financialData.averagePeerPE}
                      multiplesPresentValue={multiplesPresentValue}
                      setMultiplesPresentValue={setMultiplesPresentValue}
                      setPresentValue={setPresentValue}
                      presentValue={presentValue}
                      selectedMethod={selectedMethod}
                    />
                  </>
                ) : selectedMethod === "C" ? (
                  <>
                    <Consolidated
                    financialData={financialData}
                    freeCashFlowEquityData={freeCashFlowEquityData}
                    costOfEquity={costOfEquity}
                    eps={eps}
                     
                    />
                  </>
                ) : null}

                <Projection
                  freeCashFlowEquityData={freeCashFlowEquityData}
                  fiveYearGrowthRate={financialData.fiveYearGrowthRate}
                  tenYearGrowthRate={financialData.tenYearGrowthRate}
                  longTermGrowthRate={financialData.longTermGrowthRate}
                  selectedMethod={selectedMethod}
                />
              </div>
            )}
          </div>
        </div>
      </main>
      {/* <Footer /> */}
    </>
    </Suspense>
  );
}
