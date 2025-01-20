"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function Calculation({
  Ticker,
  initialFCFE,
  growthRate,
  discountRate,
}) {
  const [outstandingShares, setOutstandingShares] = useState([]);
  const [presentValue, setPresentValue] = useState(null);
  const fmpApiKey = process.env.NEXT_PUBLIC_FINANCIAL_API_KEY;
  const currency = "USD"; // Hardcoded currency symbol

  // Fetch outstanding shares
  useEffect(() => {
    const fetchOutstandingShares = async () => {
      try {
        const response = await axios.get(
          `https://financialmodelingprep.com/api/v4/shares_float?symbol=${Ticker}&apikey=${fmpApiKey}`
        );

        if (response.data && response.data.length > 0) {
          const data = response.data[0].outstandingShares;
          console.log("Outstanding Shares:", data);
          setOutstandingShares(data);
        } else {
          console.error("No data found for outstanding shares.");
        }
      } catch (error) {
        console.error("Error fetching Outstanding Shares:", error);
      }
    };

    fetchOutstandingShares();
  }, [Ticker]);

  // Calculate Present Value of Free Cash Flow to Equity
  useEffect(() => {
    if (initialFCFE !== null && growthRate !== null && discountRate !== null) {
      let pv = 0;
      for (let t = 1; t <= 20; t++) {
        const projectedFCFE = initialFCFE * Math.pow(1 + growthRate, t);
        const discountedFCFE = projectedFCFE / Math.pow(1 + discountRate, t);
        pv += discountedFCFE;
       
      }

      
      
      setPresentValue(parseFloat(pv.toFixed(2)));

      console.log("Initial FCFE:", initialFCFE);
      console.log("Growth Rate:", growthRate);
      console.log("Discount Rate:", discountRate);
      console.log("Present Value:", pv);
    }
  }, [initialFCFE, growthRate, discountRate]);

  return (
    <div className="calculation">
      <p>Calculation</p>
      <hr className="divider" />

      <div className="inner-container">
        <div className="row">
          <span className="label">
            Present Value of 20 Year Free Cash Flow To Equity
          </span>
          <span className="value">
            <div className="price-qty">
              <span className="currency">{currency}</span>
              <span className="number-inner">
              
                {presentValue !== null
                  ? presentValue.toLocaleString()
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
                {outstandingShares !== null
                  ? outstandingShares.toLocaleString()
                  : "Calculating..."}
              </span>
            </div>
          </span>
        </div>
      </div>
    </div>
  );
}