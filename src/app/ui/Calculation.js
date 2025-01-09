"use client";

import { useEffect, useState } from "react";
import axios from "axios";

let currency = "USD";

export default function Calculation() {
  const [FreeCashFlowEquityData, setFreeCashFlowEquityData] = useState([]);
  const [netIncomeData, setNetIncomeData] = useState([]);

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

    fetchNetIncome();
  }, []);

  return (
    <>
      <div className="calculation">
        <p> Calculation </p>

        <div className="inner-container">
          <div className="row">
            <span className="label">Present Value of 20 Year Free Cash Flow To Equity</span>
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


          <div className="row">
            <span className="label">Outstanding Shares</span>
            <span className="value">
              <div className="price-qty">
                <span className="currency">QTY</span>
                <span className="number-inner">
                  ${" "}
                  {FreeCashFlowEquityData !== null
                    ? FreeCashFlowEquityData.toLocaleString()
                    : "Calculating..."}
                </span>
              </div>
            </span>
          </div>
        </div>
        </div>

      
      
    </>
  );
}