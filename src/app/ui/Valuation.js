"use client";

import { useEffect, useState } from "react";

let currency = "USD";

export default function Valuation({
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
   <div>
        {/* Ensure proper spacing for the last paragraph */}
        <div className="max-w-[800px] mx-auto mt-[64px] mb-[64px]">
        <div className="mt-8 pt-4 text-gray-700 w-auto">
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
            <span className="font-bold text-green-600 text-lg">
              {/* Change to text-red-600 if undervalued */}
              {underOverValue} by <span>{discountPremium?.toFixed(2)}%</span>.
            </span>
          </p>
        </div>
      </div>
      </div>
    </>
  );
}
