"use client";

import { useEffect } from "react";
import axios from "axios";

export default function ResidualCalculation({
  ticker,
  financialData,
  costOfEquity,         // e.g., 10 for 10%
  longTermGrowthRate,     // e.g., 3 for 3%
  setPresentValue,
  presentValue,
  outstandingShares
}) {
  const currency = "USD"; // Hardcoded currency symbol

  // Calculate present value based on Residual Income Model
  useEffect(() => {
    try {
      // Ensure required data is available.
      // (Remove balanceSheetData check because we are using currentEquity and netIncome)
      if (
        !ticker ||
        financialData.netIncome === null ||
        financialData.currentEquity === null ||
        costOfEquity === null ||
        longTermGrowthRate === null
      )
        return;

      // Convert percentages to decimals
      const coeDecimal = costOfEquity / 100; // e.g., 10% becomes 0.10
      const g = longTermGrowthRate / 100;      // e.g., 3% becomes 0.03

      // Calculate the starting residual income (for the most recent year)
      // Residual Income = Net Income - (Current Equity * Cost of Equity)
      const startingRI =
        financialData.netIncome - financialData.currentEquity * coeDecimal;

      // Choose a forecast period—for example, 5 years.
      const forecastYears = 5;
      let pvResidualIncome = 0;

      // Forecast and discount residual incomes over the forecast period.
      for (let t = 1; t <= forecastYears; t++) {
        // Forecast residual income for year t.
        // Here we assume residual income grows at rate "g" each year.
        const RI_t = startingRI * Math.pow(1 + g, t);
        // Discount to present value.
        const discountedRI = RI_t / Math.pow(1 + coeDecimal, t);
        pvResidualIncome += discountedRI;
      }

      // Calculate terminal value at the end of the forecast period.
      // Using a perpetuity formula:
      // Terminal Value = (Residual Income in Year (forecastYears) * (1 + g)) / (coeDecimal - g)
      const RI_final = startingRI * Math.pow(1 + g, forecastYears);
      const terminalValue =
        (RI_final * (1 + g)) / (coeDecimal - g);
      const discountedTerminalValue =
        terminalValue / Math.pow(1 + coeDecimal, forecastYears);

      pvResidualIncome += discountedTerminalValue;

      // According to the Residual Income Model, the total intrinsic value is:
      // Intrinsic Value = Current Book Value of Equity + PV of Residual Incomes
      const intrinsicValue =
        financialData.currentEquity + pvResidualIncome;

      setPresentValue(parseFloat(intrinsicValue.toFixed(2)));
    } catch (error) {
      console.log(error);
    }
  }, [
    ticker,
    financialData.netIncome,
    financialData.currentEquity,
    costOfEquity,
    longTermGrowthRate,
  ]);
  return (
    <>
      <div className="max-w-[800px] mx-auto pt-12 pb-12 mt-8  uppercase text-sm ">
        <p className="text-gray-600 font-bold">Calculation</p>
        <hr className="my-4 border-gray-300" />
  
        <div className="space-y-5 gray-500 ">
          {/* Present Value of Residual Incomes to Perpetuity UNCHANGED */}
          <div className="flex justify-between items-center mb-6">
            <span className="text-gray-600 ml-6 w-96">
            Present Value of Residual Incomes
            </span>
            <span className="text-right">
              <div className="flex items-center">
                <span className="text-gray-600 mr-2">{currency}</span>
                <span className="w-48 text-gray-600">
                  {presentValue !== null
                    ? presentValue.toLocaleString()
                    : "Calculating..."}
                </span>
              </div>
            </span>
          </div>
  
          {/* Outstanding Shares */}
          <div className="flex justify-between items-center mb-6">
            <span className="text-gray-600 ml-6 w-80">
              Outstanding Shares
            </span>
            <span className="text-right">
              <div className="flex items-center">
                <span className="text-gray-600 mr-2">QTY</span>
                <span className="w-48 text-gray-600">
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