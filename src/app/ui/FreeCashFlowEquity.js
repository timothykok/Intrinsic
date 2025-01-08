"use client";

import { useEffect, useState } from "react";
import axios from "axios";

let currency = "USD";

export default function FreeCashFlowEquity() {
  const [FreeCashFlowEquityData, setFreeCashFlowEquityData] = useState([]);
  const [netIncomeData, setNetIncomeData] = useState([]);
  const [depreceationAmortizationData, setDepreceationAmortizationData] =
    useState([]);
  const [capitalExpenditureData, setCapitalExpenditureData] = useState([]);
  const [changeInWorkingCapitalData, setChangeInWorkingCapitalData] = useState(
    []
  );
  const [netBorrowingData, setNetBorrowingData] = useState(null);

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
          "https://www.alphavantage.co/query?function=CASH_FLOW&symbol=IBM&apikey=496Z5WWYIJYB3MFM"
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

    fetchNetIncome();
    fetchCashFlow();
    fetchNetBorrowing();
  }, []);

  useEffect(() => {
    // Calculate Free Cash Flow to Equity when all data is available
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
    <div className="fcfe-container">
    <div className="fcfe-row">
      <span className="fcfe-label">Free Cash Flow to Equity:</span>
      <span className="fcfe-value">
        <div className="price-qty">
          <span className="currency">{currency}</span>
          <span className="numeric-value">
            $ {FreeCashFlowEquityData !== null
              ? FreeCashFlowEquityData.toLocaleString()
              : "Calculating..."}
          </span>
        </div>
      </span>
    </div>

      <div className="fcfe-row">
        <span className="fcfe-label">Net Income:</span>
        <span className="fcfe-value">
          <div className="price-qty">
            <span className="currency">{currency}</span>
            <span className="numeric-value">
              ${" "}
              {netIncomeData.length > 0
                ? netIncomeData[0].netIncome.toLocaleString()
                : "Loading..."}
            </span>
          </div>
        </span>
      </div>

      <div className="fcfe-row">
        <span className="fcfe-label">Depreciation & Amortization:</span>
        <span className="fcfe-value">
          <div className="price-qty">
            <span className="currency">{currency}</span>
            <span className="numeric-value">
              ${" "}
              {depreceationAmortizationData.length > 0
                ? depreceationAmortizationData[0].depreceationAmortization.toLocaleString()
                : "Loading..."}
            </span>
          </div>
        </span>
      </div>

      <div className="fcfe-row">
        <span className="fcfe-label">Capital Expenditure:</span>
        <span className="fcfe-value">
          <div className="price-qty">
            <span className="currency">{currency}</span>
            <span className="numeric-value">
              ${" "}
              {capitalExpenditureData.length > 0
                ? capitalExpenditureData[0].capitalExpenditure.toLocaleString()
                : "Loading..."}
            </span>
          </div>
        </span>
      </div>

      <div className="fcfe-row">
        <span className="fcfe-label">Change In Working Capital:</span>
        <span className="fcfe-value">
          <div className="price-qty">
            <span className="currency">{currency}</span>
            <span className="numeric-value">
              ${" "}
              {changeInWorkingCapitalData.length > 0
                ? changeInWorkingCapitalData[0].changeInWorkingCapital.toLocaleString()
                : "Loading..."}
            </span>
          </div>
        </span>
      </div>

      <div className="fcfe-row">
        <span className="fcfe-label">Net Borrowing:</span>
        <span className="fcfe-value">
          <div className="price-qty">
            <span className="currency">{currency}</span>
            <span className="numeric-value">
              ${" "}
              {netBorrowingData !== null
                ? netBorrowingData.toLocaleString()
                : "Loading..."}
            </span>
          </div>
        </span>
      </div>
    </div>
  );
}
