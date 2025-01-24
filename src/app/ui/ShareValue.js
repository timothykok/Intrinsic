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
      <div className="share-value">
        <p>Intrinsic Value</p>
        <hr className="divider"></hr>

        <div className="inner-container">
          <div className="row">
            <span className="label">Intrinsic Value Per Share</span>
            <span className="value">
              <div className="price-qty">
                <span className="currency">{currency}</span>
                <span className="number-inner">
                  {intrinsicValuePerShare !== null
                    ? `$ ${intrinsicValuePerShare.toLocaleString()}`
                    : "Calculating..."}
                </span>
              </div>
            </span>
          </div>

          <div className="row">
            <span className="label">Last Closing Price</span>
            <span className="value">
              <div className="price-qty">
                <span className="currency">{currency}</span>
                <span className="number-inner">
                  {price !== null
                    ? `$ ${price.toLocaleString()}`
                    : "Calculating..."}
                </span>
              </div>
            </span>
          </div>

          <div className="row">
            <span className="label">Discount/Premium</span>
            <span className="value">
              <div className="price-qty">
                <span className="currency">PCT</span>
                <span className="number-inner">
                  {discountPremium !== null
                    ? `${discountPremium.toFixed(2)} %`
                    : "Calculating..."}
                </span>
              </div>
            </span>
          </div>

          <div className="intrinsic-result">
            <p>
              Estimated DCF Value of one {Ticker} stock is{" "}
              <span>${intrinsicValuePerShare?.toFixed(2)}</span>. Compared to
              the current market price of{" "}
              <span>
                ${price?.toFixed(2)} {currency}
              </span>
              , the stock is <span className="valuation-percentage"> {underOverValue} by{" "}
              <span>{discountPremium?.toFixed(2)}%</span>. </span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
