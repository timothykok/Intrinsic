"use client";

import { useEffect, useState } from "react";
import axios from "axios";

let currency = "USD";

export default function Financials({ Ticker }) {
  const [FreeCashFlowEquityData, setFreeCashFlowEquityData] = useState(null);
  const [netIncomeData, setNetIncomeData] = useState(null);
  const [depreceationAmortizationData, setDepreceationAmortizationData] =
    useState([]);
  const [capitalExpenditureData, setCapitalExpenditureData] = useState([]);
  const [changeInWorkingCapitalData, setChangeInWorkingCapitalData] = useState(
    []
  );
  const [netBorrowingData, setNetBorrowingData] = useState([]);
  const [fiveYearGrowthRate, setFiveYearGrowthRate] = useState([]);
  const [tenYearGrowthRate, setTenYearGrowthRate] = useState([]);
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
          // Access the first record (most recent year)
          const mostRecentYear = data[0];

          // Extract values with default fallbacks
          const depreceationAmortization =
            mostRecentYear?.depreciationAndAmortization || 0;
          const capitalExpenditure = mostRecentYear?.capitalExpenditure || 0;
          const changeInWorkingCapital =
            mostRecentYear?.changeInWorkingCapital || 0;

          // Update state
          setDepreceationAmortizationData(depreceationAmortization);
          setCapitalExpenditureData(capitalExpenditure);
          setChangeInWorkingCapitalData(changeInWorkingCapital);

          // Log values for debugging
          console.log(
            "Depreciation and Amortization:",
            depreceationAmortization
          );
          console.log("Capital Expenditure:", capitalExpenditure);
          console.log("Change in Working Capital:", changeInWorkingCapital);
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
        const response = await axios.get(
          `https://financialmodelingprep.com/api/v3/historical/earning_calendar/${Ticker}?apikey=${fmpApiKey}`
        );

        const data = response.data;

        // Filter out null EPS and sort by fiscalDateEnding
        const filteredData = data
          .filter((item) => item.eps !== null)
          .sort(
            (a, b) =>
              new Date(b.fiscalDateEnding) - new Date(a.fiscalDateEnding)
          );

        if (filteredData.length >= 5) {
          // Start with the most recent available EPS
          const mostRecentEPS = parseFloat(filteredData[0].eps);

          // Find the earliest EPS that is still within the last 5 years
          let fiveYearsAgoEPS = null;
          for (let i = 1; i < filteredData.length; i++) {
            if (filteredData[i]) {
              fiveYearsAgoEPS = parseFloat(filteredData[i].eps);
              if (!isNaN(fiveYearsAgoEPS)) {
                break; // Found the earliest valid EPS
              }
            }
          }

          console.log("Filtered Data:", filteredData);
          console.log("Most Recent EPS:", mostRecentEPS);
          console.log("Five Years Ago EPS:", fiveYearsAgoEPS);

          if (!isNaN(mostRecentEPS) && !isNaN(fiveYearsAgoEPS)) {
            // Calculate CAGR
            const cagr = Math.pow(mostRecentEPS / fiveYearsAgoEPS, 1 / 5) - 1;

            // Project EPS for the next 5 years using the calculated CAGR
            const projectedEPS = [];
            for (let year = 1; year <= 5; year++) {
              projectedEPS.push(mostRecentEPS * Math.pow(1 + cagr, year));
            }

            setFiveYearGrowthRate((cagr * 100).toFixed(2));
            console.log("Projected EPS for next 5 years:", projectedEPS);
          } else {
            console.error("Invalid EPS data for calculation.");
          }
        } else {
          console.error("Not enough valid EPS data for 5-year calculation.");
        }
      } catch (error) {
        console.error("Error fetching EPS data:", error);
      }
    };
    // Logic for 10 Year Growth Rate
    if (fiveYearGrowthRate > 15) {
      setTenYearGrowthRate(15);
    } else {
      setTenYearGrowthRate(fiveYearGrowthRate);
    }

    // Logic for 20 Year Growth Rate

    setTwentyYearGrowthRate(5.5 + "%");

    const fetchTwentyYearGrowthRate = async () => {
      try {
        const response = await axios.get(
          "/api/fred/series/observations?series_id=NGDPSAXDCUSQ&api_key=c65a4c196c937ace2b33dda01eb55fb6&file_type=json"
        );

        const data = response.data.observations;

        // Filter observations for July dates
        const julyObservations = data.filter((obs) =>
          obs.date.includes("-07-01")
        );

        // Ensure we have at least two July observations
        if (julyObservations.length < 2) {
          console.error("Insufficient data for YoY growth calculation.");
          return;
        }

        // Get the latest and previous July values
        const latestJuly = julyObservations[julyObservations.length - 1];
        const previousJuly = julyObservations[julyObservations.length - 2];

        const latestValue = parseFloat(latestJuly.value);
        const previousValue = parseFloat(previousJuly.value);

        // Calculate YoY growth rate
        const growthRate =
          ((latestValue - previousValue) / previousValue) * 100;

        console.log(
          `YoY Growth Rate (${previousJuly.date} to ${
            latestJuly.date
          }): ${growthRate.toFixed(2)}%`
        );

        // Use the YoY growth rate as a projection
        const projectedRate = Math.min(Math.max(growthRate, 3), 5); // Clamp to 3-5% range
        console.log(`Projected Nominal Growth Rate: ${projectedRate}%`);

        setTwentyYearGrowthRate(projectedRate);
      } catch (error) {
        console.error("Error fetching YoY Growth Rate:", error);
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
          const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
    
          // Access the most recent record
          const mostRecentRecord = sortedData[0];
    
          if (mostRecentRecord && mostRecentRecord.year10) {
            // Extract the 10-year Treasury yield
            const tenYearYield = parseFloat(mostRecentRecord.year10) / 100; // Convert percentage to decimal
    
            console.log(`10-Year Treasury Yield (Risk-Free Rate): ${tenYearYield}`);
            setRiskFreeRate(tenYearYield)
          } else {
            console.error("10-Year Treasury yield not found in the most recent data.");
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
    // fetchTwentyYearGrowthRate();

    fetchBeta();
    fetchRiskFreeRate();
    fetchMarketRiskPremium();
  }, [Ticker]);

  // Calculate Cost of Equity when all data is available. If all the required data comes from a single API call, you don’t need this separation.
  useEffect(() => {
    if (
      betaData !== null &&
      riskFreeRate !== null &&
      marketRiskPremium !== null
    ) {
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
                        {" "}
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
                    ? `${costOfEquity.toFixed(2)}`
                    : "Calculating..."}
                </span>
              </div>
            </span>
          </div>

          {/* <hr className="coe-divider" /> */}
          {!isCostOfEquityCollapsed && (
            <div className="sub-values">
              {/* Beta */}
              <div className="row">
                <span className="coe-label">Beta</span>
                <span className="value">
                  <div className="coe-price-qty-inner">
                    <div className="currency-inner">
                      <span className="fcfe-title-currency-inner">PCT</span>
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
                <span className="value">
                  <div className="coe-price-qty-inner">
                    <div className="currency-inner">
                      <span className="fcfe-title-currency-inner">
                        {currency}
                      </span>
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
                <span className="value">
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
