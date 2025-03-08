"use client";

import { useEffect, useState } from "react";

let currency = "USD";

export default function DCFValue({
  Ticker,
  price,
  financialData,
  presentValue,
  setPresentValue,
  dcfValuePresentValue,
  setDCFPresentValue,
  selectedMethod
}) {
  const [intrinsicValuePerShare, setIntrinsicValuePerShare] = useState(null);
  const [discountPremium, setDiscountPremium] = useState(null);

  const [underOverValue, setUnderOverValue] = useState("");

  // Calculate values when dependencies change
  useEffect(() => {
    // Calculate intrinsic value per share
    const intrinsicValue = dcfValuePresentValue / financialData.outstandingShares;
    const formattedIntrinsicValue = intrinsicValue.toFixed(2);
    setIntrinsicValuePerShare(formattedIntrinsicValue);
    setPresentValue(formattedIntrinsicValue);

    // Compare intrinsic value with the last closing price:
    // If intrinsic value is above the price, render as "Discount"
    // Otherwise, render as "Premium"


    const discountPremiumValue = (intrinsicValue/price) * 100

      

    const formattedDiscountPremium = discountPremiumValue.toFixed(2);

    setDiscountPremium(formattedDiscountPremium);


    if (intrinsicValue > price) {
      setUnderOverValue("Discount");
    } else {
      setUnderOverValue("Premium");
    }
  }, [presentValue, financialData, price, dcfValuePresentValue, selectedMethod]);

  return (
    <>
      <div className="max-w-[800px] mx-auto pt-24 pb-12 uppercase">
        <p className="text-sm text-[#626262] font-bold">FCFF Valuation</p>
        <hr className="my-4 border-zinc-200" />

        <div className="space-y-6 text-sm font-medium text-[#909090] ">
          {/*Firm Value */}
          <div className="flex justify-between items-center">
            <span className="ml-6 w-80">Firm Value</span>
            <span className="text-right">
              <div className="flex items-center">
                <span className="mr-2">{currency}</span>
                <span className="w-48">
                  {intrinsicValuePerShare !== null
                    ? Number(intrinsicValuePerShare).toLocaleString()
                    : "Calculating..."}
                </span>
              </div>
            </span>
          </div>

          {/* Total Debt */}
          <div className="flex justify-between items-center">
            <span className="ml-6 w-80">Total Debt</span>
            <span className="text-right">
              <div className="flex items-center">
                <span className="mr-2">{currency}</span>
                <span className="w-48">
                  {financialData.totalDebt !== null
                    ? Number(financialData.totalDebt).toLocaleString()
                    : "Calculating..."}
                </span>
              </div>
            </span>
          </div>


          {/* Intrinsic Value */}
          <div className="flex justify-between items-center">
            <span className="ml-6 w-80">Intrinsic value of equity</span>
            <span className="text-right">
              <div className="flex items-center">
                <span className="mr-2">{currency}</span>
                <span className="w-48">
                  {intrinsicValuePerShare !== null
                    ? Number(intrinsicValuePerShare).toLocaleString()
                    : "Calculating..."}
                </span>
              </div>
            </span>
          </div>

         

          <div className="flex justify-between items-center">
            <span className="ml-6 w-80">Number Of Shares Outstanding</span>
            <span className="text-right">
              <div className="flex items-center">
                <span className="mr-2">{currency}</span>
                <span className="w-48">
                  {price !== null
                    ? Number(price).toLocaleString()
                    : "Calculating..."}
                </span>
              </div>
            </span>
          </div>

          <hr className="my-4 border-zinc-200" />

          {/* Intrinsic Value Per Share */}
          <div className="flex justify-between items-center">
            <span className="ml-6 w-80">Intrinsic Value Per Share </span>
            <span className="text-right">
              <div className="flex items-center">
                <span className="mr-2">{currency}</span>
                <span className="w-48">
                  {intrinsicValuePerShare !== null
                    ? Number(intrinsicValuePerShare).toLocaleString()
                    : "Calculating..."}
                </span>
              </div>
            </span>
          </div>

         


          {/* Last Closing Price */}
          <div className="flex justify-between items-center">
            <span className="ml-6 w-80">Last Closing Price</span>
            <span className="text-right">
              <div className="flex items-center">
                <span className="mr-2">{currency}</span>
                <span className="w-48">
                  {price !== null
                    ? Number(price).toLocaleString()
                    : "Calculating..."}
                </span>
              </div>
            </span>
          </div>

          {/* Premium/Discount Indicator */}
          <div className="flex justify-between items-center">
            <span className="ml-6 w-80"> {underOverValue ? underOverValue : "Calculating..."}</span>
            <span className="text-right">
              <div className="flex items-center">
              <span className="mr-2">PCT</span>
              <span className="w-48">
                            {discountPremium !== null
                              ? `${parseFloat(
                                  discountPremium
                                ).toFixed(2)} %`
                              : "Calculating..."}
                          </span>
              </div>
            </span>
          </div>
        </div>
      </div>
      <div className="max-w-[800px] mx-auto  pb-12 pt-12  uppercase">
        <p className="text-sm text-[#626262] font-bold">FCFE Valuation</p>
        <hr className="my-4 border-zinc-200" />

        <div className="space-y-6 text-sm font-medium text-[#909090] ">
          {/*Firm Value */}
          <div className="flex justify-between items-center">
            <span className="ml-6 w-80">Equity Value</span>
            <span className="text-right">
              <div className="flex items-center">
                <span className="mr-2">{currency}</span>
                <span className="w-48">
                  {intrinsicValuePerShare !== null
                    ? Number(intrinsicValuePerShare).toLocaleString()
                    : "Calculating..."}
                </span>
              </div>
            </span>
          </div>

         
          <div className="flex justify-between items-center">
            <span className="ml-6 w-80">Number Of Shares Outstanding</span>
            <span className="text-right">
              <div className="flex items-center">
                <span className="mr-2">{currency}</span>
                <span className="w-48">
                  {price !== null
                    ? Number(price).toLocaleString()
                    : "Calculating..."}
                </span>
              </div>
            </span>
          </div>


          {/* Intrinsic Value */}
          <div className="flex justify-between items-center">
            <span className="ml-6 w-80">Intrinsic value of equity</span>
            <span className="text-right">
              <div className="flex items-center">
                <span className="mr-2">{currency}</span>
                <span className="w-48">
                  {intrinsicValuePerShare !== null
                    ? Number(intrinsicValuePerShare).toLocaleString()
                    : "Calculating..."}
                </span>
              </div>
            </span>
          </div>

         

          <div className="flex justify-between items-center">
            <span className="ml-6 w-80">Number Of Shares Outstanding</span>
            <span className="text-right">
              <div className="flex items-center">
                <span className="mr-2">{currency}</span>
                <span className="w-48">
                  {price !== null
                    ? Number(price).toLocaleString()
                    : "Calculating..."}
                </span>
              </div>
            </span>
          </div>

          <hr className="my-4 border-zinc-200" />

          {/* Intrinsic Value Per Share */}
          <div className="flex justify-between items-center">
            <span className="ml-6 w-80">Intrinsic Value Per Share </span>
            <span className="text-right">
              <div className="flex items-center">
                <span className="mr-2">{currency}</span>
                <span className="w-48">
                  {intrinsicValuePerShare !== null
                    ? Number(intrinsicValuePerShare).toLocaleString()
                    : "Calculating..."}
                </span>
              </div>
            </span>
          </div>

             {/* Last Closing Price */}
             <div className="flex justify-between items-center pt-24">
            <span className=" w-80">Last Closing Price</span>
            <span className="text-right">
              <div className="flex items-center">
                <span className="mr-2">{currency}</span>
                <span className="w-48">
                  {price !== null
                    ? Number(price).toLocaleString()
                    : "Calculating..."}
                </span>
              </div>
            </span>
          </div>

          {/* Premium/Discount Indicator */}
          <div className="flex justify-between items-center">
            <span className=" w-80"> {underOverValue ? underOverValue : "Calculating..."}</span>
            <span className="text-right">
              <div className="flex items-center">
              <span className="mr-2">PCT</span>
              <span className="w-48">
                            {discountPremium !== null
                              ? `${parseFloat(
                                  discountPremium
                                ).toFixed(2)} %`
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