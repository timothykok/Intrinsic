"use client";

import { useEffect, useState } from "react";

let currency = "USD";

export default function ShareValue({
  Ticker,
  price,
  outStandingShares,
  presentValue,
}) {
  const [intrinsicValuePerShare, setIntrinsicValuePerShare] = useState(null);
  const [discountPremium, setDiscountPremium] = useState(null);
  const [underOverValue, setUnderOverValue] = useState("");

  // Calculate values when dependencies change
  useEffect(() => {
    if (presentValue && outStandingShares && price) {
      const intrinsicValue = presentValue / outStandingShares;

      const formattedIntrinsicValue = intrinsicValue.toFixed(2)

      setIntrinsicValuePerShare(formattedIntrinsicValue);

      const discountPremiumValue = (price / intrinsicValue - 1) * 100; // Calculate as percentage

      const formattedDiscountPremium =discountPremiumValue.toFixed(2)

      setDiscountPremium(formattedDiscountPremium);

      // Determine under/overvaluation
      setUnderOverValue(
        formattedDiscountPremium > 0 ? "overvalued" : "undervalued"
      );
    }
  }, [presentValue, outStandingShares, price]);

  return (
    <>
      <div className="max-w-[800px] mx-auto mt-12 border border-gray-300 rounded-lg p-6">
        <p className="text-lg font-light text-gray-600">Intrinsic Value</p>
        <hr className="my-4 border-gray-300" />
  
        <div className="space-y-4">
          {/* Intrinsic Value Per Share */}
          <div className="flex justify-between items-center mb-6">
            <span className="text-gray-600 ml-6 w-96 text-lg">
              Intrinsic Value Per Share
            </span>
            <span className="text-right">
              <div className="flex items-center">
                <span className="text-gray-600 mr-2">{currency}</span>
                <span className="font-light w-48 text-gray-600 text-lg">
                  {intrinsicValuePerShare !== null
                    ? intrinsicValuePerShare.toLocaleString()
                    : "Calculating..."}
                </span>
              </div>
            </span>
          </div>
  
          {/* Last Closing Price */}
          <div className="flex justify-between items-center mb-6">
            <span className="text-gray-600 ml-6 w-80 text-lg">
              Last Closing Price
            </span>
            <span className="text-right">
              <div className="flex items-center">
                <span className="text-gray-600 mr-2">{currency}</span>
                <span className="font-light w-48 text-gray-600 text-lg">
                  {price !== null ? price.toLocaleString() : "Calculating..."}
                </span>
              </div>
            </span>
          </div>
  
          {/* Discount/Premium */}
          <div className="flex justify-between items-center mb-6">
            <span className="text-gray-600 ml-6 w-80 text-lg">Discount/Premium</span>
            <span className="text-right">
              <div className="flex items-center">
                <span className="text-gray-600 mr-2 text-lg">PCT</span>
                <span className="font-light w-48 text-gray-600 text-lg">
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
