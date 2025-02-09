"use client";

import { useEffect, useState } from "react";

const currency = "USD";

export default function ResidualIncomeComponent({ Ticker, financialData }) {
  const [residualIncome, setResidualIncome] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [currentEquity, setCurrentEquity] = useState(null);
  const [startOfYearEquity, setStartOfYearEquity] = useState(null);

  useEffect(() => {
    if (
      !Ticker ||
      !financialData?.balanceSheetData ||
      financialData.netIncome === null
    )
      return;

    const calculateResidualIncome = () => {
      const balanceSheetData = financialData.balanceSheetData;

      const startEquity = balanceSheetData[1]?.totalStockholdersEquity || 0;
      const currentEquity = balanceSheetData[0]?.totalStockholdersEquity || 0;

      setStartOfYearEquity(parseFloat(startEquity));
      setCurrentEquity(parseFloat(currentEquity));

      const residualIncome =
        financialData.netIncome -
        (currentEquity || 0) * (financialData.costOfEquity / 100 || 0);

      setResidualIncome(residualIncome);
    };

    calculateResidualIncome();
  }, [Ticker, financialData]);

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
                {isCollapsed ? "▶" : "▼"}
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
                            {startOfYearEquity !== null
                              ? startOfYearEquity.toLocaleString()
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
                            {costOfEquity !== null
                              ? `${parseFloat(costOfEquity).toFixed(2)} %`
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
                          <span className="w-48">{"Coming soon..."}</span>
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
                  {currentEquity !== null
                    ? currentEquity.toLocaleString()
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
