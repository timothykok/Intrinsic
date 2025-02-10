"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";

const currency = "USD";


export default function DiscountedCashFlow({
  Ticker,
  setFreeCashFlowEquityData,
  freeCashFlowEquityData,
  setFiveYearGrowthRate,
  fiveYearGrowthRate,
  setTenYearGrowthRate,
  tenYearGrowthRate,
  setCostOfEquity,
  costOfEquity,
  setLongTermGrowthRate,
  longTermGrowthRate,
  financialData,
  setFinancialData,
}) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isCostOfEquityCollapsed, setIsCostOfEquityCollapsed] = useState(true);

  const toggleCollapse = () => {
    setIsCollapsed((prevState) => !prevState);
  };

  const toggleCostOfEquityCollapse = () => {
    setIsCostOfEquityCollapsed((prevState) => !prevState);
  };

 



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
              <span className="  ml-4 w-80 ">Free Cash Flow to Equity</span>
            </div>

            {/* Currency and value on the right */}
            <span className="text-right">
              <div className="flex items-center">
                <span className="  mr-2">{currency}</span>
                <span className=" w-48 ">
                  {freeCashFlowEquityData !== null
                    ? freeCashFlowEquityData.toLocaleString()
                    : "Calculating..."}
                </span>
              </div>
            </span>
          </div>

          {!isCollapsed && (
            <div className="pl-8 space-y-5">
              <div className="flex justify-between items-center">
                <span className="  ml-4 w-80">Net Income</span>
                <span className="text-right">
                  <div className="flex items-center">
                    <span className="  mr-2">{currency}</span>
                    <span className=" w-48 ">
                      {financialData.netIncome !== null
                        ? financialData.netIncome.toLocaleString()
                        : "Calculating..."}
                    </span>
                  </div>
                </span>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="  ml-4 w-80">Depreciation & Amortization</span>
                <span className="text-right">
                  <div className="flex items-center">
                    <span className="  mr-2">{currency}</span>
                    <span className=" w-48 ">
                      {financialData.depreciationAmortization !== null
                        ? financialData.depreciationAmortization.toLocaleString()
                        : "Calculating..."}
                    </span>
                  </div>
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="  ml-4 w-80">Capital Expenditure</span>
                <span className="text-right">
                  <div className="flex items-center">
                    <span className="  mr-2">{currency}</span>
                    <span className=" w-48 ">
                      {financialData.capitalExpenditure !== null
                        ? financialData.capitalExpenditure.toLocaleString()
                        : "Calculating..."}
                    </span>
                  </div>
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="  ml-4 w-80">Change In Working Capital</span>
                <span className="text-right">
                  <div className="flex items-center">
                    <span className="  mr-2">{currency}</span>
                    <span className=" w-48 ">
                      {financialData.changeInWorkingCapital !== null
                        ? financialData.changeInWorkingCapital.toLocaleString()
                        : "Calculating..."}
                    </span>
                  </div>
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="  ml-4 w-80">Net Borrowing</span>
                <span className="text-right">
                  <div className="flex items-center">
                    <span className="  mr-2">{currency}</span>
                    <span className=" w-48 ">
                      {financialData.netBorrowing !== null
                        ? financialData.netBorrowing.toLocaleString()
                        : "Calculating..."}
                    </span>
                  </div>
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="  ml-6 w-80">
              Cash Flow Growth Rate (Year 1-5)
            </span>
            <span className="text-right">
              <div className="flex items-center">
                <span className="  mr-[11px]">PCT</span>
                <span className=" w-48 ">
                  {fiveYearGrowthRate !== "Invalid data" &&
                  fiveYearGrowthRate !== "Insufficient data"
                    ? `${fiveYearGrowthRate}%`
                    : fiveYearGrowthRate}
                </span>
              </div>
            </span>
          </div>

          {/* Cash Flow Growth Rate (Year 6-10) */}
          <div className="flex justify-between items-center">
            <span className="  ml-6 w-80 ">
              Cash Flow Growth Rate (Year 6-10)
            </span>
            <span className="text-right">
              <div className="flex items-center">
                <span className="  mr-[11px]">PCT</span>
                <span className=" w-48 ">
                  {tenYearGrowthRate !== "Invalid data" &&
                  tenYearGrowthRate !== "Insufficient data"
                    ? `${tenYearGrowthRate} %`
                    : tenYearGrowthRate}
                </span>
              </div>
            </span>
          </div>

          {/* Cash Flow Growth Rate (Year 10-∞) */}
          <div className="flex justify-between items-center h-6">
            <span className="  ml-6 w-80">
              Cash Flow Growth Rate (Long Term)
            </span>
            <span className="text-right">
              <div className="flex items-center">
                <span className="  mr-[11px]">PCT</span>
                <span className=" w-48 ">{longTermGrowthRate} %</span>
              </div>
            </span>
          </div>

          {/* Cost of Equity Section */}
          <div className="flex justify-between items-center">
            {/* Group the arrow toggle and title together */}
            <div className="flex items-center">
              <span
                className="cursor-pointer"
                onClick={toggleCostOfEquityCollapse}
              >
                {isCostOfEquityCollapsed ? (
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
              <span className="  ml-4 w-80">Cost Of Equity</span>
            </div>

            {/* Percentage and value on the right */}
            <span className="text-right">
              <div className="flex items-center">
                <span className="  mr-[11px]">PCT</span>
                <span className=" w-48 ">
                  {costOfEquity !== null && costOfEquity !== undefined
                    ? `${costOfEquity} %`
                    : "Calculating..."}
                </span>
              </div>
            </span>
          </div>

          {/* Sub-labels (Beta, Risk Free Rate, Market Risk Premium) */}
          {!isCostOfEquityCollapsed && (
            <div className="pl-8 space-y-5">
              {/* Beta */}
              <div className="flex justify-between items-center">
                <span className="  ml-4 w-80">Beta</span>
                <span className="text-right">
                  <div className="flex items-center">
                    <span className="  mr-[13px]">VAL</span>
                    <span className=" w-48 ">
                      {financialData.beta !== null && !isNaN(financialData.beta)
                        ? financialData.beta
                        : "Loading..."}
                    </span>
                  </div>
                </span>
              </div>

              {/* Risk Free Rate */}
              <div className="flex justify-between items-center">
                <span className="  ml-4 w-80">Risk Free Rate</span>
                <span className="text-right">
                  <div className="flex items-center">
                    <span className="  mr-[11px]">PCT</span>
                    <span className=" w-48 ">
                      {financialData.riskFreeRate !== null &&
                      !isNaN(financialData.riskFreeRate)
                        ? `${financialData.riskFreeRate.toFixed(2)} %`
                        : "Loading..."}
                    </span>
                  </div>
                </span>
              </div>

              {/* Market Risk Premium */}
              <div className="flex justify-between items-center">
                <span className="  ml-4 w-80">Market Risk Premium</span>
                <span className="text-right">
                  <div className="flex items-center">
                    <span className="  mr-[11px]">PCT</span>
                    <span className=" w-48 ">
                      {financialData.marketRiskPremium !== null &&
                      !isNaN(financialData.marketRiskPremium)
                        ? `${financialData.marketRiskPremium} %`
                        : "Loading..."}
                    </span>
                  </div>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
