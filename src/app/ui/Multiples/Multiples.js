"use client";

import { useState, useEffect, useMemo } from "react";

let currency = "USD";

export default function Multiples({
  netIncome, // e.g., from financialData.netIncome
  financialData, // from state
  outstandingShares,
  eps,
  averagePeerPE,
}) {
  // Calculate intrinsic value per share using EPS * P/E Multiple
  const intrinsicValue = useMemo(() => {
    if (!netIncome || !outstandingShares || !averagePeerPE || !eps) return null;

    return parseFloat((eps * averagePeerPE).toFixed(2));
  }, [netIncome, outstandingShares, averagePeerPE, eps]);

  console.log("netIncome: " + netIncome);
  console.log("outstandingShares: " + outstandingShares);
  console.log("averagePeerPE: " + averagePeerPE);
  console.log("eps: " + eps);

  return (
    <>
      <div className="multiples-calculation max-w-[800px] mx-auto pt-12  mt-8 uppercase text-sm text-[#626262]">
        <h2 className="text-sm text-[#626262] font-bold mb-4">Financials</h2>
        <hr className="my-4 border-zinc-200 mt-4 mb-4" />

        {/* Net Income */}
        <div className="flex justify-between items-center mb-6">
          <span className="ml-4 w-80">Sales Revenue</span>
          <span className="text-right">
            <div className="flex items-center">
              <span className="mr-2">{currency}</span>
              <span className="w-48">
                {netIncome !== null
                  ? netIncome.toLocaleString()
                  : "Calculating..."}
              </span>
            </div>
          </span>
        </div>

        {/* Net Income */}
        <div className="flex justify-between items-center mb-6">
          <span className="ml-4 w-80">EBITDA</span>
          <span className="text-right">
            <div className="flex items-center">
              <span className="mr-2">{currency}</span>
              <span className="w-48">
                {eps !== null ? eps.toLocaleString() : "Calculating..."}
              </span>
            </div>
          </span>
        </div>

        {/* Industry P/E Multiple Input */}
        <div className="flex justify-between items-center mb-6">
          <span className="ml-4 w-80">Net Income</span>
          <span className="text-right">
            <div className="flex items-center">
              <span className="mr-2">{currency}</span>
              <span className="w-48">
                {netIncome !== null ? netIncome.toLocaleString() : "Calculating..."}
              </span>
            </div>
          </span>
        </div>
      </div>


      <div className="multiples-calculation max-w-[800px] mx-auto pt-12 mt-8 uppercase text-sm text-[#626262]">
        <h2 className="text-sm text-[#626262] font-bold mb-4">Firm Value Multiples</h2>
        <hr className="my-4 border-zinc-200 mt-4 mb-4" />

        {/* Net Income */}
        <div className="flex justify-between items-center mb-6">
          <span className="ml-4 w-80">EV / Sales</span>
          <span className="text-right">
            <div className="flex items-center">
              <span className="mr-2">{currency}</span>
              <span className="w-48">
                {netIncome !== null
                  ? netIncome.toLocaleString()
                  : "Calculating..."}
              </span>
            </div>
          </span>
        </div>

        {/* Net Income */}
        <div className="flex justify-between items-center mb-6">
          <span className="ml-4 w-80">EV / Ebitda</span>
          <span className="text-right">
            <div className="flex items-center">
              <span className="mr-2">{currency}</span>
              <span className="w-48">
                {eps !== null ? eps.toLocaleString() : "Calculating..."}
              </span>
            </div>
          </span>
        </div>

        {/* Industry P/E Multiple Input */}
        <div className="flex justify-between items-center mb-6">
          <span className="ml-4 w-80">Net Income</span>
          <div className="flex items-center">
            {averagePeerPE !== null && (
              <span className="ml-2 text-gray-500">{averagePeerPE}</span>
            )}
          </div>
        </div>
      </div>

      <div className="multiples-calculation max-w-[800px] mx-auto pt-12 mt-8 uppercase text-sm text-[#626262]">
        <h2 className="text-sm text-[#626262] font-bold mb-4">equity value multiples</h2>
        <hr className="my-4 border-zinc-200 mt-4 mb-4" />

        {/* Net Income */}
        <div className="flex justify-between items-center mb-6">
          <span className="ml-4 w-80">P/E</span>
          <span className="text-right">
            <div className="flex items-center">
              <span className="mr-2">{currency}</span>
              <span className="w-48">
                {netIncome !== null
                  ? netIncome.toLocaleString()
                  : "Calculating..."}
              </span>
            </div>
          </span>
        </div>
  
      </div>

      <div className="multiples-calculation max-w-[800px] mx-auto pt-12 mt-8 uppercase text-sm text-[#626262]">
        <h2 className="text-sm text-[#626262] font-bold mb-4">VALUATION</h2>
        <hr className="my-4 border-zinc-200 mt-4 mb-4" />

        {/* Net Income */}
        <div className="flex justify-between items-center mb-6">
          <span className="ml-4 w-80">Enterprise Value</span>
          <span className="text-right">
            <div className="flex items-center">
              <span className="mr-2">{currency}</span>
              <span className="w-48">
                {netIncome !== null
                  ? netIncome.toLocaleString()
                  : "Calculating..."}
              </span>
            </div>
          </span>
        </div>

        {/* Net Income */}
        <div className="flex justify-between items-center mb-6">
          <span className="ml-4 w-80">Total Debt</span>
          <span className="text-right">
            <div className="flex items-center">
              <span className="mr-2">{currency}</span>
              <span className="w-48">
                {netIncome !== null
                  ? netIncome.toLocaleString()
                  : "Calculating..."}
              </span>
            </div>
          </span>
        </div>

        {/* Net Income */}
        <div className="flex justify-between items-center mb-6">
          <span className="ml-4 w-80">Equity Value</span>
          <span className="text-right">
            <div className="flex items-center">
              <span className="mr-2">{currency}</span>
              <span className="w-48">
                {netIncome !== null
                  ? netIncome.toLocaleString()
                  : "Calculating..."}
              </span>
            </div>
          </span>
        </div>
  
      </div>
    </>
  );
}
