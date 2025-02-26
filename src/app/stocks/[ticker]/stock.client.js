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
  const [dcfValuePresentValue, setDCFPresentValue] = useState(null);
  const [residualIncomePresentValue, setResidualIncomePresentValue] =
    useState(null);
  const [multiplesPresentValue, setMultiplesPresentValue] = useState(0);
  const [consolidatedPresentValue, setConsolidatedPresentValue] = useState(0);
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

    currentRatio:0,
    debtToEbitda:0,
    debtServicingRatio:0,


    fiveYearGrowthRate: null,
    tenYearGrowthRate: null,
    longTermGrowthRate: null,

    outstandingShares: null,
    riskFreeRate: null,
    marketRiskPremium: null,
    sector: null,
    peers: null,

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
        quoteData,
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
          `https://financialmodelingprep.com/api/v3/quote/${ticker}?apikey=${fmpApiKey}`
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



      //Current Ratio
      const currentRatio = ratioData[0]?.currentRatio || 0;



      //Debt to Ebitda Ratio
      const shortTermDebt = balanceSheetData[0]?.shortTermDebt;
      const longTermDebt = balanceSheetData[0]?.longTermDebt;

      const totalDebt = shortTermDebt + longTermDebt;

      const ebitda = incomeData[0]?.ebitda;

      const debtToEbitdaRatio = totalDebt/ebitda;



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


