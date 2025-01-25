"use client";

import { useEffect, useState } from "react";

let currency = "USD";

export default function Projection({ Ticker, freeCashFlowEquityData, fiveYearGrowthRate, tenYearGrowthRate, longTermGrowthRate }) {
  const years = Array.from({ length: 12 }, (_, i) => 2024 + i); // Generate years from 2024 to 2035
  const [projectedData, setProjectedData] = useState({
    freeCashFlows: [],
    discountFactors: [],
    discountedValues: [],
  });

  useEffect(() => {
    if (freeCashFlowEquityData !== null && fiveYearGrowthRate !== null && tenYearGrowthRate !== null && longTermGrowthRate !== null) {
      const freeCashFlows = [];
      const discountFactors = [];
      const discountedValues = [];
      let currentFCFE = freeCashFlowEquityData;
      const discountRate = 1 + (tenYearGrowthRate / 100);

      // Generate data for 2024 to 2035
      years.forEach((year, index) => {
        // Determine the growth rate: first 5 years, next 5 years, and long term
        let growthRate;
        if (index <= 4) {
          growthRate = fiveYearGrowthRate / 100; // Use five-year growth rate
        } else if (index <= 10) {
          growthRate = tenYearGrowthRate / 100; // Use ten-year growth rate
        } else {
          growthRate = longTermGrowthRate / 100; // Use long-term growth rate
        }

        // Update Free Cash Flow
        if (index > 0) {
          currentFCFE *= 1 + growthRate;
        }
        freeCashFlows.push(currentFCFE);

        // Calculate Discount Factor
        const discountFactor = Math.pow(discountRate, index + 1);
        discountFactors.push(discountFactor);

        // Calculate Discounted Value
        const discountedValue = currentFCFE / discountFactor;
        discountedValues.push(discountedValue);
      });

      setProjectedData({ freeCashFlows, discountFactors, discountedValues });
    }
  }, [freeCashFlowEquityData, fiveYearGrowthRate, tenYearGrowthRate, longTermGrowthRate]);

  return (
    <>
      <div className="projection-wrapper">
        <div className="financial-table-title">
          <p className="financial-table-title">Year On Year</p>
          <hr className="divider" />
        </div>
        <table className="financial-table">
          <thead>
            <tr>
              <th>Year</th>
              {years.map((year) => (
                <td key={year}>{year}</td>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>Free Cash Flow (Projected) (Millions)</th>
              {projectedData.freeCashFlows.map((fcf, index) => (
                <td key={index}>{(fcf / 1_000_000).toFixed(2)}</td>
              ))}
            </tr>
            <tr>
              <th>Discount Factor</th>
              {projectedData.discountFactors.map((factor, index) => (
                <td key={index}>{factor.toFixed(2)}</td>
              ))}
            </tr>
            <tr>
              <th>Discount Value (Millions)</th>
              {projectedData.discountedValues.map((value, index) => (
                <td key={index}>{(value / 1_000_000).toFixed(2)}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      
    </>
  );
}