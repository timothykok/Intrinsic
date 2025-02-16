"use client";
import { useState } from "react";

export default function Consolidated({
  financialData,
  freeCashFlowEquityData,
  costOfEquity,
  eps,
  multiplesPresentValue,
  dcfPresentValue,
  residualIncomePresentValue,
  consolidatedPresentValue,
}) {
  console.log(" COMPONENT DCF Present Value (presentValue):", dcfPresentValue);
  console.log("COMPONENT Residual Income Present Value:", residualIncomePresentValue);
  console.log("COMPONENT Multiples Present Value:", multiplesPresentValue);
  console.log("COMPONENT New Consolidated Present Value 2:", consolidatedPresentValue);
  console.log("COMPONENT OUTSTANDING SHARES:", financialData.outstandingShares);

  // Ensure numerical values are formatted correctly
  const formattedDCF = dcfPresentValue !== null ? parseFloat(dcfPresentValue.toFixed(2)) : null;
  const formattedMultiples = multiplesPresentValue !== null ? parseFloat(multiplesPresentValue.toFixed(2)) : null;
  const formattedResidual = residualIncomePresentValue !== null ? parseFloat(residualIncomePresentValue.toFixed(2)) : null;
  const formattedConsolidated = consolidatedPresentValue !== null ? parseFloat(consolidatedPresentValue.toFixed(2)) : null;
  
  const formattedShares = financialData.outstandingShares !== null 
    ? parseFloat(financialData.outstandingShares.toFixed(2)) 
    : null;

  // Calculate intrinsic value per share for each valuation method
  const intrinsicValuePerShareDCF = formattedDCF && formattedShares 
    ? parseFloat((formattedDCF / formattedShares).toFixed(2)) 
    : null;

  const intrinsicValuePerShareMultiples = formattedMultiples && formattedShares 
    ? parseFloat((formattedMultiples / formattedShares).toFixed(2)) 
    : null;

  const intrinsicValuePerShareResidual = formattedResidual && formattedShares 
    ? parseFloat((formattedResidual / formattedShares).toFixed(2)) 
    : null;

  const intrinsicValuePerShareConsolidated = formattedConsolidated && formattedShares 
    ? parseFloat((formattedConsolidated / formattedShares).toFixed(2)) 
    : null;

  return (
    <div>
      <h2>
        Consolidated Valuation Results{" "}
        {formattedConsolidated !== null
          ? `$${formattedConsolidated}`
          : "Calculating..."}
      </h2>

      <p> -------------------------------------------------------------</p>
      <p>
        DCF Present Value:{" "}
        {formattedDCF !== null ? `$${formattedDCF}` : "Calculating..."}
      </p>
      <p>
        Multiples Present Value:{" "}
        {formattedMultiples !== null
          ? `$${formattedMultiples}`
          : "Calculating..."}
      </p>
      <p>
        Residual Income Present Value:{" "}
        {formattedResidual !== null
          ? `$${formattedResidual}`
          : "Calculating..."}
      </p>
      <p> -------------------------------------------------------------</p>
      
      <p>
        Outstanding Shares:{" "}
        {formattedShares !== null
          ? `${formattedShares}`
          : "Calculating..."}
      </p>

      <p> -------------------------------------------------------------</p>
    
      <h3>Intrinsic Value Per Share</h3>
      <p>
        DCF Method:{" "}
        {intrinsicValuePerShareDCF !== null
          ? `$${intrinsicValuePerShareDCF}`
          : "Calculating..."}
      </p>
      <p> -------------------------------------------------------------</p>

      <p>
        Multiples Method:{" "}
        {intrinsicValuePerShareMultiples !== null
          ? `$${intrinsicValuePerShareMultiples}`
          : "Calculating..."}
      </p>
      <p> -------------------------------------------------------------</p>

      <p>
        Residual Income Method:{" "}
        {intrinsicValuePerShareResidual !== null
          ? `$${intrinsicValuePerShareResidual}`
          : "Calculating..."}
      </p>
      <p> -------------------------------------------------------------</p>

      <p>
        Consolidated Valuation:{" "}
        {intrinsicValuePerShareConsolidated !== null
          ? `$${intrinsicValuePerShareConsolidated}`
          : "Calculating..."}
      </p>
    </div>
  );
}