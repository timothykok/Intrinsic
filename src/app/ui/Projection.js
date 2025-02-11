"use client";

import { useEffect, useState, useRef } from "react";

let currency = "USD";

export default function Projection({
  freeCashFlowEquityData,
  fiveYearGrowthRate,
  tenYearGrowthRate,
  longTermGrowthRate,
}) {
  const years = Array.from({ length: 21 }, (_, i) => 2025 + i); // Generate years from 2025 to 2045
  const [projectedData, setProjectedData] = useState({
    freeCashFlows: [],
    discountFactors: [],
    discountedValues: [],
  });
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const itemsPerPage = 4; // Number of years to display per page
  const totalPages = Math.ceil(years.length / itemsPerPage); // Total number of pages
  const tableRef = useRef(null); // Ref for the table container

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

      // Generate data for 2025 to 2045
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

  // Handle next page scroll
  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      // Calculate the scroll position for the next page
      const scrollAmount = tableRef.current.clientWidth; // Scroll by the width of the visible table
      tableRef.current.scrollTo({
        left: tableRef.current.scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Handle previous page scroll
  const handleBack = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      // Calculate the scroll position for the previous page
      const scrollAmount = tableRef.current.clientWidth; // Scroll by the width of the visible table
      tableRef.current.scrollTo({
        left: tableRef.current.scrollLeft - scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      <div className="max-w-[800px] mx-auto pt-12 pb-12 mt-8  uppercase">
        <div className="text-left">
          <p className="text-sm text-[#626262] font-bold">Year On Year</p>
          <hr className="border-t border-zinc-200 my-3" />
        </div>
        <div className="relative">
          <div className="flex">
           
            {/* unscrollable table headers*/}
         

           <table className="sticky left-0 z-10 font-medium text-[#909090] mt-[21px]">
              <thead>
                <tr>
                  <th className="min-w-[185px] text-left text-xs font-light  ">
                    Year
                  </th>
                </tr>
              </thead>
              <tbody className="space-y-6">
                <tr>
                  <th className="min-w-[185px] text-left text-xs font-light">
                    Free Cash Flow (Projected) (Millions)
                  </th>
                </tr>
                <tr>
                  <th className="min-w-[185px] text-left text-xs font-light">
                    Discount Factor
                  </th>
                </tr>
                <tr>
                  <th className="min-w-[185px] text-left text-xs font-light">
                    Discount Value (Millions)
                  </th>
                </tr>
              </tbody>
            </table>
 
           

            {/* Scrollable Data Table */}
            <div
              className="overflow-x-auto no-scrollbar"
              ref={tableRef}
            >
              <table className="text-center border-collapse font-light text-[#909090]">
                <thead>
                  <tr>
                    {years.map((year) => (
                      <td key={year} className="p-3 text-sm text-left">
                        {year}
                      </td>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {projectedData.freeCashFlows.map((fcf, index) => (
                      <td key={index} className="p-3 text-sm text-left">
                        {(fcf / 1_000_000).toFixed(2)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    {projectedData.discountFactors.map((factor, index) => (
                      <td key={index} className="p-3 text-sm text-left">
                        {factor.toFixed(2)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    {projectedData.discountedValues.map((value, index) => (
                      <td key={index} className="p-3 text-sm text-left">
                        {(value / 1_000_000).toFixed(2)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="content-end w-max ml-auto flex">
            <div>
              <button
                onClick={handleBack}
                disabled={currentPage === 1} // Disable if on the first page
                className={`mt-8 ${
                  currentPage === 1
                    ? "text-gray-300 border-gray-100 cursor-not-allowed "
                    : "text-gray-600 hover:bg-[#E9E9E9]"
                }  py-2 px-4 rounded-[6px]`}
              >
                Prev
              </button>
            </div>

            <div>
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages} // Disable if on the last page
                className={`mt-8 ${
                  currentPage === totalPages
                    ? "text-gray-300 cursor-not-allowed border-gray-100 "
                    : "text-gray-600 hover:bg-[#E9E9E9]"
                }  py-2 px-4 rounded-[6px]`}
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
        .sticky {
          position: sticky;
          left: 0;
         
          z-index: 10;
        }
      `}</style>
    </>
  );
}