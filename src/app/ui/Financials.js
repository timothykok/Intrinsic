"use client";

import { useEffect, useState } from "react";
import axios from "axios";

let currency = "USD";

export default function Financials() {
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

  useEffect(() => {
    const fetchNetIncome = async () => {
      try {
        const response = await axios.get(
          "https://financialmodelingprep.com/api/v3/income-statement/AAPL?period=annual&apikey=hg2NroPZx6bZbTWXJjqon6L5Pb53HCko"
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
          "https://financialmodelingprep.com/api/v3/cash-flow-statement/AAPL?period=annual&apikey=hg2NroPZx6bZbTWXJjqon6L5Pb53HCko"
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
          "https://www.alphavantage.co/query?function=CASH_FLOW&symbol=AAPL&apikey=496Z5WWYIJYB3MFM"
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
        console.error("Error fetching Net Borrowing data:", error);
      }
    };

    //finished API limits + inaccurate data for some searches - looking for alternatives
    const fetchFiveYearGrowthRate = async () => {
      try {
        const response = await axios.get(
          "https://www.alphavantage.co/query?function=EARNINGS&symbol=IBM&apikey=496Z5WWYIJYB3MFM"
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

    fetchNetIncome();
    fetchCashFlow();
    fetchNetBorrowing();
    fetchFiveYearGrowthRate();
  }, []);

  useEffect(() => {
    // Calculate Free Cash Flow to Equity when all data is available. If all the required data comes from a single API call, you don’t need this separation.
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
    <div className ="financials">

      <p> Financials </p>

    <div className="inner-container">
        <div className="row">
          <span className="label">Free Cash Flow to Equity</span>
          <span className="value">
            <div className="price-qty">
              <span className="currency">{currency}</span>
              <span className="number-inner">
                ${" "}
                {FreeCashFlowEquityData !== null
                  ? FreeCashFlowEquityData.toLocaleString()
                  : "Calculating..."}
              </span>
            </div>
          </span>
        </div>

        <div className="sub-values">
          <div className="row">
            <span className="label">Net Income</span>
            <span className="value">
              <div className="price-qty-inner">
                <div className="currency-inner">
                  <p>{currency}</p>
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
            <span className="label">Depreciation & Amortization</span>
            <span className="value">
              <div className="price-qty-inner">
                <div className="currency-inner">
                  <p>{currency}</p>
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
            <span className="label">Capital Expenditure</span>
            <span className="value">
              <div className="price-qty-inner">
                <div className="currency-inner">
                  <p>{currency}</p>
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
            <span className="label">Change In Working Capital</span>
            <span className="value">
              <div className="price-qty-inner">
                <div className="currency-inner">
                  <p>{currency}</p>
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
            <span className="label">Net Borrowing</span>
            <span className="value">
              <div className="price-qty-inner">
                <div className="currency-inner">
                  <p>{currency}</p>
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


          {/* 5-Year EPS Growth Rate */}
          <div className="row">
            <span className="label">Cash Flow Growth Rate (Year 1-5)</span>
            <span className="value">
              <div className="price-qty-inner">
              <div className="percentage-inner">
              <p> PCT </p>
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
            <span className="label">Cash Flow Growth Rate (Year 6-10)</span>
            <span className="value">
              <div className="price-qty-inner">
              <div className="percentage-inner">
              <p> PCT </p>
                </div>
                <div className="number-inner">
                  <p>
                    {/* Replace with your calculated value for the 10-year EPS growth rate */}
                    {"Loading"}
                  </p>
                </div>
              </div>
            </span>
          </div>

          {/* 20-Year EPS Growth Rate */}
          <div className="row">
            <span className="label">Cash Flow Growth Rate (Year 15-20)</span>
            <span className="value">
              <div className="price-qty-inner">
              <div className="percentage-inner">
              <p> PCT </p>
                </div>
                <div className="number-inner">
                  <p>
                    {/* Replace with your calculated value for the 20-year EPS growth rate */}
                    {"Loading"}
                  </p>
                </div>
              </div>
            </span>
          </div>

          <div className="row">
            <span className="label">Cost of Equity </span>
            <span className="value">
              <div className="price-qty-inner">
              <div className="percentage-inner">
                  <p> PCT </p>
                </div>
                <div className="number-inner">
                  <p>
                    {"Loading"}
                  </p>
                </div>
              </div>
            </span>
          </div>
      </div>

  

  

    </div>
     

       
  
   
    </>
  );
}
