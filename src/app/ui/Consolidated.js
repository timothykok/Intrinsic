"use client";
import { useEffect, useState } from "react";

export default function Consolidated({
  financialData,
  dcfPresentValue,
  residualIncomePresentValue,
  multiplesPresentValue,
  consolidatedPresentValue,
  setPresentValue,
  presentValue,
  selectedMethod
}) {
  // Format numerical values if available
  const formattedDCF =
    dcfPresentValue !== null ? parseFloat(dcfPresentValue.toFixed(2)) : null;
  const formattedMultiples =
    multiplesPresentValue !== null ? parseFloat(multiplesPresentValue.toFixed(2)) : null;
  const formattedResidual =
    residualIncomePresentValue !== null ? parseFloat(residualIncomePresentValue.toFixed(2)) : null;
  const formattedConsolidated =
    consolidatedPresentValue !== null ? parseFloat(consolidatedPresentValue.toFixed(2)) : null;

  // Use raw outstanding shares for calculations (not the formatted string)
  const outstandingShares = financialData.outstandingSharesRaw;

  // Calculate intrinsic value per share for each method
  const intrinsicValuePerShareDCF =
    formattedDCF && outstandingShares ? parseFloat((formattedDCF / outstandingShares).toFixed(2)) : null;
  const intrinsicValuePerShareResidual =
    formattedResidual && outstandingShares ? parseFloat((formattedResidual / outstandingShares).toFixed(2)) : null;
  

  // Consolidated intrinsic value per share: average of the methods

console.log("Intrinsic Value Per Share DCF: " + intrinsicValuePerShareDCF)
console.log("Intrinsic Value Per Share Residual:" + intrinsicValuePerShareResidual)
console.log("Intrinsic Value Per Share Multiples: " + formattedMultiples)

  const intrinsicValuePerShareConsolidated =
    intrinsicValuePerShareDCF && intrinsicValuePerShareResidual && formattedMultiples
      ? parseFloat(
          (
            (intrinsicValuePerShareDCF +
              intrinsicValuePerShareResidual +
              formattedMultiples) /
            3
          ).toFixed(2)
        )
      : null;

  // Update the presentValue state (you might want to wrap this in an effect to avoid state updates during render)
  useEffect(() => {
    if (intrinsicValuePerShareConsolidated !== null) {
      setPresentValue(intrinsicValuePerShareConsolidated);
    }
  }, [intrinsicValuePerShareConsolidated, setPresentValue]);

  return (
    <div className="max-w-[800px] mx-auto pt-12 pb-12 mt-8 uppercase">
      <p className="text-sm text-[#626262] font-bold">Consolidated Valuation Results</p>
      <hr className="my-4 border-zinc-200" />

      <div className="space-y-5 text-sm font-medium text-[#909090]">
        {/* DCF Present Value */}
        <div className="flex justify-between items-center">
          <span className="ml-6 w-80">DCF Present Value</span>
          <span className="text-right flex items-center">
            <span className="mr-2">USD</span>
            <span className="w-48">
              {formattedDCF !== null ? formattedDCF.toLocaleString() : "Calculating..."}
            </span>
          </span>
        </div>
        {/* Residual Income Present Value */}
        <div className="flex justify-between items-center">
          <span className="ml-6 w-80">Residual Income Present Value</span>
          <span className="text-right flex items-center">
            <span className="mr-2">USD</span>
            <span className="w-48">
              {formattedResidual !== null ? formattedResidual.toLocaleString() : "Calculating..."}
            </span>
          </span>
        </div>
        {/* Multiples Present Value */}
        <div className="flex justify-between items-center">
          <span className="ml-6 w-80">Multiples Present Value</span>
          <span className="text-right flex items-center">
            <span className="mr-2">USD</span>
            <span className="w-48">
              {formattedMultiples !== null ? formattedMultiples.toLocaleString() : "Calculating..."}
            </span>
          </span>
        </div>
        {/* Consolidated Present Value */}
        <div className="flex justify-between items-center">
          <span className="ml-6 w-80">Consolidated Present Value</span>
          <span className="text-right flex items-center">
            <span className="mr-2">USD</span>
            <span className="w-48">
              {formattedConsolidated !== null ? formattedConsolidated.toLocaleString() : "Calculating..."}
            </span>
          </span>
        </div>
        {/* Outstanding Shares */}
        <div className="flex justify-between items-center">
          <span className="ml-6 w-80">Outstanding Shares</span>
          <span className="text-right flex items-center">
            <span className="mr-2">QTY</span>
            <span className="w-48">
              {outstandingShares !== null ? outstandingShares.toLocaleString() : "Calculating..."}
            </span>
          </span>
        </div>
        {/* Intrinsic Value Per Share (Consolidated) */}
        <div className="flex justify-between items-center">
          <span className="ml-6 w-80">Intrinsic Value Per Share</span>
          <span className="text-right flex items-center">
            <span className="mr-2">USD</span>
            <span className="w-48">
              {intrinsicValuePerShareConsolidated !== null
                ? intrinsicValuePerShareConsolidated.toLocaleString()
                : "Calculating..."}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}