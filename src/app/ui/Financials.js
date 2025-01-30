"use client";

import { useEffect, useState } from "react";
import axios from "axios";

let currency = "USD";

export default function Financials({
  Ticker,
  setFreeCashFlowEquityData,
  freeCashFlowEquityData,
  setFiveYearGrowthRate,
  fiveYearGrowthRate,
  setTenYearGrowthRate,
  tenYearGrowthRate,
  setCostOfEquity,
  costOfEquity,
  setLongTermGrowthRate,
  longTermGrowthRate,
}) {
  const [netIncomeData, setNetIncomeData] = useState(null);
  const [depreceationAmortizationData, setDepreceationAmortizationData] =
    useState([]);
  const [capitalExpenditureData, setCapitalExpenditureData] = useState([]);
  const [changeInWorkingCapitalData, setChangeInWorkingCapitalData] = useState(
    []
  );
  const [netBorrowingData, setNetBorrowingData] = useState([]);
  const [betaData, setBetaData] = useState(null);
  const [riskFreeRate, setRiskFreeRate] = useState(null);
  const [marketRiskPremium, setMarketRiskPremium] = useState([null]);

  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isCostOfEquityCollapsed, setIsCostOfEquityCollapsed] = useState(true);

  const fmpApiKey = process.env.NEXT_PUBLIC_FINANCIAL_API_KEY;

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
          const depreceationAmortization =
            mostRecentYear?.depreciationAndAmortization || 0;
          const capitalExpenditure = mostRecentYear?.capitalExpenditure || 0;
          const changeInWorkingCapital =
            mostRecentYear?.changeInWorkingCapital || 0;

          // Set values to state or props
          setDepreceationAmortizationData(depreceationAmortization);
          setCapitalExpenditureData(capitalExpenditure);
          setChangeInWorkingCapitalData(changeInWorkingCapital);
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
    // const fetchFiveYearGrowthRate = async () => {
    //   try {
    //     // Fetch financial ratios from FMP API
    //     const response = await axios.get(
    //       `https://financialmodelingprep.com/api/v3/ratios/${Ticker}?apikey=${fmpApiKey}`
    //     );       

    //     const data = response.data;
    //     if (!data || data.length < 5) {
    //       console.error(
    //         `Insufficient data. Found only ${data.length || 0} records.`
    //       );
    //       setFiveYearGrowthRate("Insufficient data");
    //       return;
    //     }

    //     // Extract ROE for the most recent year (end of the year) and 5 years ago (start of the year)
    //     const mostRecentROE = parseFloat(data[0].returnOnEquity || 0); // End of the year
    //     const fiveYearsAgoROE = parseFloat(data[4].returnOnEquity || 0); // Start of the year

    //     // Log the ROE values for debugging
    //     console.log(`Most Recent ROE: ${(mostRecentROE * 100).toFixed(2)}%`);
    //     console.log(`ROE 5 Years Ago: ${(fiveYearsAgoROE * 100).toFixed(2)}%`);

    //     // Calculate the Compound Annual Growth Rate (CAGR) for ROE
    //     const cagr = Math.pow(mostRecentROE / fiveYearsAgoROE, 1 / 5) - 1;

    //     // Log the CAGR for debugging
    //     console.log(`5-Year ROE CAGR: ${(cagr * 100).toFixed(2)}%`);

    //     // Format CAGR to 2 decimal places and set the state
    //     const formattedCAGR = (cagr * 100).toFixed(2);
    //     setFiveYearGrowthRate(formattedCAGR);
    //   } catch (error) {
    //     console.error("Error fetching data:", error);
    //     setFiveYearGrowthRate("Error");
    //   }
    // };

    const fetchFiveYearGrowthRate = async () => {
      try {
        // Fetch financial ratios from API (for ROE)
        const response = await axios.get(
          `https://financialmodelingprep.com/api/v3/ratios/${Ticker}?apikey=${fmpApiKey}`
        );
    
        const data = response.data;
    
        // Ensure data exists and has at least 5 years
        if (!data || data.length < 5) {
          console.error(
            `Insufficient data. Found only ${data.length || 0} records.`
          );
          setFiveYearGrowthRate("Insufficient data");
          return;
        }
    
        // Extract ROE values for the last 5 years
        const roeValues = data.slice(0, 5).map((year) => parseFloat(year.returnOnEquity || 0));
    
        // Filter out invalid values (negative or zero ROE can be unrealistic for growth calculations)
        const validROEValues = roeValues.filter(roe => !isNaN(roe) && roe > 0);
    
        if (validROEValues.length < 1) {
          console.error("No valid ROE values found.");
          setFiveYearGrowthRate("Invalid data");
          return;
        }
    
        // Calculate the average ROE over 5 years
        const averageROE = validROEValues.reduce((sum, roe) => sum + roe, 0) / validROEValues.length;
    
        console.log(`5-Year ROE Values: ${validROEValues.map(roe => (roe * 100).toFixed(2)).join(", ")}%`);
        console.log(`Average ROE: ${(averageROE * 100).toFixed(2)}%`);
    
        // Fetch the most recent payout ratio
        const payoutRatio = parseFloat(data[0].payoutRatio || 0);
    
        if (isNaN(payoutRatio) || payoutRatio < 0 || payoutRatio > 1) {
          console.error("Invalid payout ratio.");
          setFiveYearGrowthRate("Invalid data");
          return;
        }
    
        // Calculate retention ratio
        const retentionRatio = 1 - payoutRatio;
    
        // Calculate five-year growth rate using retention ratio * avg ROE
        const fiveYearGrowthRate = retentionRatio * averageROE;
    
        console.log(`Payout Ratio: ${(payoutRatio * 100).toFixed(2)}%`);
        console.log(`Retention Ratio: ${(retentionRatio * 100).toFixed(2)}%`);
        console.log(`Five-Year Growth Rate: ${(fiveYearGrowthRate * 100).toFixed(2)}%`);
    
        // Format and set the five-year growth rate
        setFiveYearGrowthRate((fiveYearGrowthRate * 100).toFixed(2));
      } catch (error) {
        console.error("Error fetching ROE or payout ratio:", error);
        setFiveYearGrowthRate("Error");
      }
    };

    const fetchLongTermGrowthRate = async () => {
      try {
        setLongTermGrowthRate(2);
      } catch (error) {
        console.log(error);
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

            let formattedYield = tenYearYield * 100;

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
    fetchLongTermGrowthRate();

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
      console.log("cal - risk free= " + riskFreeRate);
      console.log("cal - beta= " + betaData);
      console.log("cal - marketRisk= " + marketRiskPremium);

      let calculatedCostOfEquity = riskFreeRate + betaData * marketRiskPremium;
      setCostOfEquity(calculatedCostOfEquity);
    }
  }, [betaData, riskFreeRate, marketRiskPremium, Ticker]);

  

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
     <div className="max-w-[800px] mx-auto pt-8 pb-8 mt-8 border border-gray-200 bg-white rounded-lg p-6 shadow-lg hover:shadow-xl">
        <p className="text-lg font-light text-gray-600">Financials</p>
        <hr className="my-4 border-gray-300" />

        <div className="space-y-4">
          <div className="flex justify-between items-center min-w-s">
            {/* Group the arrow toggle and title together */}
            <div className="flex items-center">
              <span className="cursor-pointer" onClick={toggleCollapse}>
                {isCollapsed ? (
                  <img
                    src="/Toggle-Arrow-Collapsed.svg"
                    alt="View More"
                    className="w-2 h-2"
                  />
                ) : (
                  <img
                    src="/Toggle-Arrow-notCollapsed.svg"
                    alt="View Less"
                    className="w-2 h-2"
                  />
                )}
              </span>
              <span className="text-gray-600 text-lg ml-4 w-80 ">
                Free Cash Flow to Equity
              </span>
            </div>

            {/* Currency and value on the right */}
            <span className="text-right">
              <div className="flex items-center">
                <span className="text-gray-600 text-lg mr-2">{currency}</span>
                <span className="font-light text-lg w-48 text-gray-600">
                  {freeCashFlowEquityData !== null
                    ? freeCashFlowEquityData.toLocaleString()
                    : "Calculating..."}
                </span>
              </div>
            </span>
          </div>

          {!isCollapsed && (
            <div className="pl-8 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-lg ml-4 w-80">
                  Net Income
                </span>
                <span className="text-right">
                  <div className="flex items-center">
                    <span className="text-gray-600 text-lg mr-2">
                      {currency}
                    </span>
                    <span className="font-light text-lg w-48 text-gray-600">
                      {netIncomeData !== null
                        ? `${netIncomeData.toLocaleString()}`
                        : "Calculating..."}
                    </span>
                  </div>
                </span>
              </div>
  
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-600 text-lg ml-4 w-80">
                  Depreciation & Amortization
                </span>
                <span className="text-right">
                  <div className="flex items-center">
                    <span className="text-gray-600 text-lg mr-2">
                      {currency}
                    </span>
                    <span className="font-light text-lg w-48 text-gray-600">
                      {depreceationAmortizationData !== null
                        ? `${depreceationAmortizationData.toLocaleString()}`
                        : "Calculating..."}
                    </span>
                  </div>
                </span>
              </div>
              

              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-lg ml-4 w-80">
                  Capital Expenditure
                </span>
                <span className="text-right">
                  <div className="flex items-center">
                    <span className="text-gray-600 text-lg mr-2">
                      {currency}
                    </span>
                    <span className="font-light text-lg w-48 text-gray-600">
                      {capitalExpenditureData !== null
                        ? `${capitalExpenditureData.toLocaleString()}`
                        : "Calculating..."}
                    </span>
                  </div>
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-lg ml-4 w-80">
                  Change In Working Capital
                </span>
                <span className="text-right">
                  <div className="flex items-center">
                    <span className="text-gray-600 text-lg mr-2">
                      {currency}
                    </span>
                    <span className="font-light text-lg w-48 text-gray-600">
                      {changeInWorkingCapitalData !== null
                        ? `${changeInWorkingCapitalData.toLocaleString()}`
                        : "Calculating..."}
                    </span>
                  </div>
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-lg ml-4 w-80">
                  Net Borrowing
                </span>
                <span className="text-right">
                  <div className="flex items-center">
                    <span className="text-gray-600 text-lg mr-2">
                      {currency}
                    </span>
                    <span className="font-light text-lg w-48 text-gray-600">
                      {netBorrowingData !== null
                        ? `${netBorrowingData.toLocaleString()}`
                        : "Calculating..."}
                    </span>
                  </div>
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-lg ml-6 w-80">
              Cash Flow Growth Rate (Year 1-5)
            </span>
            <span className="text-right">
              <div className="flex items-center">
                <span className="text-gray-600 text-lg mr-2">PCT</span>
                <span className="font-light text-lg w-48 text-gray-600">
                  {fiveYearGrowthRate !== "Invalid data" &&
                  fiveYearGrowthRate !== "Insufficient data"
                    ? `${fiveYearGrowthRate} %`
                    : fiveYearGrowthRate}
                </span>
              </div>
            </span>
          </div>

          {/* Cash Flow Growth Rate (Year 6-10) */}
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-lg ml-6 w-80">
              Cash Flow Growth Rate (Year 6-10)
            </span>
            <span className="text-right">
              <div className="flex items-center">
                <span className="text-gray-600 text-lg mr-2">PCT</span>
                <span className="font-light text-lg w-48 text-gray-600">
                  {tenYearGrowthRate} %
                </span>
              </div>
            </span>
          </div>

          {/* Cash Flow Growth Rate (Year 15-∞) */}
          <div className="flex justify-between items-center h-6">
            <span className="text-gray-600 text-lg ml-6 w-80">
              Cash Flow Growth Rate (Year 15-{" "}
              <span className="text-xxl">∞</span>)
            </span>
            <span className="text-right">
              <div className="flex items-center">
                <span className="text-gray-600 text-lg mr-2">PCT</span>
                <span className="font-light text-lg w-48 text-gray-600">
                  {longTermGrowthRate} %
                </span>
              </div>
            </span>
          </div>

          {/* Cost of Equity Section */}
          <div className="flex justify-between items-center">
            {/* Group the arrow toggle and title together */}
            <div className="flex items-center">
              <span
                className="cursor-pointer"
                onClick={toggleCostOfEquityCollapse}
              >
                {isCostOfEquityCollapsed ? (
                  <img
                    src="/Toggle-Arrow-Collapsed.svg"
                    alt="View More"
                    className="w-2 h-2"
                  />
                ) : (
                  <img
                    src="/Toggle-Arrow-notCollapsed.svg"
                    alt="View Less"
                    className="w-2 h-2"
                  />
                )}
              </span>
              <span className="text-gray-600 text-lg ml-4 w-80">
                Cost Of Equity
              </span>
            </div>

            {/* Percentage and value on the right */}
            <span className="text-right">
              <div className="flex items-center">
                <span className="text-gray-600 text-lg mr-2">PCT</span>
                <span className="font-light text-lg w-48 text-gray-600">
                  {costOfEquity !== null && costOfEquity !== undefined
                    ? `${costOfEquity.toFixed(2)} %`
                    : "Calculating..."}
                </span>
              </div>
            </span>
          </div>

          {/* Sub-labels (Beta, Risk Free Rate, Market Risk Premium) */}
          {!isCostOfEquityCollapsed && (
            <div className="pl-8 space-y-4">
              {/* Beta */}
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-lg ml-4 w-80">Beta</span>
                <span className="text-right">
                  <div className="flex items-center">
                    <span className="text-gray-600 text-lg mr-2">VAL</span>
                    <span className="font-light text-lg w-48 text-gray-600">
                      {betaData !== null && !isNaN(betaData)
                        ? `${betaData}`
                        : "Loading..."}
                    </span>
                  </div>
                </span>
              </div>

              {/* Risk Free Rate */}
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-lg ml-4 w-80">
                  Risk Free Rate
                </span>
                <span className="text-right">
                  <div className="flex items-center">
                    <span className="text-gray-600 text-lg mr-2">PCT</span>
                    <span className="font-light text-lg w-48 text-gray-600">
                      {riskFreeRate !== null && !isNaN(riskFreeRate)
                        ? `${riskFreeRate.toFixed(2)} %`
                        : "Loading..."}
                    </span>
                  </div>
                </span>
              </div>

              {/* Market Risk Premium */}
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-lg ml-4 w-80">
                  Market Risk Premium
                </span>
                <span className="text-right">
                  <div className="flex items-center">
                    <span className="text-gray-600 text-lg mr-2">PCT</span>
                    <span className="font-light text-lg w-48 text-gray-600">
                      {marketRiskPremium !== null && !isNaN(marketRiskPremium)
                        ? `${marketRiskPremium} %`
                        : "Loading..."}
                    </span>
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
