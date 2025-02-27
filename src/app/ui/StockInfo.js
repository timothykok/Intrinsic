import { forwardRef, useState, useEffect } from "react";
import StockChart from "./StockChart";
const StockInfo = forwardRef(
  (
    {
      logoSrc,
      companyName,
      ticker,
      price,
      currency,
      change,
      percentage,
      timestamp,
      presentValue,
      outStandingShares,
    },
    ref
  ) => {
    // State hooks
    const [intrinsicValuePerShare, setIntrinsicValuePerShare] = useState(null);
    const [discountPremium, setDiscountPremium] = useState(null);
    const [underOverValue, setUnderOverValue] = useState("");

    // Calculate intrinsic value, discount/premium, and valuation status
    useEffect(() => {
      if (presentValue && outStandingShares && price) {
        const intrinsicValue = presentValue ;
        setIntrinsicValuePerShare(intrinsicValue);

        const discountPremiumValue = (price / intrinsicValue - 1) * 100; // Calculate as percentage
        setDiscountPremium(discountPremiumValue);

        // Determine under/overvaluation
        setUnderOverValue(
          discountPremiumValue > 0 ? "overvalued" : "undervalued"
        );
      }
    }, [presentValue, outStandingShares, price]);

    // Component JSX
    return (
      <div ref={ref}>
        <div className="pt-8">
          <div className="flex items-center justify-left mx-auto pt-8 pb-8 mt-4 w-[800px]">
            {/* Logo */}
            <div className="mr-4 p-12 bg-slate-200 rounded-full">
              <img
                src={logoSrc}
                alt={`${companyName} Logo`}
                className="w-16 h-16 rounded-lg object-cover"
              />
            </div>

            {/* Stock Details and Price */}
            <div className="ml-7 flex flex-row gap-7">
              {/* Stock Details */}
              <div className="flex-1 mr-4 w-60 mt-1">
                <div className="text-2xl font-light">{companyName}</div>
                <div className="text-lg text-gray-600 mt-1">{ticker}</div>
              </div>

              {/* Price Section */}
              <div className="text-left">
                <div className="text-3xl">
                  {price?.toFixed(2)}{" "}
                  <span className="text-sm text-gray-600">{currency}</span>
                </div>
                <div className="text-sm text-gray-500 font-light mt-2">
                  {timestamp}
                </div>
              </div>

              {/* Change Section */}
              <div className="text-sm font-normal mt-[14px]">
                <span style={{ color: change > 0 ? "#29B353" : "#ef4444" }}>
                  {change > 0 ? "+" : ""}
                  {change?.toFixed(2)} ({percentage?.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="max-w-[800px] mx-auto mt-8 text-xs font-medium">
          
              <div className="p-4 text-[#909090] w-auto">
                <p className="text-sm ">
                  Estimated Value of one {ticker} stock is{" "}
                  <span className="">
                    ${intrinsicValuePerShare?.toFixed(2)}
                  </span>
                  . Compared to the current market price of{" "}
                  <span className="text-gray-600">
                    ${price?.toFixed(2)} {currency}
                  </span>
                  , the stock is{" "}
                  <span
                    className={`font-bold ${
                      underOverValue === "overvalued"
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {underOverValue} by{" "}
                    <span>{discountPremium?.toFixed(2)}%</span>.
                  </span>
                </p>
              </div>
         
          </div>


          <StockChart ticker={ticker} />   

          
        </div>
      </div>
    );
  }
);

export default StockInfo;