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
      setIntrinsicValuePerShare(intrinsicValue);

      const discountPremiumValue = (price / intrinsicValue - 1) * 100; // Calculate as percentage
      setDiscountPremium(discountPremiumValue);

      // Determine under/overvaluation
      setUnderOverValue(
        discountPremiumValue > 0 ? "overvalued" : "undervalued"
      );
    }
  }, [presentValue, outStandingShares, price]);

  return (
    <>
      <div className="max-w-3xl mx-auto mt-8">
        <p className="text-lg font-light text-gray-600">Intrinsic Value</p>
        <hr className="my-4 border-gray-300" />
  
        <div className="space-y-4">
          {/* Present Value of Free Cash Flow to Equity to Perpetuity */}
          <div className="flex justify-between items-center">
            <span className="text-gray-600 ml-4 w-96 text-lg">
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
  
          {/* Outstanding Shares */}
          <div className="flex justify-between items-center">
            <span className="text-gray-600 ml-4 w-80 text-lg">
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
  
          <div className="flex justify-between items-center">
            <span className="text-gray-600 ml-4 w-80 text-lg">Discount/Premium</span>
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
  
        {/* Ensure proper spacing for the last paragraph */}
        <div className="mt-8 pt-4 text-gray-700">
          <p className="text-lg font-light">
            Estimated DCF Value of one {Ticker} stock is{" "}
            <span className="font-medium text-lg">
              ${intrinsicValuePerShare?.toFixed(2)}
            </span>
            . Compared to the current market price of{" "}
            <span className="font-medium text-lg text-gray-600">
              ${price?.toFixed(2)} {currency}
            </span>
            , the stock is{" "}
            <span className="font-medium text-green-600 text-lg">
              {/* Change to text-red-600 if undervalued */}
              {underOverValue} by <span>{discountPremium?.toFixed(2)}%</span>.
            </span>
          </p>
        </div>
      </div>
    </>
  );
}
