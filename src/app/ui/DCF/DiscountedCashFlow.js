"use client";
import { useEffect, useState } from "react";

export default function DiscountedCashFlow({
  costOfEquity,
  freeCashFlowEquityData,
  financialData,
  currency
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
      <div className="max-w-[800px] mx-auto pt-12 pb-12 mt-8 uppercase text-sm">
        <p className="text-[#626262] font-bold">Financials</p>
        <hr className="my-4 border-zinc-200 mt-4 mb-4" />

        <div className="space-y-5 font-medium text-[#909090]">
          {/* Row with responsive flex-direction */}
          <div className="flex flex-col sm:flex-row justify-between items-center">
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
              <span className="ml-4 w-full sm:w-80">Free Cash Flow to Equity</span>
            </div>

            {/* Currency and value on the right */}
            <span className="text-right mt-2 sm:mt-0">
              <div className="flex items-center justify-end">
                <span className="mr-2">{currency}</span>
                <span className="w-full sm:w-48">
                  {freeCashFlowEquityData !== null
                    ? freeCashFlowEquityData.toLocaleString()
                    : "Calculating..."}
                </span>
              </div>
            </span>
          </div>

          {!isCollapsed && (
            <div className="pl-8 space-y-5">
              {/* Each inner row becomes stacked on mobile */}
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <span className="ml-4 w-full sm:w-80">Net Income</span>
                <span className="text-right mt-2 sm:mt-0">
                  <div className="flex items-center justify-end">
                    <span className="mr-2">{currency}</span>
                    <span className="w-full sm:w-48">
                      {financialData.netIncome !== null
                        ? financialData.netIncome.toLocaleString()
                        : "Calculating..."}
                    </span>
                  </div>
                </span>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                <span className="ml-4 w-full sm:w-80">
                  Depreciation & Amortization
                </span>
                <span className="text-right mt-2 sm:mt-0">
                  <div className="flex items-center justify-end">
                    <span className="mr-2">{currency}</span>
                    <span className="w-full sm:w-48">
                      {financialData.depreciationAmortization !== null
                        ? financialData.depreciationAmortization.toLocaleString()
                        : "Calculating..."}
                    </span>
                  </div>
                </span>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center">
                <span className="ml-4 w-full sm:w-80">Capital Expenditure</span>
                <span className="text-right mt-2 sm:mt-0">
                  <div className="flex items-center justify-end">
                    <span className="mr-2">{currency}</span>
                    <span className="w-full sm:w-48">
                      {financialData.capitalExpenditure !== null
                        ? financialData.capitalExpenditure.toLocaleString()
                        : "Calculating..."}
                    </span>
                  </div>
                </span>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center">
                <span className="ml-4 w-full sm:w-80">Change In Working Capital</span>
                <span className="text-right mt-2 sm:mt-0">
                  <div className="flex items-center justify-end">
                    <span className="mr-2">{currency}</span>
                    <span className="w-full sm:w-48">
                      {financialData.changeInWorkingCapital !== null
                        ? financialData.changeInWorkingCapital.toLocaleString()
                        : "Calculating..."}
                    </span>
                  </div>
                </span>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center">
                <span className="ml-4 w-full sm:w-80">Net Borrowing</span>
                <span className="text-right mt-2 sm:mt-0">
                  <div className="flex items-center justify-end">
                    <span className="mr-2">{currency}</span>
                    <span className="w-full sm:w-48">
                      {financialData.netBorrowing !== null
                        ? financialData.netBorrowing.toLocaleString()
                        : "Calculating..."}
                    </span>
                  </div>
                </span>
              </div>
            </div>
          )}

          {/* Cash Flow Growth Rate (Year 1-5) */}
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <span className="ml-6 w-full sm:w-80">
              Cash Flow Growth Rate (Year 1-5)
            </span>
            <span className="text-right mt-2 sm:mt-0">
              <div className="flex items-center justify-end">
                <span className="mr-[11px]">PCT</span>
                <span className="w-full sm:w-48">
                  {financialData.fiveYearGrowthRate !== "Invalid data" &&
                  financialData.fiveYearGrowthRate !== "Insufficient data"
                    ? `${financialData.fiveYearGrowthRate}%`
                    : financialData.fiveYearGrowthRate}
                </span>
              </div>
            </span>
          </div>

          {/* Cash Flow Growth Rate (Year 6-10) */}
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <span className="ml-6 w-full sm:w-80">
              Cash Flow Growth Rate (Year 6-10)
            </span>
            <span className="text-right mt-2 sm:mt-0">
              <div className="flex items-center justify-end">
                <span className="mr-[11px]">PCT</span>
                <span className="w-full sm:w-48">
                  {financialData.tenYearGrowthRate !== "Invalid data" &&
                  financialData.tenYearGrowthRate !== "Insufficient data"
                    ? `${financialData.tenYearGrowthRate} %`
                    : financialData.tenYearGrowthRate}
                </span>
              </div>
            </span>
          </div>

          {/* Cash Flow Growth Rate (Long Term) */}
          <div className="flex flex-col sm:flex-row justify-between items-center h-6">
            <span className="ml-6 w-full sm:w-auto">
              Cash Flow Growth Rate (Long Term)
            </span>
            <span className="text-right mt-2 sm:mt-0">
              <div className="flex items-center justify-end">
                <span className="mr-[11px]">PCT</span>
                <span className="w-full sm:w-48">
                  {financialData.longTermGrowthRate} %
                </span>
              </div>
            </span>
          </div>

          {/* Cost of Equity Section */}
          <div className="flex flex-col sm:flex-row justify-between items-center">
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
              <span className="ml-4 w-full sm:w-80">Cost Of Equity</span>
            </div>
            <span className="text-right mt-2 sm:mt-0">
              <div className="flex items-center justify-end">
                <span className="mr-[11px]">PCT</span>
                <span className="w-full sm:w-48">
                  {costOfEquity !== null && costOfEquity !== undefined
                    ? `${costOfEquity} %`
                    : "Calculating..."}
                </span>
              </div>
            </span>
          </div>

          {/* Sub-labels for Cost of Equity */}
          {!isCostOfEquityCollapsed && (
            <div className="pl-8 space-y-5">
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <span className="ml-4 w-full sm:w-80">Beta</span>
                <span className="text-right mt-2 sm:mt-0">
                  <div className="flex items-center justify-end">
                    <span className="mr-[13px]">VAL</span>
                    <span className="w-full sm:w-48">
                      {financialData.beta !== null && !isNaN(financialData.beta)
                        ? financialData.beta
                        : "Loading..."}
                    </span>
                  </div>
                </span>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <span className="ml-4 w-full sm:w-80">Risk Free Rate</span>
                <span className="text-right mt-2 sm:mt-0">
                  <div className="flex items-center justify-end">
                    <span className="mr-[11px]">PCT</span>
                    <span className="w-full sm:w-48">
                      {financialData.riskFreeRate !== null &&
                      !isNaN(financialData.riskFreeRate)
                        ? `${financialData.riskFreeRate.toFixed(2)} %`
                        : "Loading..."}
                    </span>
                  </div>
                </span>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <span className="ml-4 w-full sm:w-80">Market Risk Premium</span>
                <span className="text-right mt-2 sm:mt-0">
                  <div className="flex items-center justify-end">
                    <span className="mr-[11px]">PCT</span>
                    <span className="w-full sm:w-48">
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