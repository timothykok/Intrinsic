"use client";

import { useEffect, useState } from "react";
import axios from "axios";

let currency = "USD";

export default function ShareValue({ Ticker }) {
  const [FreeCashFlowEquityData, setFreeCashFlowEquityData] = useState([]);
  const [netIncomeData, setNetIncomeData] = useState([]);

  const fmpApiKey = process.env.NEXT_PUBLIC_FINANCIAL_API_KEY;

  

  useEffect(() => {
    const fetchNetIncome = async () => {
      try {
        const response = await axios.get(
          `https://financialmodelingprep.com/api/v3/income-statement/${Ticker}?period=annual&apikey=${fmpApiKey}`
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
      <div className="share-value">
        <p> Share Value </p>
        <hr className="divider"></hr>

        <div className="inner-container">
          <div className="row">
            <span className="label">Intrinsic Value Per Share</span>
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
            <span className="label">Last Closing Price</span>
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
            <span className="label">Discount/Premium</span>
            <span className="value">
              <div className="price-qty">
                <span className="currency">PCT</span>
                <span className="number-inner">
                  ${" "}
                  {FreeCashFlowEquityData !== null
                    ? FreeCashFlowEquityData.toLocaleString()
                    : "Calculating..."}
                </span>
              </div>
            </span>
          </div>

          <div className="intrinsic-result">
           <p>Estimated DCF Value of one  AAPL stock is 122.37 USD. Compared to the current market price of 259.02 USD, the stock is <span className="valuation-percentage">undervalued by 12%. </span></p> 
          </div>
        </div>

        
        </div>

      
      
    </>
  );
}