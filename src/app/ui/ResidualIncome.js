"use client";

import { useEffect, useState } from "react";
import axios from "axios";

// Define the currency constant
const currency = "USD";

// Generic data fetcher using axios
const fetchData = async (url) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error);
    return null;
  }
};

// ResidualIncomeComponent expects three props:
// 1. Ticker – the stock ticker symbol
// 2. netIncome – the net income value (number)
// 3. costOfEquity – the cost of equity as a percentage (for example, "10.00" for 10%)
export default function ResidualIncomeComponent({
  Ticker,
  netIncome,
  costOfEquity,
}) {
  const [residualIncome, setResidualIncome] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const fmpApiKey = process.env.NEXT_PUBLIC_FINANCIAL_API_KEY;

  // Function to toggle collapse state
  const toggleCollapse = () => {
    setIsCollapsed((prevState) => !prevState);
  };

  useEffect(() => {
    // Only run if Ticker, netIncome, and costOfEquity are available
    if (!Ticker || netIncome === null || costOfEquity === null) return;

    const calculateResidualIncome = async () => {
      try {
        const balanceSheetData = await fetchData(
          `https://financialmodelingprep.com/api/v3/balance-sheet-statement/${Ticker}?period=annual&apikey=${fmpApiKey}`
        );
        if (!balanceSheetData || balanceSheetData.length === 0) {
          console.error("No balance sheet data found.");
          return;
        }
        // Get the total stockholders' equity from the first (most recent) balance sheet
        const totalEquity =
          parseFloat(balanceSheetData[0].totalStockholdersEquity) || 0;
        // Convert costOfEquity from a percentage to a decimal
        const coeDecimal = parseFloat(costOfEquity) / 100 || 0;
        // Calculate residual income: netIncome - (totalEquity * costOfEquity)
        const ri = netIncome - totalEquity * coeDecimal;
        setResidualIncome(ri);
      } catch (error) {
        console.error("Error calculating Residual Income:", error);
      }
    };

    calculateResidualIncome();
  }, [Ticker, netIncome, costOfEquity]);

  return (
    <>
      <div className="max-w-[800px] mx-auto pt-12 pb-12 mt-8 border border-zinc-200 bg-white-100 rounded-md p-6 shadow-sm uppercase text-sm ">
        <p className=" text-gray-600 font-bold">Financials</p>
        <hr className="my-4 border-zinc-200 mt-4 mb-4" />

        <div className="space-y-5 text-gray-500 ">
          <div className="flex justify-between items-center min-w-s">
            {/* Group the arrow toggle and title together */}
            <div className="flex items-center">
              <span className="cursor-pointer" onClick={toggleCollapse}>
                {isCollapsed ? (
                  <img
                    src="/Toggle-Arrow-Collapsed.svg"
                    alt="View More"
                    className="w-2 h-2"
                  />
                ) : (
                  <img
                    src="/Toggle-Arrow-notCollapsed.svg"
                    alt="View Less"
                    className="w-2 h-2"
                  />
                )}
              </span>
              <span className="  ml-4 w-80 ">Projected Residual Income </span>
            </div>

            {/* Currency and value on the right */}
            <span className="text-right">
              <div className="flex items-center">
                <span className="  mr-2">{currency}</span>
                <span className=" w-48 ">
                  {residualIncome !== null
                    ? residualIncome.toLocaleString()
                    : "Calculating..."}
                </span>
              </div>
            </span>
          </div>

          {!isCollapsed && (
            <div>
              <div className="pl-8 space-y-5">
                <div className="flex justify-between items-center">
                  <span className="  ml-4 w-80">Net Income</span>
                  <span className="text-right">
                    <div className="flex items-center">
                      <span className="  mr-2">{currency}</span>
                      <span className=" w-48 ">
                        {netIncome !== null
                          ? netIncome.toLocaleString()
                          : "Calculating..."}
                      </span>
                    </div>
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="  ml-4 w-80">
                    Book Value Of Equity (Beginining Of Year)
                  </span>
                  <span className="text-right">
                    <div className="flex items-center">
                      <span className="  mr-2">{currency}</span>
                      <span className=" w-48 ">
                        {netIncome !== null
                          ? netIncome.toLocaleString()
                          : "Calculating..."}
                      </span>
                    </div>
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="  ml-4 w-80">Cost Of Equity</span>
                <span className="text-right">
                  <div className="flex items-center">
                    <span className="  mr-2">{currency}</span>
                    <span className=" w-48 ">
                      {netIncome !== null
                        ? netIncome.toLocaleString()
                        : "Calculating..."}
                    </span>
                  </div>
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="  ml-6 w-80">Current Book Value Of Equity</span>
            <span className="text-right">
              <div className="flex items-center">
                <span className="  mr-[11px]">PCT</span>
                <span className=" w-48 ">
                  {netIncome !== "Invalid data" &&
                  netIncome !== "Insufficient data"
                    ? `${netIncome}%`
                    : netIncome}
                </span>
              </div>
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="  ml-6 w-80">Sales Growth To Perpetuity</span>
            <span className="text-right">
              <div className="flex items-center">
                <span className="  mr-[11px]">PCT</span>
                <span className=" w-48 ">
                  {netIncome !== "Invalid data" &&
                  netIncome !== "Insufficient data"
                    ? `${netIncome}%`
                    : netIncome}
                </span>
              </div>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
