import React from "react";

function YearlyPerformanceDots({ label, dataPoints }) {
  return (


    <div className="flex items-center justify-between my-2 text-[#909090]">
      {/* Metric Label with increased right margin and adjusted font */}
      <span className="mr-8 text-xs font-semi-bold">{label}</span>
      {/* Render dots with more spacing */}




      <div className="flex space-x-2 min-w-8">
        {dataPoints.map((dp, index) => {
          // For the first year, no comparison so use neutral color
          let color = "bg-white";
          if (index > 0) {
            const previousValue = dataPoints[index - 1].value;
            color = dp.value > previousValue ? "bg-[#63D385]" : "bg-[#FF5757]";
          }
          return (
            <div
              key={dp.year}
              className={`w-2 h-2 rounded-full ${color}`}
              title={`${dp.year}: ${dp.value}`}
            ></div>
          );
        })}
      </div>
    </div>
  );
}

export default function Financials({ financialData }) {
  // Destructure the history arrays from financialData
  const {
    salesHistory,
    netIncomeHistory,
    epsHistory,
    cfoHistory,
    roeHistory,
    roicHistory,
  } = financialData;

  return (
    <div className="uppercase text-xs text-[#626262] font-bold w-96 pt-36">
      <div>
        <p> PROFITABLITY </p>
        <hr className="my-4 border-zinc-200" />
        {salesHistory && (
          <YearlyPerformanceDots label="Sales" dataPoints={salesHistory} />
        )}
        {netIncomeHistory && (
          <YearlyPerformanceDots label="Net Income" dataPoints={netIncomeHistory} />
        )}
      </div>

      <div className="mt-12">
        <p> Growth Rate </p>
        <hr className="my-4 border-zinc-200" />
        {epsHistory && (
          <YearlyPerformanceDots label="EPS" dataPoints={epsHistory} />
        )}
      </div>

      <div className="mt-12">
        <p> Operational Efficiency </p>
        <hr className="my-4 border-zinc-200" />
        {cfoHistory && (
          <YearlyPerformanceDots label="Cash Flow Ops" dataPoints={cfoHistory} />
        )}
        {roeHistory && (
          <YearlyPerformanceDots label="ROE" dataPoints={roeHistory} />
        )}
        {roicHistory && (
          <YearlyPerformanceDots label="ROIC" dataPoints={roicHistory} />
        )}
      </div>

      
    </div>
  );
}