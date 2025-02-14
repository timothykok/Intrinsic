"use client";

import { useEffect, useState, useMemo } from "react";

let currency = "USD";

export default function MultiplesValue({
  netIncome,
  outstandingShares,
  eps,
  price,
  averagePeerPE,
  setMultiplesPresentValue,
  multiplesPresentValue,
  setPresentValue,
  presentValue,
  selectedMethod
}) {
  const [intrinsicValuePerShare, setIntrinsicValuePerShare] = useState(null);
  const [discountPremium, setDiscountPremium] = useState(null);
  const [underOverValue, setUnderOverValue] = useState("");

  // Calculate intrinsic value per share using EPS * P/E Multiple
  const intrinsicValue = useMemo(() => {
    if (!netIncome || !outstandingShares || !averagePeerPE || !eps) return null;

    return parseFloat((eps * averagePeerPE).toFixed(2));
  }, [netIncome, outstandingShares, averagePeerPE, eps]);


  // setting Present Value 
  useEffect(() => {
    if (intrinsicValue != null && outstandingShares) {
      const calculatedPresentValue = intrinsicValue * outstandingShares;
      setPresentValue(calculatedPresentValue);
      setMultiplesPresentValue(calculatedPresentValue);
    }
  }, [intrinsicValue, outstandingShares, setPresentValue, setMultiplesPresentValue]);



  // Calculate values when dependencies change
  useEffect(() => {
    if (presentValue != null && outstandingShares != null && price != null) {
      const intrinsicValueCalc = presentValue / outstandingShares;
      setIntrinsicValuePerShare(intrinsicValueCalc.toFixed(2));

      const discountPremiumValue = (price / intrinsicValueCalc - 1) * 100;
      setDiscountPremium(discountPremiumValue.toFixed(2));
      setUnderOverValue(
        discountPremiumValue > 0 ? "overvalued" : "undervalued"
      );
    }
  }, [presentValue, outstandingShares, price, selectedMethod]);

  return (
    <>
      <div className="max-w-[800px] mx-auto pt-12 pb-12 mt-8 uppercase">
        <p className="text-sm text-[#626262] font-bold">Intrinsic Value</p>
        <hr className="my-4 border-zinc-200" />

        <div className="space-y-5 text-sm font-medium text-[#909090] ">
          {/* Intrinsic Value Per Share */}
          <div className="flex justify-between items-center ">
            <span className=" ml-6 w-80">Intrinsic Value Per Share</span>
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
            <span className=" ml-6 w-80">Last Closing Price</span>
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
            <span className=" ml-6 w-80">Discount/Premium</span>
            <span className="text-right">
              <div className="flex items-center">
                <span className=" mr-[11px]">PCT</span>
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
