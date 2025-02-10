"use client";

import { useEffect, useState } from "react";

const currency = "USD";

export default function ResidualIncome({ ticker, financialData }) {
  const [residualIncome, setResidualIncome] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    if (!ticker || financialData.netIncome === null) return;

    const calculateResidualIncome = () => {
      const residualIncome =
        financialData.netIncome -
        (financialData.currentEquity || 0) *
          (financialData.costOfEquity / 100 || 0);

          console.log("RESIDUAL INCOME: " + residualIncome)
      setResidualIncome(residualIncome);
    };

    calculateResidualIncome();
  }, [ticker, financialData]);

  return (
    <>
      <div className="max-w-[800px] mx-auto pt-12 pb-12 mt-8 border border-zinc-200 bg-white-100 rounded-md p-6 shadow-sm uppercase text-sm ">
        <p className=" text-gray-600 font-bold">Financials</p>
        <hr className="my-4 border-zinc-200 mt-4 mb-4" />

        <div className="space-y-5 text-gray-500 ">
          <div className="flex justify-between items-center min-w-s">
            <div className="flex items-center">
              <span
                className="cursor-pointer"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
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
              <span className="ml-4 w-80">Projected Residual Income</span>
            </div>

            <span className="text-right">
              <div className="flex items-center">
                <span className="mr-2">{currency}</span>
                <span className="w-48">
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
                <div>
                  <div className="pl-8 space-y-5">
                    <div className="flex justify-between items-center">
                      <span className="ml-4 w-80">Net Income</span>
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
                        Book Value Of Equity (Beginning Of Year)
                      </span>
                      <span className="text-right">
                        <div className="flex items-center">
                          <span className="mr-2">{currency}</span>
                          <span className="w-48">
                            {financialData.startEquity !== null
                              ? financialData.startEquity.toLocaleString()
                              : "Calculating..."}
                          </span>
                        </div>
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="ml-4 w-80">Cost Of Equity</span>
                      <span className="text-right">
                        <div className="flex items-center">
                          <span className="mr-2">PCT</span>
                          <span className="w-48">
                            {financialData.costOfEquity !== null
                              ? `${parseFloat(
                                  financialData.costOfEquity
                                ).toFixed(2)} %`
                              : "Calculating..."}
                          </span>
                        </div>
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="ml-4 w-80">
                        Sales Growth To Perpetuity
                      </span>
                      <span className="text-right">
                        <div className="flex items-center">
                          <span className="mr-2">PCT</span>
                          <span className="w-48">
                            {financialData.salesGrowthToPerpetuity !== null &&
                            financialData.salesGrowthToPerpetuity !== undefined
                              ? `${parseFloat(
                                  financialData.salesGrowthToPerpetuity
                                ).toFixed(2)} %`
                              : "Calculating..."}
                          </span>
                        </div>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="ml-6 w-80">Current Book Value Of Equity</span>
            <span className="text-right">
              <div className="flex items-center">
                <span className="mr-2">{currency}</span>
                <span className="w-48">
                  {financialData.currentEquity !== null
                    ? financialData.currentEquity.toLocaleString()
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
