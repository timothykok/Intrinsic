"use client";

import { useEffect, useState, useRef } from "react";

let currency = "USD";

export default function Projection({
  freeCashFlowEquityData,
  fiveYearGrowthRate,
  tenYearGrowthRate,
  longTermGrowthRate,
}) {
  const years = Array.from({ length: 21 }, (_, i) => 2025 + i); // Generate years from 2025 to 2036
  const [projectedData, setProjectedData] = useState({
    freeCashFlows: [],
    discountFactors: [],
    discountedValues: [],
  });
  const [currentPage, setCurrentPage] = useState(1); // 1 for first part, 2 for second part
  const tableRef = useRef(null);

  useEffect(() => {
    if (
      freeCashFlowEquityData !== null &&
      fiveYearGrowthRate !== null &&
      tenYearGrowthRate !== null &&
      longTermGrowthRate !== null
    ) {
      const freeCashFlows = [];
      const discountFactors = [];
      const discountedValues = [];
      let currentFCFE = freeCashFlowEquityData;
      const discountRate = 1 + tenYearGrowthRate / 100;

      // Generate data for 2025 to 2036
      years.forEach((year, index) => {
        // Determine the growth rate: first 5 years, next 5 years, and long term
        let growthRate;
        if (index <= 4) {
          growthRate = fiveYearGrowthRate / 100; // Use five-year growth rate
        } else if (index <= 10) {
          growthRate = tenYearGrowthRate / 100; // Use ten-year growth rate
        } else {
          growthRate = longTermGrowthRate / 100; // Use long-term growth rate
        }

        // Update Free Cash Flow
        if (index > 0) {
          currentFCFE *= 1 + growthRate;
        }
        freeCashFlows.push(currentFCFE);

        // Calculate Discount Factor
        const discountFactor = Math.pow(discountRate, index + 1);
        discountFactors.push(discountFactor);

        // Calculate Discounted Value
        const discountedValue = currentFCFE / discountFactor;
        discountedValues.push(discountedValue);
      });

      setProjectedData({ freeCashFlows, discountFactors, discountedValues });
    }
  }, [
    freeCashFlowEquityData,
    fiveYearGrowthRate,
    tenYearGrowthRate,
    longTermGrowthRate,
  ]);

  const handleNext = () => {
    setCurrentPage(2);
    tableRef.current.scrollTo({
      left: tableRef.current.scrollWidth,
      behavior: "smooth",
    });
  };

  const handleBack = () => {
    setCurrentPage(1);
    tableRef.current.scrollTo({ left: 0, behavior: "smooth" });
  };

  return (
    <>
      <div className="max-w-[800px] mx-auto mt-6 mb-16">
        <div className="text-left">
          <p className="text-lg font-light text-gray-600">Year On Year</p>
          <hr className="border-t border-gray-400 my-3" />
        </div>
        <div className="relative">
          <div
            className="overflow-x-auto no-scrollbar"
            ref={tableRef}
          >
            <table className="w-full max-w-[800px] mx-auto text-center border-collapse">
              <thead>
                <tr>
                  <th className="min-w-[185px] text-left text-sm font-light">
                    Year
                  </th>
                  {years.slice(0, 4).map((year) => (
                    <td key={year} className="p-3 text-sm text-center">
                      {year}
                    </td>
                  ))}
                  {years.slice(4).map((year) => (
                    <td key={year} className="p-3 text-sm text-center">
                      {year}
                    </td>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th className="min-w-[185px] text-left text-sm font-light">
                    Free Cash Flow (Projected) (Millions)
                  </th>
                  {projectedData.freeCashFlows.slice(0, 4).map((fcf, index) => (
                    <td key={index} className="p-3 text-sm text-center">
                      {(fcf / 1_000_000).toFixed(2)}
                    </td>
                  ))}
                  {projectedData.freeCashFlows.slice(4).map((fcf, index) => (
                    <td key={index + 4} className="p-3 text-sm text-center">
                      {(fcf / 1_000_000).toFixed(2)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th className="min-w-[185px] text-left text-sm font-light">
                    Discount Factor
                  </th>
                  {projectedData.discountFactors
                    .slice(0, 4)
                    .map((factor, index) => (
                      <td key={index} className="p-3 text-sm text-center">
                        {factor.toFixed(2)}
                      </td>
                    ))}
                  {projectedData.discountFactors
                    .slice(4)
                    .map((factor, index) => (
                      <td key={index + 4} className="p-3 text-sm text-center">
                        {factor.toFixed(2)}
                      </td>
                    ))}
                </tr>
                <tr>
                  <th className="min-w-[185px] text-left text-sm font-light">
                    Discount Value (Millions)
                  </th>
                  {projectedData.discountedValues
                    .slice(0, 4)
                    .map((value, index) => (
                      <td key={index} className="p-3 text-sm text-center">
                        {(value / 1_000_000).toFixed(2)}
                      </td>
                    ))}
                  {projectedData.discountedValues
                    .slice(4)
                    .map((value, index) => (
                      <td key={index + 4} className="p-3 text-sm text-center">
                        {(value / 1_000_000).toFixed(2)}
                      </td>
                    ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="content-end w-max ml-auto gap-2 flex">
            <div>
              <button
                onClick={handleBack}
                disabled={currentPage === 1} // Disable if on the first page
                className={`bg-white mt-8 ${
                  currentPage === 1
                    ? "text-gray-400 border-gray-200 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                } font-light py-2 px-4 border border-gray-400 rounded-[6px]`}
              >
                Prev
              </button>
            </div>

            <div>
              <button
                onClick={handleNext}
                disabled={currentPage === 2} // Disable if on the last page
                className={`bg-white mt-8 ${
                  currentPage === 2
                    ? "text-gray-400 cursor-not-allowed border-gray-200"
                    : "text-gray-700 hover:bg-gray-100"
                } font-light py-2 px-4 border border-gray-400 rounded-[6px]`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add this CSS to your global styles */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}