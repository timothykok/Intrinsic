//Financials.js

"use client";

import { useEffect, useState } from "react";
import axios from "axios";

let currency = "USD";

export default function Financials({
  Ticker,
  setInitialFCFE,
  setGrowthRate,
  setDiscountRate,
}) {
  const [FreeCashFlowEquityData, setFreeCashFlowEquityData] = useState(null);
  const [netIncomeData, setNetIncomeData] = useState(null);
  const [depreceationAmortizationData, setDepreceationAmortizationData] =
    useState([]);
  const [capitalExpenditureData, setCapitalExpenditureData] = useState([]);
  const [changeInWorkingCapitalData, setChangeInWorkingCapitalData] = useState(
    []
  );
  const [netBorrowingData, setNetBorrowingData] = useState([]);
  const [fiveYearGrowthRate, setFiveYearGrowthRate] = useState(null);
  const [tenYearGrowthRate, setTenYearGrowthRate] = useState(null);
  const [twentyYearGrowthRate, setTwentyYearGrowthRate] = useState([]);
  const [betaData, setBetaData] = useState(null);
  const [riskFreeRate, setRiskFreeRate] = useState(null);
  const [marketRiskPremium, setMarketRiskPremium] = useState([null]);
  const [costOfEquity, setCostOfEquity] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isCostOfEquityCollapsed, setIsCostOfEquityCollapsed] = useState(true);

  const fmpApiKey = process.env.NEXT_PUBLIC_FINANCIAL_API_KEY;
  const fredApiKey = process.env.NEXT_PUBLIC_FRED_API_KEY;

  const toggleCollapse = () => {
    setIsCollapsed((prevState) => !prevState);
  };

  const toggleCostOfEquityCollapse = () => {
    setIsCostOfEquityCollapsed((prevState) => !prevState);
  };

  useEffect(() => {
    const fetchNetIncome = async () => {
      try {
        const response = await axios.get(
          `https://financialmodelingprep.com/api/v3/income-statement/${Ticker}?period=annual&apikey=${fmpApiKey}`
        );

        const data = response.data;

        if (Array.isArray(data) && data.length > 0) {
          const netIncomeData = data[0]?.netIncome || 0; // Default to 0 if undefined
          setNetIncomeData(netIncomeData);
        } else {
          console.error("Invalid data format or empty response");
        }
      } catch (error) {
        console.error("Error fetching Net Income:", error);
      }
    };

    const fetchCashFlow = async () => {
      try {
        const response = await axios.get(
          `https://financialmodelingprep.com/api/v3/cash-flow-statement/${Ticker}?period=annual&apikey=${fmpApiKey}`
        );
    
        const data = response.data;
    
        if (Array.isArray(data) && data.length > 0) {
          const mostRecentYear = data[0]; // Access the most recent year's data
    
          // Extract values
          const depreceationAmortization = mostRecentYear?.depreciationAndAmortization || 0;
          const capitalExpenditure = mostRecentYear?.capitalExpenditure || 0;
          const changeInWorkingCapital = mostRecentYear?.changeInWorkingCapital || 0;
          const freeCashFlow = mostRecentYear?.freeCashFlow || 0;
    
          // Set values to state or props
          setDepreceationAmortizationData(depreceationAmortization);
          setCapitalExpenditureData(capitalExpenditure);
          setChangeInWorkingCapitalData(changeInWorkingCapital);
    
          console.log("Free Cash Flow:", freeCashFlow);
          setInitialFCFE(freeCashFlow); // Set initial Free Cash Flow to Equity
    
          // Set default growth rate and discount rate
          setGrowthRate(0.05); // Example: 5% growth rate
          setDiscountRate(0.1); // Example: 10% discount rate
        } else {
          console.error("Invalid data format or empty response");
        }
      } catch (error) {
        console.error("Error fetching cash flow data:", error);
      }
    };

    const fetchNetBorrowing = async () => {
      try {
        const response = await axios.get(
          `https://financialmodelingprep.com/api/v3/cash-flow-statement/${Ticker}?period=annual&apikey=${fmpApiKey}`
        );

        // Ensure the response data exists and is an array
        if (response.data && response.data.length > 0) {
          const mostRecentYear = response.data[0]; // Get the latest record

          // Parse necessary fields from the most recent year
          const debtRepayment = parseFloat(mostRecentYear.debtRepayment || 0); // Debt repayment (outflow)
          const commonStockIssued = parseFloat(
            mostRecentYear.commonStockIssued || 0
          ); // Common stock issued (inflow)

          // Calculate net borrowing
          const netBorrowingValue = commonStockIssued - debtRepayment;

          // Update state with the calculated net borrowing value
          console.log("net borrowing data: " + netBorrowingValue);
          setNetBorrowingData(netBorrowingValue);
        } else {
          console.error(
            "Unexpected API response: Data array is empty or invalid."
          );
        }
      } catch (error) {
        console.error("Error fetching net borrowing data:", error);

        // Handle different parts of the error object for detailed debugging
        if (error.response) {
          console.error("Response data:", error.response.data);
          console.error("Status code:", error.response.status);
          console.error("Headers:", error.response.headers);
        } else if (error.request) {
          console.error("No response received:", error.request);
        } else {
          console.error("Error message:", error.message);
        }
      }
    };


    const fetchFiveYearGrowthRate = async () => {
      try {
        // Fetch financial ratios from FMP API
        const response = await axios.get(
          `https://financialmodelingprep.com/api/v3/ratios/${Ticker}?apikey=${fmpApiKey}`
        );
    
        const data = response.data;
    
        if (!data || data.length < 5) {
          console.error(`Insufficient data. Found only ${data.length} records.`);
          setFiveYearGrowthRate("Insufficient data");
          return;
        }
    
        // Extract the most recent and 5-year-old ROE and Dividend Payout Ratio
        const mostRecentData = data[0];
        const fiveYearsAgoData = data[4];
    
        const mostRecentROE = parseFloat(mostRecentData.returnOnEquity);
        const fiveYearsAgoROE = parseFloat(fiveYearsAgoData.returnOnEquity);
    
        const mostRecentPayoutRatio = parseFloat(mostRecentData.payoutRatio);
        const fiveYearsAgoPayoutRatio = parseFloat(fiveYearsAgoData.payoutRatio);
    
        if (
          isNaN(mostRecentROE) ||
          isNaN(fiveYearsAgoROE) ||
          isNaN(mostRecentPayoutRatio) ||
          isNaN(fiveYearsAgoPayoutRatio)
        ) {
          console.error("Invalid data for calculation.");
          setFiveYearGrowthRate("Invalid data");
          return;
        }
    
        // Calculate Retention Ratios
        const mostRecentRetentionRatio = 1 - mostRecentPayoutRatio;
        const fiveYearsAgoRetentionRatio = 1 - fiveYearsAgoPayoutRatio;
    
        // Calculate Sustainable Growth Rates
        const mostRecentSGR = mostRecentROE * mostRecentRetentionRatio;
        const fiveYearsAgoSGR = fiveYearsAgoROE * fiveYearsAgoRetentionRatio;
    
        // Calculate Compound Annual Growth Rate (CAGR)
        const cagr = Math.pow(mostRecentSGR / fiveYearsAgoSGR, 1 / 5) - 1;
    
        console.log(`Most Recent SGR: ${(mostRecentSGR * 100).toFixed(2)}%`);
        console.log(`SGR 5 Years Ago: ${(fiveYearsAgoSGR * 100).toFixed(2)}%`);
        console.log(`5-Year SGR Growth Rate (CAGR): ${(cagr * 100).toFixed(2)}%`);
    
        // Format CAGR to 2 decimal places
        const formattedCAGR = (cagr * 100).toFixed(2);
    
        setFiveYearGrowthRate(formattedCAGR);
      } catch (error) {
        console.error("Error fetching data:", error);
        setFiveYearGrowthRate("Error");
      }
    };


    
    
    // Logic for 20 Year Growth Rate

    const fetchTwentyYearGrowthRate = async () => {
      try {
        // Fetch financial ratios from FMP API
        const response = await axios.get(
          `https://financialmodelingprep.com/api/v3/ratios/${Ticker}?apikey=${fmpApiKey}`
        );
    
        const data = response.data;
    
        if (!data || data.length < 20) {
          console.error(`Insufficient data. Found only ${data.length} records.`);
          setTwentyYearGrowthRate("Insufficient data");
          return;
        }
    
        // Extract the most recent and 20-year-old ROE and Dividend Payout Ratio
        const mostRecentData = data[0];
        const twentyYearsAgoData = data[19];
    
        const mostRecentROE = parseFloat(mostRecentData.returnOnEquity);
        const twentyYearsAgoROE = parseFloat(twentyYearsAgoData.returnOnEquity);
    
        const mostRecentPayoutRatio = parseFloat(mostRecentData.payoutRatio);
        const twentyYearsAgoPayoutRatio = parseFloat(twentyYearsAgoData.payoutRatio);
    
        if (
          isNaN(mostRecentROE) ||
          isNaN(twentyYearsAgoROE) ||
          isNaN(mostRecentPayoutRatio) ||
          isNaN(twentyYearsAgoPayoutRatio)
        ) {
          console.error("Invalid data for calculation.");
          setTwentyYearGrowthRate("Invalid data");
          return;
        }
    
        // Calculate Retention Ratios
        const mostRecentRetentionRatio = 1 - mostRecentPayoutRatio;
        const twentyYearsAgoRetentionRatio = 1 - twentyYearsAgoPayoutRatio;
    
        // Calculate Sustainable Growth Rates
        const mostRecentSGR = mostRecentROE * mostRecentRetentionRatio;
        const twentyYearsAgoSGR = twentyYearsAgoROE * twentyYearsAgoRetentionRatio;
    
        // Calculate Compound Annual Growth Rate (CAGR)
        const cagr = Math.pow(mostRecentSGR / twentyYearsAgoSGR, 1 / 20) - 1;
    
        console.log(`Most Recent SGR: ${(mostRecentSGR * 100).toFixed(2)}%`);
        console.log(`SGR 20 Years Ago: ${(twentyYearsAgoSGR * 100).toFixed(2)}%`);
        console.log(`20-Year SGR Growth Rate (CAGR): ${(cagr * 100).toFixed(2)}%`);
    
        // Format CAGR to 2 decimal places
        const formattedCAGR = (cagr * 100).toFixed(2);
    
        setTwentyYearGrowthRate(formattedCAGR);
      } catch (error) {
        console.error("Error fetching data:", error);
        setTwentyYearGrowthRate("Error");
      }
    };
    const fetchBeta = async () => {
      try {
        const response = await axios.get(
          `https://financialmodelingprep.com/api/v3/profile/${Ticker}?apikey=${fmpApiKey}`
        );

        // Access the first object in the data array
        const beta = response.data[0]?.beta;

        // Check if beta exists before setting it
        if (beta !== undefined && beta !== null) {
          setBetaData(beta);
          console.log("Beta: " + beta);
        } else {
          console.log("Beta value is not available in the API response.");
        }
      } catch (error) {
        console.error("Error fetching Beta:", error);
      }
    };

    const fetchRiskFreeRate = async () => {
      try {
        // Fetch the Treasury yield data
        const response = await axios.get(
          `https://financialmodelingprep.com/api/v4/treasury?apikey=${fmpApiKey}`
        );

        const data = response.data;

        // Ensure the data is valid and not empty
        if (data && data.length > 0) {
          // Sort the data by date to ensure the latest data comes first
          const sortedData = data.sort(
            (a, b) => new Date(b.date) - new Date(a.date)
          );

          // Access the most recent record
          const mostRecentRecord = sortedData[0];

          if (mostRecentRecord && mostRecentRecord.year10) {
            // Extract the 10-year Treasury yield
            let tenYearYield = parseFloat(mostRecentRecord.year10) / 100; // Convert percentage to decimal

            let formattedYield = tenYearYield * 100

            console.log(
              `10-Year Treasury Yield (Risk-Free Rate): ${formattedYield}`
            );
            setRiskFreeRate(formattedYield);
          } else {
            console.error(
              "10-Year Treasury yield not found in the most recent data."
            );
          }
        } else {
          console.error("No data found in the API response.");
        }
      } catch (error) {
        console.error("Error fetching Treasury yield data:", error.message);
      }
    };

    const fetchMarketRiskPremium = async () => {
      try {
        const response = await axios.get(
          `https://financialmodelingprep.com/api/v4/market_risk_premium?apikey=${fmpApiKey}`
        );

        const data = response.data;

        const usMarketRiskPremium = data.find(
          (item) => item.country.toLowerCase() === "united states"
        );

        if (usMarketRiskPremium) {
          let countryRiskPremium = usMarketRiskPremium.countryRiskPremium;
          console.log("market risk premium: " + countryRiskPremium);

          setMarketRiskPremium(countryRiskPremium);
        } else {
          throw new Error("United States market risk premium not found.");
        }
      } catch (error) {
        console.log("Error fetching Market Risk Premium");
      }
    };

    // Fetch data when the component mounts - for the ones that don't depend on ticker, refactor them to just render on mount, this would take less api calls.

    fetchNetIncome();
    fetchCashFlow();
    fetchNetBorrowing();
    fetchFiveYearGrowthRate();
    fetchTwentyYearGrowthRate();

    fetchBeta();
    fetchRiskFreeRate();
    fetchMarketRiskPremium();
  }, [Ticker]);

  // Logic for 10 Year Growth Rate
  useEffect(() => {
    if (fiveYearGrowthRate !== null) {
      setTenYearGrowthRate(fiveYearGrowthRate > 15 ? 15 : fiveYearGrowthRate);
    }
  }, [fiveYearGrowthRate]);

  // Calculate Cost of Equity when all data is available. If all the required data comes from a single API call, you don’t need this separation.
  useEffect(() => {
    if (
      betaData !== null &&
      riskFreeRate !== null &&
      marketRiskPremium !== null
    ) {
      console.log("cal - risk free= " + riskFreeRate)
      console.log("cal - beta= " + betaData)
      console.log("cal - marketRisk= " + marketRiskPremium)


      let calculatedCostOfEquity = riskFreeRate + betaData * marketRiskPremium;
      setCostOfEquity(calculatedCostOfEquity);
    }
  }, [betaData, riskFreeRate, marketRiskPremium]);

  // Calculate Free Cash Flow to Equity when all data is available. If all the required data comes from a single API call, you don’t need this separation.
  useEffect(() => {
    if (
      netIncomeData !== null &&
      depreceationAmortizationData !== null &&
      capitalExpenditureData !== null &&
      netBorrowingData !== null
    ) {
      const FreeCashFlowEquityValue =
        netIncomeData +
        depreceationAmortizationData +
        capitalExpenditureData +
        netBorrowingData;

      setFreeCashFlowEquityData(FreeCashFlowEquityValue);
    }
  }, [
    netIncomeData,
    depreceationAmortizationData,
    capitalExpenditureData,
    netBorrowingData,
  ]);

  return (
    <>
      <div className="financials">
        <p> Financials </p>
        <hr className="divider"></hr>

        <div className="inner-container">
          <div className="row">
            <span
              className="toggle"
              onClick={toggleCollapse}
              style={{ cursor: "pointer" }}
            >
              {isCollapsed ? (
                <img src="/Toggle-Arrow-Collapsed.svg" alt="View More" />
              ) : (
                <img src="/Toggle-Arrow-notCollapsed.svg" alt="View Less" />
              )}
            </span>

            <span className="fcfe-title"> Free Cash Flow to Equity </span>

            <span className="value">
              <div className="fcfe-price-qty">
                <span className="fcfe-title-currency">{currency}</span>
                <span className="number-inner">
        
                  {FreeCashFlowEquityData !== null
                    ? FreeCashFlowEquityData.toLocaleString()
                    : "Calculating..."}
                </span>
              </div>
            </span>
          </div>

          {/* <hr className="fcfe-divider"></hr> */}
          {!isCollapsed && (
            <div className="sub-values">
              <div className="row">
                <span className="fcfe-label">Net Income</span>
                <span className="value">
                  <div className="fcfe-price-qty-inner">
                    <div className="currency-inner">
                      <span className="fcfe-title-currency-inner">
                        {currency}
                      </span>
                    </div>
                    <div className="number-inner">
                      <p>
                 
                        {netIncomeData !== null
                          ? `${netIncomeData.toLocaleString()}`
                          : "Calculating..."}
                      </p>
                    </div>
                  </div>
                </span>
              </div>

              <div className="row">
                <span className="fcfe-label">Depreciation & Amortization</span>
                <span className="value">
                  <div className="fcfe-price-qty-inner">
                    <div className="currency-inner">
                      <span className="fcfe-title-currency-inner">
                        {currency}
                      </span>
                    </div>
                    <div className="number-inner">
                      <p>
                
                        {depreceationAmortizationData !== null
                          ? `${depreceationAmortizationData.toLocaleString()}`
                          : "Calculating..."}
                      </p>
                    </div>
                  </div>
                </span>
              </div>

              <div className="row">
                <span className="fcfe-label">Capital Expenditure</span>
                <span className="value">
                  <div className="fcfe-price-qty-inner">
                    <div className="currency-inner">
                      <span className="fcfe-title-currency-inner">
                        {currency}
                      </span>
                    </div>
                    <div className="number-inner">
                      <p>
                    
                        {capitalExpenditureData !== null
                          ? `${capitalExpenditureData.toLocaleString()}`
                          : "Calculating..."}
                      </p>
                    </div>
                  </div>
                </span>
              </div>

              <div className="row">
                <span className="fcfe-label">Change In Working Capital</span>
                <span className="value">
                  <div className="fcfe-price-qty-inner">
                    <div className="currency-inner">
                      <span className="fcfe-title-currency-inner">
                        {currency}
                      </span>
                    </div>
                    <div className="number-inner">
                      <p>
                   
                        {changeInWorkingCapitalData !== null
                          ? `${changeInWorkingCapitalData.toLocaleString()}`
                          : "Calculating..."}
                      </p>
                    </div>
                  </div>
                </span>
              </div>

              <div className="row">
                <span className="fcfe-label">Net Borrowing</span>
                <span className="value">
                  <div className="fcfe-price-qty-inner">
                    <div className="currency-inner">
                      <span className="fcfe-title-currency-inner">
                        {currency}
                      </span>
                    </div>
                    <div className="number-inner">
                      <p>
                   
                        {netBorrowingData !== null
                          ? `${netBorrowingData.toLocaleString()}`
                          : "Calculating..."}
                      </p>
                    </div>
                  </div>
                </span>
              </div>
            </div>
          )}

          {/* 5-Year EPS Growth Rate */}
          <div className="row">
            <span className="cash-flow-label">
              Cash Flow Growth Rate (Year 1-5)
            </span>
            <span className="value">
              <div className="price-qty-inner">
                <div className="percentage-inner">
                  <span className="financial-percentage-inner">PCT</span>
                </div>
                <div className="number-inner">
                  <p>
                    
                    {fiveYearGrowthRate !== "Invalid data" &&
                    fiveYearGrowthRate !== "Insufficient data"
                      ? `${fiveYearGrowthRate} %`
                      : fiveYearGrowthRate}
                  </p>
                </div>
              </div>
            </span>
          </div>

          {/* 10-Year EPS Growth Rate */}
          <div className="row">
            <span className="cash-flow-label">
              Cash Flow Growth Rate (Year 6-10)
            </span>
            <span className="value">
              <div className="price-qty-inner">
                <div className="percentage-inner">
                  <span className="financial-percentage-inner">PCT</span>
                </div>
                <div className="number-inner">
                  <p>{tenYearGrowthRate} %</p>
                </div>
              </div>
            </span>
          </div>

          {/* 20-Year EPS Growth Rate */}
          <div className="row">
            <span className="cash-flow-label">
              Cash Flow Growth Rate (Year 15-20)
            </span>
            <span className="value">
              <div className="price-qty-inner">
                <div className="percentage-inner">
                  <span className="financial-percentage-inner">PCT</span>
                </div>
                <div className="number-inner">
                  <p>{twentyYearGrowthRate} %</p>
                </div>
              </div>
            </span>
          </div>

          <div className="row">
            <span
              className="coe-toggle"
              onClick={toggleCostOfEquityCollapse}
              style={{ cursor: "pointer" }}
            >
              {isCostOfEquityCollapsed ? (
                <img src="/Toggle-Arrow-Collapsed.svg" alt="View More" />
              ) : (
                <img src="/Toggle-Arrow-notCollapsed.svg" alt="View Less" />
              )}
            </span>
            <div className="coe-title-wrapper">
              <span className="coe-title">Cost Of Equity</span>
            </div>
            <span className="value">
              <div className="coe-price-qty">
                <span className="coe-percentage">PCT</span>
                <span className="number-inner">
                  {costOfEquity !== null
                    ? `${costOfEquity.toFixed(2)} %`
                    : "Calculating..."}
                </span>
              </div>
            </span>
          </div>

          {/* <hr className="coe-divider" /> */}
          {!isCostOfEquityCollapsed && (
            <div className="coe-sub-values">
              {/* Beta */}
              <div className="row">
                <span className="coe-label">Beta</span>
                <span className="coe-value">
                  <div className="coe-price-qty-inner">
                    <div className="currency-inner">
                      <span className="fcfe-title-currency-inner">VAL</span>
                    </div>
                    <div className="number-inner">
                      <p>
                        {betaData !== null && !isNaN(betaData)
                          ? `${betaData}`
                          : "Loading..."}
                      </p>
                    </div>
                  </div>
                </span>
              </div>

              {/* Risk-Free Rate */}
              <div className="row">
                <span className="coe-label">Risk Free Rate</span>
                <span className="coe-value">
                  <div className="coe-price-qty-inner">
                    <div className="currency-inner">
                      <span className="fcfe-title-currency-inner">PCT</span>
                    </div>
                    <div className="number-inner">
                      <p>
                        {riskFreeRate !== null && !isNaN(riskFreeRate)
                          ? `${(riskFreeRate * 100).toFixed(2)} %`
                          : "Loading..."}
                      </p>
                    </div>
                  </div>
                </span>
              </div>

              {/* Market Risk Premium */}
              <div className="row">
                <span className="coe-label">Market Risk Premium</span>
                <span className="coe-value">
                  <div className="coe-price-qty-inner">
                    <div className="currency-inner">
                      <span className="fcfe-title-currency-inner">PCT</span>
                    </div>
                    <div className="number-inner">
                      <p>
                        {marketRiskPremium !== null && !isNaN(marketRiskPremium)
                          ? `${marketRiskPremium} %`
                          : "Loading..."}
                      </p>
                    </div>
                  </div>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
