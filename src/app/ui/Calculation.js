"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function Calculation({
  Ticker,
  FreeCashFlowEquityData,
  tenYearGrowthRate,
  costOfEquity,
  longTermGrowthRate,
  outstandingShares,
  setOutstandingShares,
  presentValue,
  setPresentValue
}) {

  const currency = "USD"; // Hardcoded currency symbol

  const fmpApiKey = process.env.NEXT_PUBLIC_FINANCIAL_API_KEY;

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

  // Calculate PV of FCFE
  useEffect(() => {
    if (
      FreeCashFlowEquityData !== null &&
      tenYearGrowthRate !== null &&
      costOfEquity !== null &&
      longTermGrowthRate !== null
    ) {
      let pv = 0;

      // Calculate PV of FCFE from Year 1 to Year 10
      for (let t = 1; t <= 10; t++) {
        const projectedFCFE = FreeCashFlowEquityData * Math.pow(1 + tenYearGrowthRate, t);
        const discountedFCFE = projectedFCFE / Math.pow(1 + costOfEquity, t);
        pv += discountedFCFE;
      }

      // Calculate the perpetuity value starting from Year 11
      const fcfeYear11 = FreeCashFlowEquityData * Math.pow(1 + tenYearGrowthRate, 11);
      const perpetuityValue = fcfeYear11 / (costOfEquity - longTermGrowthRate);

      // Discount the perpetuity value back to the present
      const discountedPerpetuityValue =
        perpetuityValue / Math.pow(1 + costOfEquity, 10);

      // Add the discounted perpetuity value to the PV
      pv += discountedPerpetuityValue;

      // Set the final present value
      setPresentValue(parseFloat(pv.toFixed(2)));

      console.log("Initial FCFE - calc:", FreeCashFlowEquityData);
      console.log("10 year Growth Rate - calc :", tenYearGrowthRate);
      console.log("Cost Of Equity -calc :", costOfEquity);
      console.log("Long-Term Growth Rate -calc :", longTermGrowthRate);
      console.log("Present Value of FCFE to Perpetuity - calc:", pv);
    }
  }, [FreeCashFlowEquityData, tenYearGrowthRate, costOfEquity, longTermGrowthRate]);

  return (
    <>
      <div className="calculation">
        <p>Calculation</p>
        <hr className="divider" />

        <div className="inner-container">
          <div className="row">
            <span className="label">
              Present Value of Free Cash Flow to Equity to Perpetuity
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
    </>
  );
}