"use client";

import { useEffect, useState } from "react";
import axios from "axios";

let currency = "USD";

export default function Financials({ Ticker }) {
  const [FreeCashFlowEquityData, setFreeCashFlowEquityData] = useState([]);
  const [netIncomeData, setNetIncomeData] = useState([]);
  const [depreceationAmortizationData, setDepreceationAmortizationData] =
    useState([]);
  const [capitalExpenditureData, setCapitalExpenditureData] = useState([]);
  const [changeInWorkingCapitalData, setChangeInWorkingCapitalData] = useState(
    []
  );
  const [netBorrowingData, setNetBorrowingData] = useState(null);
  const [fiveYearGrowthRate, setFiveYearGrowthRate] = useState([]);
  const [tenYearGrowthRate, setTenYearGrowthRate] = useState([]);
  const [twentyYearGrowthRate, setTwentyYearGrowthRate] = useState([]);
  const [betaData, setBetaData] = useState(null);
  const [riskFreeRate, setRiskFreeRate] = useState(null);
  const [marketRiskPremium, setMarketRiskPremium] = useState([null]);
  const [costOfEquity, setCostOfEquity] = useState(null);

  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isCostOfEquityCollapsed, setIsCostOfEquityCollapsed] = useState(true);

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
          `https://financialmodelingprep.com/api/v3/income-statement/${Ticker}?period=annual&apikey=hg2NroPZx6bZbTWXJjqon6L5Pb53HCko`
        );
        const data = response.data.slice(0, 1); // Get the most recent year
        const netIncomeValues = data.map((item) => ({
          year: item.calendarYear,
          netIncome: item.netIncome,
        }));
        setNetIncomeData(netIncomeValues);
      } catch (error) {
        console.error("Error fetching Net Income data:", error);
      }
    };

    const fetchCashFlow = async () => {
      try {
        const response = await axios.get(
          `https://financialmodelingprep.com/api/v3/cash-flow-statement/${Ticker}?period=annual&apikey=hg2NroPZx6bZbTWXJjqon6L5Pb53HCko`
        );
        const data = response.data.slice(0, 1);

        const depreceationAmortizationValues = data.map((item) => ({
          year: item.calendarYear,
          depreceationAmortization: item.depreciationAndAmortization,
        }));

        const capitalExpenditureValues = data.map((item) => ({
          year: item.calendarYear,
          capitalExpenditure: item.capitalExpenditure,
        }));

        const changeInWorkingCapitalValues = data.map((item) => ({
          year: item.calendarYear,
          changeInWorkingCapital: item.changeInWorkingCapital,
        }));

        setDepreceationAmortizationData(depreceationAmortizationValues);
        setCapitalExpenditureData(capitalExpenditureValues);
        setChangeInWorkingCapitalData(changeInWorkingCapitalValues);
      } catch (error) {
        console.error("Error fetching cash flow data:", error);
      }
    };

    const fetchNetBorrowing = async () => {
      try {
        const response = await axios.get(
          `https://www.alphavantage.co/query?function=CASH_FLOW&symbol=${Ticker}&apikey=496Z5WWYIJYB3MFM`
        );
        const data = response.data.annualReports;

        const mostRecentYear = data[0];

        const shortTermDebt = parseFloat(
          mostRecentYear.proceedsFromRepaymentsOfShortTermDebt || 0
        );
        const longTermDebt = parseFloat(
          mostRecentYear.proceedsFromIssuanceOfLongTermDebtAndCapitalSecuritiesNet ||
            0
        );

        const netBorrowingValue = shortTermDebt + longTermDebt;

        setNetBorrowingData(netBorrowingValue);
      } catch (error) {
        console.error(error);

        // Specific parts of the error object
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

    //finished API limits + inaccurate data for some searches - looking for alternatives
    const fetchFiveYearGrowthRate = async () => {
      try {
        const response = await axios.get(
          `https://www.alphavantage.co/query?function=EARNINGS&symbol=${Ticker}&apikey=496Z5WWYIJYB3MFM`
        );

        const data = response.data.annualEarnings;
        console.log("Annual Earnings Data:", data);

        // Check if the data contains at least 5 years of EPS data
        if (data.length >= 5) {
          const mostRecentEPS = parseFloat(data[0].reportedEPS); // Most recent year
          const fiveYearsAgoEPS = parseFloat(data[4].reportedEPS); // 5 years ago

          console.log("Most Recent EPS:", mostRecentEPS);
          console.log("5 Years Ago EPS:", fiveYearsAgoEPS);

          // Ensure the EPS values are valid
          if (
            !isNaN(mostRecentEPS) &&
            !isNaN(fiveYearsAgoEPS) &&
            fiveYearsAgoEPS > 0
          ) {
            // Calculate CAGR
            const growthRate =
              Math.pow(mostRecentEPS / fiveYearsAgoEPS, 1 / 5) - 1;
            console.log("5-Year EPS Growth Rate:", growthRate * 100);

            setFiveYearGrowthRate((growthRate * 100).toFixed(2)); // Store as percentage
          } else {
            console.error("Invalid EPS values:", {
              mostRecentEPS,
              fiveYearsAgoEPS,
            });
            setFiveYearGrowthRate("Invalid data");
          }
        } else {
          console.error("Not enough data for 5 years.");
          setFiveYearGrowthRate("Insufficient data");
        }
      } catch (error) {
        console.error("Error fetching 5-year growth rate:", error);
      }
    };

    // Logic for 10 Year Growth Rate
    if (fiveYearGrowthRate > 15) {
      setTenYearGrowthRate(15);
    } else {
      setTenYearGrowthRate(fiveYearGrowthRate);
    }

    // Logic for 20 Year Growth Rate

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
          `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${Ticker}&apikey=496Z5WWYIJYB3MFM`
        );
        const beta = response.data.Beta;
        setBetaData(beta);
        console.log("beta: " + beta);
      } catch (error) {
        console.log("Error fetching Beta");
      }
    };

    const fetchRiskFreeRate = async () => {
      try {
        const response = await axios.get(
          "/api/fred/series/observations?series_id=NGDPSAXDCUSQ&api_key=c65a4c196c937ace2b33dda01eb55fb6&file_type=json"
        );

        const data = response.data.observations;

        // Get the most recent observation (last item in the array)
        const latestObservation = data[data.length - 1];
        const riskFreeRate = parseFloat(latestObservation.value) / 100; // Convert to a decimal for calculating Cost of Equity later

        setRiskFreeRate(riskFreeRate);
        console.log("risk free rate= " + riskFreeRate);
      } catch (error) {
        console.log("Error fetching risk free rate");
      }
    };

    //In the mean time, use 5-6% historical rate
    const fetchMarketRiskPremium = async () => {
      try {
        // const response = await axios.get("https://financialmodelingprep.com/api/v4/market_risk_premium?apikey=hg2NroPZx6bZbTWXJjqon6L5Pb53HCko")

        let marketRiskPremium = 0.055;
        setMarketRiskPremium(marketRiskPremium);
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

  // Calculate Cost of Equity when all data is available. If all the required data comes from a single API call, you don’t need this separation.
  useEffect(() => {
    // if (betaData !== null && riskFreeRate !== null && marketRiskPremium !== null) {
    //   let calculatedCostOfEquity = riskFreeRate + betaData * marketRiskPremium;
    //   setCostOfEquity(calculatedCostOfEquity);
    // }
  }, [betaData, riskFreeRate, marketRiskPremium]);

  // Calculate Free Cash Flow to Equity when all data is available. If all the required data comes from a single API call, you don’t need this separation.
  useEffect(() => {
    if (
      netIncomeData.length > 0 &&
      depreceationAmortizationData.length > 0 &&
      capitalExpenditureData.length > 0 &&
      netBorrowingData !== null
    ) {
      const FreeCashFlowEquityValue =
        netIncomeData[0].netIncome +
        depreceationAmortizationData[0].depreceationAmortization +
        capitalExpenditureData[0].capitalExpenditure +
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
                  ${" "}
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
                    <span className="fcfe-title-currency-inner">{currency}</span>
                    </div>
                    <div className="number-inner">
                      <p>
                        {netIncomeData.length > 0
                          ? netIncomeData[0].netIncome.toLocaleString()
                          : "Loading..."}
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
                    <span className="fcfe-title-currency-inner">{currency}</span>
                    </div>
                    <div className="number-inner">
                      <p>
                        {depreceationAmortizationData.length > 0
                          ? depreceationAmortizationData[0].depreceationAmortization.toLocaleString()
                          : "Loading..."}
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
                    <span className="fcfe-title-currency-inner">{currency}</span>
                    </div>
                    <div className="number-inner">
                      <p>
                        {capitalExpenditureData.length > 0
                          ? capitalExpenditureData[0].capitalExpenditure.toLocaleString()
                          : "Loading..."}
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
                    <span className="fcfe-title-currency-inner">{currency}</span>
                    </div>
                    <div className="number-inner">
                      <p>
                        {changeInWorkingCapitalData.length > 0
                          ? changeInWorkingCapitalData[0].changeInWorkingCapital.toLocaleString()
                          : "Loading..."}
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
                    <span className="fcfe-title-currency-inner">{currency}</span>
                    </div>
                    <div className="number-inner">
                      <p>
                        {netBorrowingData !== null
                          ? netBorrowingData.toLocaleString()
                          : "Loading..."}
                      </p>
                    </div>
                  </div>
                </span>
              </div>
            </div>
          )}

          {/* 5-Year EPS Growth Rate */}
          <div className="row">
            <span className="cash-flow-label">Cash Flow Growth Rate (Year 1-5)</span>
            <span className="value">
              <div className="price-qty-inner">
                <div className="percentage-inner">
                <span className="financial-percentage-inner">PCT</span>
                </div>
                <div className="number-inner">
                  <p>
                    {fiveYearGrowthRate !== "Invalid data" &&
                    fiveYearGrowthRate !== "Insufficient data"
                      ? `${fiveYearGrowthRate}%`
                      : fiveYearGrowthRate}
                  </p>
                </div>
              </div>
            </span>
          </div>

          {/* 5-Year EPS Growth Rate */}
          <div className="row">
            <span className="cash-flow-label">Cash Flow Growth Rate (Year 1-5)</span>
            <span className="value">
              <div className="price-qty-inner">
                <div className="percentage-inner">
                <span className="financial-percentage-inner">PCT</span>
                </div>
                <div className="number-inner">
                  <p>
                    {fiveYearGrowthRate !== "Invalid data" &&
                    fiveYearGrowthRate !== "Insufficient data"
                      ? `${fiveYearGrowthRate}%`
                      : fiveYearGrowthRate}
                  </p>
                </div>
              </div>
            </span>
          </div>

          {/* 10-Year EPS Growth Rate */}
          <div className="row">
            <span className="cash-flow-label">Cash Flow Growth Rate (Year 6-10)</span>
            <span className="value">
              <div className="price-qty-inner">
                <div className="percentage-inner">
                <span className="financial-percentage-inner">PCT</span>
                </div>
                <div className="number-inner">
                  <p>{tenYearGrowthRate}</p>
                </div>
              </div>
            </span>
          </div>

          {/* 20-Year EPS Growth Rate */}
          <div className="row">
            <span className="cash-flow-label">Cash Flow Growth Rate (Year 15-20)</span>
            <span className="value">
              <div className="price-qty-inner">
                <div className="percentage-inner">
                <span className="financial-percentage-inner">PCT</span>
                </div>
                <div className="number-inner">
                  <p>{twentyYearGrowthRate}</p>
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
                    ? `${(costOfEquity * 100).toFixed(2)}%`
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
                  <span className="fcfe-title-currency-inner">{currency}</span>
                   </div>
                   <div className="number-inner">
                      <p>
                        {marketRiskPremium !== null && !isNaN(marketRiskPremium)
                          ? `${(marketRiskPremium * 100).toFixed(2)}%`
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
                  <span className="fcfe-title-currency-inner">{currency}</span>
                   </div>
                   <div className="number-inner">
                      <p>
                        {marketRiskPremium !== null && !isNaN(marketRiskPremium)
                          ? `${(marketRiskPremium * 100).toFixed(2)}%`
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
                  <span className="fcfe-title-currency-inner">{currency}</span>
                   </div>
                   <div className="number-inner">
                      <p>
                        {marketRiskPremium !== null && !isNaN(marketRiskPremium)
                          ? `${(marketRiskPremium * 100).toFixed(2)}%`
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
