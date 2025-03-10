"use client";

import { useEffect, useState } from "react";

let currency = "USD";

export default function FCFE({
  Ticker,
  price,
  financialData,
  presentValue,
  setPresentValue,
  dcfValuePresentValue,
  setDCFPresentValue,
  selectedMethod,
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
  const [intrinsicValuePerShare, setIntrinsicValuePerShare] = useState(null);
  const [discountPremium, setDiscountPremium] = useState(null);

  const [underOverValue, setUnderOverValue] = useState("");

  // Calculate values when dependencies change
  useEffect(() => {
    // Calculate intrinsic value per share
    const intrinsicValue =
      dcfValuePresentValue / financialData.outstandingShares;
    const formattedIntrinsicValue = intrinsicValue.toFixed(2);
    setIntrinsicValuePerShare(formattedIntrinsicValue);
    setPresentValue(formattedIntrinsicValue);

    // Compare intrinsic value with the last closing price:
    // If intrinsic value is above the price, render as "Discount"
    // Otherwise, render as "Premium"

    const discountPremiumValue = (intrinsicValue / price) * 100;

    const formattedDiscountPremium = discountPremiumValue.toFixed(2);

    setDiscountPremium(formattedDiscountPremium);

    if (intrinsicValue > price) {
      setUnderOverValue("Discount");
    } else {
      setUnderOverValue("Premium");
    }
  }, [
    presentValue,
    financialData,
    price,
    dcfValuePresentValue,
    selectedMethod,
  ]);

  return (
    <>
      <div className="max-w-[800px] mx-auto pt-4 pb-12 uppercase ml-8 text-sm">
        <p className="text-sm text-[#626262] font-bold">FCFE Valuation</p>
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
            <div className="space-y-6 pl-8 pb-12">
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
                <span className="ml-4 w-80">Change In Net Working Capital</span>
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

              <div className="flex justify-between items-center">
                <span className="ml-4 w-80">Net Borrowing</span>
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
              <hr className="my-4 border-zinc-200" />
              <div className="flex justify-between items-center">
                <span className="ml-4 w-80">Free Cash Flow To Equity</span>
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
                <span className="ml-2 w-80">
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
                <span className="ml-2 w-80">
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
                <span className="ml-2 w-96">
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

          <div className="flex justify-between items-center ">
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
              <span className="ml-4 w-80">Cost Of Equity</span>
            </div>
            <span className="text-right">
              <div className="flex items-center">
                <span className="mr-2"></span>
                <span className="w-48"></span>
              </div>
            </span>
          </div>

          {!isCostOfEquityCollapsed && (
            <div className="space-y-6 pl-8">
              <div className="ml-2 flex justify-between items-center">
                <span className="ml-2 w-80">BETA</span>
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
              <div className="ml-2 flex justify-between items-center">
                <span className="ml-2 w-80">Risk Free Rate</span>
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
              <div className="ml-2 flex justify-between items-center">
                <span className="ml-2 w-80">Market Risk Premium</span>
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
              <hr className="my-4 border-zinc-200 mt-4 mb-4 " />
              <div className="ml-2 flex justify-between items-center">
                <span className="ml-2 w-80">Cost Of Equity</span>
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
            </div>
          )}


          <div className="ml-2 flex justify-between items-center">
            <span className="ml-4 w-96">Intrinsic Value Of Equity</span>
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

        <div className="space-y-6 font-medium text-[#909090] ">
          <div className="flex justify-between items-center pt-12">
            <span className="w-96">Last Closing Price</span>
            <span className="text-right">
              <div className="flex items-center">
                <span className="mr-2">PCT</span>
                <span className="w-48">
                  {financialData.afterTaxCostOfDebt} %
                </span>
              </div>
            </span>
          </div>

          <div className="flex justify-between items-center mt-6">
            <span className="w-96">Premium</span>
            <span className="text-right">
              <div className="flex items-center">
                <span className="mr-2">PCT</span>
                <span className="w-48">
                  {financialData.afterTaxCostOfDebt} %
                </span>
              </div>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
