'use client'

import { useState, useEffect, useCallback } from "react";

function Consolidated({ financialData, freeCashFlowEquityData, costOfEquity, eps }) {
  const [presentValue, setPresentValue] = useState(null);
  const [multiplesPresentValue, setMultiplesPresentValue] = useState(null);
  const [residualIncomePresentValue, setResidualIncomePresentValue] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Check if all required data is available
  useEffect(() => {
    if (
      freeCashFlowEquityData !== null &&
      financialData.fiveYearGrowthRate !== null &&
      financialData.tenYearGrowthRate !== null &&
      financialData.longTermGrowthRate !== null &&
      costOfEquity !== null &&
      financialData.averagePeerPE !== null &&
      eps !== null &&
      financialData.netIncome !== null &&
      financialData.currentEquity !== null
    ) {
      setDataLoaded(true);
    } else {
      setDataLoaded(false);
    }
  }, [financialData, freeCashFlowEquityData, costOfEquity, eps]);

  // DCF Calculation
  const calculateDCFPresentValue = useCallback(async () => {
    console.log("Running DCF Present Value Calculation...");
    if (!dataLoaded) return;

    try {
      let pv = 0;
      const fiveYearG = financialData.fiveYearGrowthRate / 100;
      const tenYearG = financialData.tenYearGrowthRate / 100;
      const longTermG = financialData.longTermGrowthRate / 100;
      const coe = costOfEquity / 100;

      // Year 1-5
      for (let t = 1; t <= 5; t++) {
        const projectedFCFE = freeCashFlowEquityData * Math.pow(1 + fiveYearG, t);
        pv += projectedFCFE / Math.pow(1 + coe, t);
      }

      // Year 6-10
      let fcfeYearN = freeCashFlowEquityData * Math.pow(1 + fiveYearG, 5);
      for (let t = 6; t <= 10; t++) {
        fcfeYearN *= 1 + tenYearG;
        pv += fcfeYearN / Math.pow(1 + coe, t);
      }

      // Perpetuity Value
      const fcfeYear10 = fcfeYearN;
      const perpetuityValue = (fcfeYear10 * (1 + longTermG)) / (coe - longTermG);
      pv += perpetuityValue / Math.pow(1 + coe, 10);

      setPresentValue(parseFloat(pv.toFixed(2)));
    } catch (error) {
      console.error("DCF Calculation Error:", error);
    }
  }, [dataLoaded, financialData, freeCashFlowEquityData, costOfEquity]);

  // Multiples Calculation
  const calculateMultiplesPresentValue = useCallback(() => {
    if (!dataLoaded) return;
    console.log("Running Multiples Present Value Calculation...");
    setMultiplesPresentValue(eps * financialData.averagePeerPE);
  }, [dataLoaded, eps, financialData.averagePeerPE]);

  // Residual Income Calculation
  const calculateResidualPresentValue = useCallback(() => {
    console.log("Running Residual Present Value Calculation...");
    if (!dataLoaded) return;

    try {
      const coeDecimal = costOfEquity / 100;
      const g = financialData.longTermGrowthRate / 100;
      const startingRI = financialData.netIncome - financialData.currentEquity * coeDecimal;

      let pvResidualIncome = 0;
      for (let t = 1; t <= 5; t++) {
        const RI_t = startingRI * Math.pow(1 + g, t);
        pvResidualIncome += RI_t / Math.pow(1 + coeDecimal, t);
      }

      const RI_final = startingRI * Math.pow(1 + g, 5);
      const terminalValue = (RI_final * (1 + g)) / (coeDecimal - g);
      pvResidualIncome += terminalValue / Math.pow(1 + coeDecimal, 5);

      setResidualIncomePresentValue(parseFloat(pvResidualIncome.toFixed(2)));
    } catch (error) {
      console.error("Residual Income Calculation Error:", error);
    }
  }, [dataLoaded, financialData, costOfEquity]);

  // Run all calculations once data is fully loaded
  useEffect(() => {
    if (dataLoaded) {
      calculateDCFPresentValue();
      calculateMultiplesPresentValue();
      calculateResidualPresentValue();
    }
  }, [dataLoaded, calculateDCFPresentValue, calculateMultiplesPresentValue, calculateResidualPresentValue]);

  return (
    <div>
      <h2>Valuation Results</h2>
      <p>DCF Present Value: {presentValue ? `$${presentValue}` : "Calculating..."}</p>
      <p>Multiples Present Value: {multiplesPresentValue ? `$${multiplesPresentValue}` : "Calculating..."}</p>
      <p>Residual Income Present Value: {residualIncomePresentValue ? `$${residualIncomePresentValue}` : "Calculating..."}</p>
    </div>
  );
}