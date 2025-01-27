"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function Calculation({
  Ticker,
  freeCashFlowEquityData,
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
      freeCashFlowEquityData !== null &&
      tenYearGrowthRate !== null &&
      costOfEquity !== null &&
      longTermGrowthRate !== null
    ) {
      let pv = 0;

      // Calculate PV of FCFE from Year 1 to Year 10
      for (let t = 1; t <= 10; t++) {
        const projectedFCFE = freeCashFlowEquityData * Math.pow(1 + tenYearGrowthRate, t);
        const discountedFCFE = projectedFCFE / Math.pow(1 + costOfEquity, t);
        pv += discountedFCFE;
      }

      // Calculate the perpetuity value starting from Year 11
      const fcfeYear11 = freeCashFlowEquityData * Math.pow(1 + tenYearGrowthRate, 11);
      const perpetuityValue = fcfeYear11 / (costOfEquity - longTermGrowthRate);

      // Discount the perpetuity value back to the present
      const discountedPerpetuityValue =
        perpetuityValue / Math.pow(1 + costOfEquity, 10);

      // Add the discounted perpetuity value to the PV
      pv += discountedPerpetuityValue;

      // Set the final present value
      setPresentValue(parseFloat(pv.toFixed(2)));

      console.log("Initial FCFE - calc:", freeCashFlowEquityData);
      console.log("10 year Growth Rate - calc :", tenYearGrowthRate);
      console.log("Cost Of Equity -calc :", costOfEquity);
      console.log("Long-Term Growth Rate -calc :", longTermGrowthRate);
      console.log("Present Value of FCFE to Perpetuity - calc:", pv);
    }
  }, [freeCashFlowEquityData, tenYearGrowthRate, costOfEquity, longTermGrowthRate]);

  return (
    <>
      <div className="max-w-[800px] mx-auto mt-8">
        <p className="text-lg font-light text-gray-600">Calculation</p>
        <hr className="my-4 border-gray-300" />
  
        <div className="space-y-4">
          {/* Present Value of Free Cash Flow to Equity to Perpetuity */}
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-lg ml-4 w-96 ">
              Present Value of Free Cash Flow to Equity
            </span>
            <span className="text-right">
              <div className="flex items-center">
                <span className="text-gray-600 text-lg mr-2">{currency}</span>
                <span className="font-light text-lg w-48 text-gray-600">
                  {presentValue !== null
                    ? presentValue.toLocaleString()
                    : "Calculating..."}
                </span>
              </div>
            </span>
          </div>
  
          {/* Outstanding Shares */}
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-lg ml-4 w-80">
              Outstanding Shares
            </span>
            <span className="text-right">
              <div className="flex items-center">
                <span className="text-gray-600 text-lg mr-2">QTY</span>
                <span className="font-light text-lg w-48 text-gray-600">
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