currentRatio,
    debtToEbitda,
    debtServicingRatio,


        fiveYearGrowthRate,
        tenYearGrowthRate,
        longTermGrowthRate,
        outstandingShares,
        riskFreeRate,
        marketRiskPremium,
        sector,
        salesGrowthToPerpetuity,

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
  //--------------------------
  // DCF PRESENT VALUE
  //--------------------------
  function calculateDCFPresentValue() {
    console.log("----- DCF Calculation Start -----");
    console.log("freeCashFlowEquityData:", freeCashFlowEquityData);
    console.log(
      "financialData.fiveYearGrowthRate:",
      financialData.fiveYearGrowthRate
    );
    console.log(
      "financialData.tenYearGrowthRate:",
      financialData.tenYearGrowthRate
    );
    console.log(
      "financialData.longTermGrowthRate:",
      financialData.longTermGrowthRate
    );
    console.log("costOfEquity:", costOfEquity);

    try {
      if (
        freeCashFlowEquityData !== null &&
        financialData.fiveYearGrowthRate !== null &&
        financialData.tenYearGrowthRate !== null &&
        financialData.longTermGrowthRate !== null &&
        costOfEquity !== null
      ) {
        let pv = 0;
        // Convert growth rates to decimal form
        const fiveYearG = financialData.fiveYearGrowthRate / 100;
        const tenYearG = financialData.tenYearGrowthRate / 100;
        const longTermG = financialData.longTermGrowthRate / 100;
        const coe = costOfEquity / 100;

        console.log(
          "Converted Values - fiveYearG:",
          fiveYearG,
          "tenYearG:",
          tenYearG,
          "longTermG:",
          longTermG,
          "coe:",
          coe
        );

        // Calculate PV of FCFE from Year 1 to Year 5
        for (let t = 1; t <= 5; t++) {
          const projectedFCFE =
            freeCashFlowEquityData * Math.pow(1 + fiveYearG, t);
          const discountedFCFE = projectedFCFE / Math.pow(1 + coe, t);
          console.log(
            `Year ${t} - projectedFCFE: ${projectedFCFE}, discountedFCFE: ${discountedFCFE}`
          );
          pv += discountedFCFE;
        }

        // Calculate PV of FCFE from Year 6 to Year 10
        let fcfeYearN = freeCashFlowEquityData * Math.pow(1 + fiveYearG, 5); // start from Year 5 FCFE
        console.log("Initial fcfeYearN (end of Year 5):", fcfeYearN);
        for (let t = 6; t <= 10; t++) {
          fcfeYearN *= 1 + tenYearG; // grow each year
          const discountedFCFE = fcfeYearN / Math.pow(1 + coe, t);
          console.log(
            `Year ${t} - fcfeYearN: ${fcfeYearN}, discountedFCFE: ${discountedFCFE}`
          );
          pv += discountedFCFE;
        }

        // Calculate Perpetuity Value at Year 11
        const fcfeYear10 = fcfeYearN; // already grown to Year 10
        const perpetuityValue =
          (fcfeYear10 * (1 + longTermG)) / (coe - longTermG);
        const discountedPerpetuityValue =
          perpetuityValue / Math.pow(1 + coe, 10);
        console.log(
          "Perpetuity Value:",
          perpetuityValue,
          "Discounted Perpetuity Value:",
          discountedPerpetuityValue
        );

        // Add discounted perpetuity to PV
        pv += discountedPerpetuityValue;
        console.log("Final DCF Present Value:", parseFloat(pv.toFixed(2)));
        setDCFPresentValue(parseFloat(pv.toFixed(2)));
      } else {
        console.log("Missing required data for DCF calculation.");
      }
    } catch (error) {
      console.log("Error in calculateDCFPresentValue:", error);
    }
  }

  // Also log in the DCF useEffect
  useEffect(() => {
    try {
      if (
        freeCashFlowEquityData !== null &&
        financialData.fiveYearGrowthRate !== null &&
        financialData.tenYearGrowthRate !== null &&
        financialData.longTermGrowthRate !== null &&
        costOfEquity !== null
      ) {
        calculateDCFPresentValue();
      } else {
        console.log("DCF useEffect: Some values are missing.");
      }
    } catch (error) {
      console.log("Error in DCF useEffect:", error);
    }
  }, [
    freeCashFlowEquityData,
    financialData.fiveYearGrowthRate,
    financialData.tenYearGrowthRate,
    financialData.longTermGrowthRate,
    costOfEquity,
    selectedMethod,
    ticker,
  ]);

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
    console.log("DCF Present Value (presentValue):", dcfValuePresentValue);
    console.log("Residual Income Present Value:", residualIncomePresentValue);

    // Call all the individual calculation functions
    calculateResidualPresentValue();
    calculateDCFPresentValue();
    calculateMultiplesPresentValue();

    if (
      multiplesPresentValue &&
      dcfValuePresentValue &&
      residualIncomePresentValue
    ) {
      const newConsolidatedValue =
        multiplesPresentValue +
        dcfValuePresentValue +
        residualIncomePresentValue;
      console.log("Consolidated Present Value:", newConsolidatedValue);
      setConsolidatedPresentValue(newConsolidatedValue);
    } else {
      console.log(
        "Consolidated calculation: One or more values are missing or zero."
      );
    }
  }, [
    ticker,
    multiplesPresentValue,
    dcfValuePresentValue,
    residualIncomePresentValue,
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
      <SearchNav />
      <main>
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
                            longTermGrowthRate={
                              financialData.longTermGrowthRate
                            }
                            outstandingShares={financialData.outstandingShares}
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
                            outstandingShares={financialData.outstandingShares}
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
                            multiplesPresentValue={multiplesPresentValue}
                            dcfPresentValue={dcfValuePresentValue}
                            residualIncomePresentValue={
                              residualIncomePresentValue
                            }
                            consolidatedPresentValue={consolidatedPresentValue}
                            freeCashFlowEquityData={freeCashFlowEquityData}
                            costOfEquity={costOfEquity}
                            eps={eps}
                            presentValue={presentValue}
                            setPresentValue={setPresentValue}
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
            </div>

            <div className="right  mt-80 pt-16 ml-16 ">
              <Financials financialData={financialData} />
            </div>
          </div>
        </Suspense>
      </main>
      {/* <Footer /> */}
    </>
  );
}
