import { useEffect } from "react";
import axios from "axios";

export default function DCFCalculation({
  Ticker,
  freeCashFlowEquityData,
  fiveYearGrowthRate,
  tenYearGrowthRate,
  longTermGrowthRate,
  costOfEquity,
  outstandingShares,
  setOutstandingShares,
  presentValue,
  setPresentValue,
}) {
  const currency = "USD"; // Hardcoded currency symbol
  const fmpApiKey = process.env.NEXT_PUBLIC_FINANCIAL_API_KEY;

  
  // Calculate PV of FCFE
  useEffect(() => {

    try{
      if (
        freeCashFlowEquityData !== null &&
        fiveYearGrowthRate !== null &&
        tenYearGrowthRate !== null &&
        longTermGrowthRate !== null &&
        costOfEquity !== null
      ) {
        let pv = 0;
    
        // 1. Convert growth rates to decimal form if needed
        const fiveYearG = fiveYearGrowthRate / 100;
        const tenYearG = tenYearGrowthRate / 100;
        const longTermG = longTermGrowthRate / 100;
        const coe = costOfEquity / 100;
    
        // 2. Calculate PV of FCFE from Year 1 to Year 5
        for (let t = 1; t <= 5; t++) {
          const projectedFCFE = freeCashFlowEquityData * Math.pow(1 + fiveYearG, t);
          const discountedFCFE = projectedFCFE / Math.pow(1 + coe, t);
          pv += discountedFCFE;
        }
    
        // 3. Calculate PV of FCFE from Year 6 to Year 10
        let fcfeYearN = freeCashFlowEquityData * Math.pow(1 + fiveYearG, 5); // Start from Year 5 FCFE
        for (let t = 6; t <= 10; t++) {
          fcfeYearN *= (1 + tenYearG); // Grow each year separately
          const discountedFCFE = fcfeYearN / Math.pow(1 + coe, t);
          pv += discountedFCFE;
        }
    
        // 4. Calculate Perpetuity Value at Year 11
        const fcfeYear10 = fcfeYearN; // Already grown to Year 10
        const perpetuityValue = (fcfeYear10 * (1 + longTermG)) / (coe - longTermG);
        const discountedPerpetuityValue = perpetuityValue / Math.pow(1 + coe, 10); // Discount to Year 0
    
        // 5. Add discounted perpetuity to PV
        pv += discountedPerpetuityValue;
    
        // 6. Set the final present value
        setPresentValue(parseFloat(pv.toFixed(2)));

        console.log("PRESENT VALUE: " + presentValue)
    

      }

      


    }catch(error){
      console.log(error)
    }
   
  }, [
    freeCashFlowEquityData,
    fiveYearGrowthRate,
    tenYearGrowthRate,
    longTermGrowthRate,
    costOfEquity,
  ]);
  return (
    <>
      <div className="max-w-[800px] mx-auto pt-12 pb-12 mt-8  uppercase text-sm ">
        <p className="text-[#626262] font-bold">Calculation</p>
        <hr className="my-4 border-gray-300" />
  
        <div className="space-y-5 font-medium text-[#909090] ">
          {/* Present Value of Free Cash Flow to Equity to Perpetuity */}
          <div className="flex justify-between items-center mb-6">
            <span className=" ml-6 w-96">
              Present Value of Free Cash Flow to Equity
            </span>
            <span className="text-right">
              <div className="flex items-center">
                <span className=" mr-2">{currency}</span>
                <span className="w-48 ">
                  {presentValue !== null
                    ? presentValue.toLocaleString()
                    : "Calculating..."}
                </span>
              </div>
            </span>
          </div>
  
          {/* Outstanding Shares */}
          <div className="flex justify-between items-center mb-6">
            <span className=" ml-6 w-80">
              Outstanding Shares
            </span>
            <span className="text-right">
              <div className="flex items-center">
                <span className=" mr-2">QTY</span>
                <span className="w-48 ">
                  {outstandingShares !== null
                    ? outstandingShares.toLocaleString()
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