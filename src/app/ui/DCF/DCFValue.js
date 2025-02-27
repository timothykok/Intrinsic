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


      console.log("DCFValue present value " + dcfValuePresentValue)
      console.log("Outstanding " +  financialData.outstandingShares)
   
      const intrinsicValue = dcfValuePresentValue / financialData.outstandingShares;





      console.log("intrinsic value " + intrinsicValue)
      const formattedIntrinsicValue = intrinsicValue.toFixed(2);
  
     


      setIntrinsicValuePerShare(formattedIntrinsicValue);

      setPresentValue(formattedIntrinsicValue)

      console.log("formatted Intrinsic value " + formattedIntrinsicValue)

   


    
      const discountPremiumValue = (price / intrinsicValue - 1) * 100; // Calculate as percentage

      const formattedDiscountPremium = discountPremiumValue.toFixed(2);

      setDiscountPremium(formattedDiscountPremium);

      // Determine under/overvaluation
      setUnderOverValue(
        formattedDiscountPremium > 0 ? "overvalued" : "undervalued"
      );


  }, [presentValue, financialData, price, selectedMethod]);

  return (
    <>
      <div className="max-w-[800px] mx-auto pt-12 pb-12 mt-8 uppercase">
        <p className="text-sm text-[#626262] font-bold">Intrinsic Value</p>
        <hr className="my-4 border-zinc-200" />

        <div className="space-y-5 text-sm font-medium text-[#909090] ">
          {/* Intrinsic Value Per Share */}
          <div className="flex justify-between items-center ">
            <span className=" ml-6 w-80">
              Intrinsic Value Per Share
            </span>
            <span className="text-right">
              <div className="flex items-center">
                <span className=" mr-2">{currency}</span>
                <span className="w-48 ">
                  {intrinsicValuePerShare !== null
                    ? intrinsicValuePerShare.toLocaleString()
                    : "Calculating..."}
                </span>
              </div>
            </span>
          </div>

          {/* Last Closing Price */}
          <div className="flex justify-between items-center ">
            <span className=" ml-6 w-80">
              Last Closing Price
            </span>
            <span className="text-right">
              <div className="flex items-center">
                <span className=" mr-2">{currency}</span>
                <span className="w-48 ">
                  {price !== null ? price.toLocaleString() : "Calculating..."}
                </span>
              </div>
            </span>
          </div>

          {/* Discount/Premium */}
          <div className="flex justify-between items-center ">
            <span className=" ml-6 w-80">
              Discount/Premium
            </span>
            <span className="text-right">
              <div className="flex items-center">
                <span className=" mr-[10px]">PCT</span>
                <span className="w-48 ">
                  {discountPremium !== null
                    ? discountPremium.toLocaleString()
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
