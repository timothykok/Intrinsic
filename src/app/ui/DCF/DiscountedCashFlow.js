"use client";
import { useEffect, useState } from "react";

export default function DiscountedCashFlow({
  costOfEquity,
  freeCashFlowEquityData,
  financialData,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCostOfEquityCollapsed, setIsCostOfEquityCollapsed] = useState(false);
  const [
    isWeightedAverageCostOfCapitalCollapsed,
    setIsWeightedAverageCostOfCapitalCollapsed,
  ] = useState(false);

  const [isFreeCashFlowGrowthCollapsed, setIsFreeCashFlowGrowthCollapsed] =
    useState(false);

  const toggleCollapse = () => {
    setIsCollapsed((prevState) => !prevState);
  };

  const currency = "USD"; // Hardcoded currency symbol

  const toggleWeightedAverageCostOfCapitalCollapse = () => {
    setIsWeightedAverageCostOfCapitalCollapsed((prevState) => !prevState);
  };

  const toggleCostOfEquityCollapse = () => {
    setIsCostOfEquityCollapsed((prevState) => !prevState);
  };

  const toggleFreeCashFlowGrowthCollapse = () => {
    setIsFreeCashFlowGrowthCollapsed((prevState) => !prevState);
  };

  return (
    <>
      <div className="max-w-[800px] mx-auto pt-12 mt-8 uppercase text-sm">
        <p className="text-[#626262] font-bold ">Financials</p>
        <hr className="my-4 border-zinc-200 mt-4 mb-4" />

        <div className="max-w-[800px] mx-auto pt-8 pb-12 uppercase ml-8">
          <p className="text-sm text-[#626262] font-bold">FCFF Valuation</p>
          <hr className="my-4 border-zinc-200" />

          <div className="space-y-6 font-medium text-[#909090] ">
            {/* Free Cash Flow to Equity Row */}
            <div className="flex justify-between items-center">
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
                <span className="ml-4 w-80">Free Cash Flow</span>
              </div>
              <span className="text-right">
                <div className="flex items-center">
                  <span className="w-48">
                    {financialData.DiscountedCashFlow !== null
                      ? financialData.DiscountedCashFlow
                      : "Calculating..."}
                  </span>
                </div>
              </span>
            </div>

            {/* Additional Details - Shown when not collapsed */}
            {!isCollapsed && (
              <div className="space-y-6 pl-8 ">
                <div className="flex justify-between items-center">
                  <span className="ml-4 w-80">
                    Net Operating Profit After Tax
                  </span>
                  <span className="text-right">
                    <div className="flex items-center">
                      <span className="mr-2">{currency}</span>
                      <span className="w-48">
                        {financialData.netIncome !== null
                          ? financialData.netIncome.toLocaleString()
                          : "Calculating..."}
                      </span>
                    </div>
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="ml-4 w-80">
                    Depreciation &amp; Amortization
                  </span>
                  <span className="text-right">
                    <div className="flex items-center">
                      <span className="mr-2">{currency}</span>
                      <span className="w-48">
                        {financialData.depreciationAmortization !== null
                          ? financialData.depreciationAmortization.toLocaleString()
                          : "Calculating..."}
                      </span>
                    </div>
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="ml-4 w-80">Capital Expenditure</span>
                  <span className="text-right">
                    <div className="flex items-center">
                      <span className="mr-2">{currency}</span>
                      <span className="w-48">
                        {financialData.capitalExpenditure !== null
                          ? financialData.capitalExpenditure.toLocaleString()
                          : "Calculating..."}
                      </span>
                    </div>
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="ml-4 w-80">
                    Change In Net Working Capital
                  </span>
                  <span className="text-right">
                    <div className="flex items-center">
                      <span className="mr-2">{currency}</span>
                      <span className="w-48">
                        {financialData.changeInWorkingCapital !== null
                          ? financialData.changeInWorkingCapital.toLocaleString()
                          : "Calculating..."}
                      </span>
                    </div>
                  </span>
                </div>

                <hr className="my-4 border-zinc-200 mt-4 mb-8" />

                <div className="flex justify-between items-center">
                  <span className="ml-4 w-80">Free Cash Flow To Firm</span>
                  <span className="text-right">
                    <div className="flex items-center">
                      <span className="mr-2">{currency}</span>
                      <span className="w-48">
                        {financialData.changeInWorkingCapital !== null
                          ? financialData.changeInWorkingCapital.toLocaleString()
                          : "Calculating..."}
                      </span>
                    </div>
                  </span>
                </div>
              </div>
            )}

            {/*Free Cash Flow Growth */}
            <div className="flex justify-between items-center ">
              <div className="flex items-center">
                <span
                  className="cursor-pointer"
                  onClick={toggleFreeCashFlowGrowthCollapse}
                >
                  {isFreeCashFlowGrowthCollapsed ? (
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
                <span className="ml-4 w-80">Free Cash Flow Growth</span>
              </div>
              <span className="text-right">
                <div className="flex items-center">
                  <span className="w-48"></span>
                </div>
              </span>
            </div>

            {/* Free Cash Flow Growth Sub-labels */}
            {!isFreeCashFlowGrowthCollapsed && (
              <div className="space-y-6 pl-8">
                {/* Cash Flow Growth Rates */}
                <div className="ml-2 flex justify-between items-center">
                  <span className="ml-4 w-80">
                    Cash Flow Growth Rate (Year 1-5)
                  </span>
                  <span className="text-right">
                    <div className="flex items-center">
                      <span className="mr-2">PCT</span>
                      <span className="w-48">
                        {financialData.fiveYearGrowthRate !== "Invalid data" &&
                        financialData.fiveYearGrowthRate !== "Insufficient data"
                          ? `${financialData.fiveYearGrowthRate}%`
                          : financialData.fiveYearGrowthRate}
                      </span>
                    </div>
                  </span>
                </div>

                <div className="ml-2 flex justify-between items-center">
                  <span className="ml-4 w-80">
                    Cash Flow Growth Rate (Year 6-10)
                  </span>
                  <span className="text-right">
                    <div className="flex items-center">
                      <span className="mr-2">PCT</span>
                      <span className="w-48">
                        {financialData.tenYearGrowthRate !== "Invalid data" &&
                        financialData.tenYearGrowthRate !== "Insufficient data"
                          ? `${financialData.tenYearGrowthRate}%`
                          : financialData.tenYearGrowthRate}
                      </span>
                    </div>
                  </span>
                </div>

                <div className="ml-2 flex justify-between items-center pb-12">
                  <span className="ml-4 w-96">
                    Cash Flow Growth Rate (Long Term)
                  </span>
                  <span className="text-right">
                    <div className="flex items-center">
                      <span className="mr-2">PCT</span>
                      <span className="w-48">
                        {financialData.longTermGrowthRate} %
                      </span>
                    </div>
                  </span>
                </div>

                {/* <div className="ml-2 flex justify-between items-center pb-12">
                <span className="ml-4 w-96">
                 Net Borrowing Growth
                </span>
                <span className="text-right">
                  <div className="flex items-center">
                    <span className="mr-2">PCT</span>
                    <span className="w-48">
                      {financialData.longTermGrowthRate} %
                    </span>
                  </div>
                </span>
              </div> */}
              </div>
            )}

            {/* Weighted Average Cost of Capital */}
            <div className="flex justify-between items-center ">
              <div className="flex items-center">
                <span
                  className="cursor-pointer"
                  onClick={toggleWeightedAverageCostOfCapitalCollapse}
                >
                  {isWeightedAverageCostOfCapitalCollapsed ? (
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
                <span className="ml-4 w-80">
                  Weighted Average Cost of Capital
                </span>
              </div>
              <span className="text-right">
                <div className="flex items-center">
                  <span className="mr-2"></span>
                  <span className="w-48"></span>
                </div>
              </span>
            </div>

            {/* Weighted Average Cost of Capital Sub-labels */}
            {!isWeightedAverageCostOfCapitalCollapsed && (
              <div className="space-y-6 pl-8">
                {/* Cost of Equity Section */}
                <div className="ml-2 flex justify-between items-center">
                  <span className="ml-4 w-96">Cost Of Equity</span>
                  <span className="text-right">
                    <div className="flex items-center">
                      <span className="mr-2">PCT</span>
                      <span className="w-48">
                        {financialData.afterTaxCostOfDebt} %
                      </span>
                    </div>
                  </span>
                </div>

                <div className="ml-2 flex justify-between items-center">
                  <span className="ml-4 w-96">After Tax Cost Of Debt</span>
                  <span className="text-right">
                    <div className="flex items-center">
                      <span className="mr-2">PCT</span>
                      <span className="w-48">
                        {financialData.afterTaxCostOfDebt} %
                      </span>
                    </div>
                  </span>
                </div>

                <div className="ml-2 flex justify-between items-center">
                  <span className="ml-4 w-96">Equity Weighting</span>
                  <span className="text-right">
                    <div className="flex items-center">
                      <span className="mr-2">PCT</span>
                      <span className="w-48">
                        {financialData.equityWeighting} %
                      </span>
                    </div>
                  </span>
                </div>

                <div className="ml-2 flex justify-between items-center">
                  <span className="ml-4 w-96">Debt Weighting</span>
                  <span className="text-right">
                    <div className="flex items-center">
                      <span className="mr-2">PCT</span>
                      <span className="w-48">
                        {financialData.debtWeighting} %
                      </span>
                    </div>
                  </span>
                </div>

                <hr className="my-4 border-zinc-200 mt-4 mb-4 " />

                <div className="ml-2 flex justify-between items-center ">
                  <span className="ml-4 w-96">
                    Weighted Average Cost Of Capital
                  </span>
                  <span className="text-right">
                    <div className="flex items-center">
                      <span className="mr-2">PCT</span>
                      <span className="w-48">
                        {financialData.longTermGrowthRate} %
                      </span>
                    </div>
                  </span>
                </div>
              </div>
            )}

            <div className="ml-2 flex justify-between items-center">
              <span className="ml-4 w-96">Firm value</span>
              <span className="text-right">
                <div className="flex items-center">
                  <span className="mr-2">{currency}</span>
                  <span className="w-48">
                    {financialData.afterTaxCostOfDebt}
                  </span>
                </div>
              </span>
            </div>

            <div className="ml-2 flex justify-between items-center">
              <span className="ml-4 w-96">Total Debt</span>
              <span className="text-right">
                <div className="flex items-center">
                  <span className="mr-2">{currency}</span>
                  <span className="w-48">
                    {financialData.afterTaxCostOfDebt}
                  </span>
                </div>
              </span>
            </div>

            <div className="ml-2 flex justify-between items-center">
              <span className="ml-4 w-96">Intrinsic Value Of Equity</span>
              <span className="text-right">
                <div className="flex items-center">
                  <span className="mr-2">{currency}</span>
                  <span className="w-48">
                    {financialData.afterTaxCostOfDebt} 
                  </span>
                </div>
              </span>
            </div>

            <div className="ml-2 flex justify-between items-center">
              <span className="ml-4 w-96">Number of Shares outstanding</span>
              <span className="text-right">
                <div className="flex items-center">
                  <span className="mr-2">QTY</span>
                  <span className="w-48">
                    {financialData.afterTaxCostOfDebt}
                  </span>
                </div>
              </span>
            </div>

            <hr className="my-4 border-zinc-200 mt-4 mb-8" />

            <div className="ml-2 flex justify-between items-center">
              <span className="ml-4 w-96">Intrinsic Value Per Share</span>
              <span className="text-right">
                <div className="flex items-center">
                  <span className="mr-2">{currency}</span>
                  <span className="w-48">
                    {financialData.afterTaxCostOfDebt}
                  </span>
                </div>
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
