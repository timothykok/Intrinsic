import { forwardRef } from "react";

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
    },
    ref
  ) => {
    return (
      <div ref={ref}>
        <div className="pt-28">
        <div className="flex items-center justify-left mx-auto  pt-12 pb-12 w-[800px] ">
          {/* Logo */}
          <div className="mr-4">
            <img
              src={logoSrc}
              alt={`${companyName} Logo`}
              className="w-32 h-32 rounded-lg object-cover"
            />
          </div>

          {/* Stock Details and Price */}
          <div className="ml-7 flex flex-row gap-7 ">
            {/* Stock Details */}
            <div className="flex-1 mr-4 w-80 mt-1">
              <div className="text-2xl font-light">{companyName}</div>
              <div className="text-lg text-gray-600 mt-1">{ticker}</div>
            </div>

            {/* Price Section */}
            <div className="text-left mt-2">
              <div className="text-3xl">
                {price?.toFixed(2)}{" "}
                <span className="text-sm text-gray-600">{currency}</span>
              </div>
              <div className="text-sm text-gray-500 font-light mt-2">
                {timestamp}
              </div>
            </div>

            {/* Change Section */}
            <div className="text-sm font-normal mt-7">
              <span style={{ color: change > 0 ? "#29B353" : "#ef4444" }}>
                {change > 0 ? "+" : ""}
                {change?.toFixed(2)} ({percentage?.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>


        </div>
       
      </div>
    );
  }
);

export default StockInfo;
