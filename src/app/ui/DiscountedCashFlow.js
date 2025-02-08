"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";

const currency = "USD";

const sectorPerformance = {
  "Basic Materials": 8.98,
  "Communication Services": 11.27,
  "Consumer Cyclical": 12.07,
  "Consumer Defensive": 10.92,
  "Energy": 6.18,
  "Financial Services": 12.07,
  "Healthcare": 12.45,
  "Industrials": 12.97,
  "Real Estate": 10.4,
  "Technology": 19.8,
  "Utilities": 10.05,
};

const fetchData = async (url) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error);
    return null;
  }
};

export default function DiscountedCashFlow({
  Ticker,
  setFreeCashFlowEquityData,
  freeCashFlowEquityData,
  setFiveYearGrowthRate,
  fiveYearGrowthRate,
  setTenYearGrowthRate,
  tenYearGrowthRate,
  setCostOfEquity,
  costOfEquity,
  setLongTermGrowthRate,
  longTermGrowthRate,
}) {
  const [residualIncome, setResidualIncome] = useState(null);

  const [financialData, setFinancialData] = useState({
    netIncome: null,
    depreciationAmortization: 0,
    capitalExpenditure: 0,
    changeInWorkingCapital: 0,
    netBorrowing: 0,
    beta: null,
    riskFreeRate: null,
    marketRiskPremium: null,
    sector: null,
  });

  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isCostOfEquityCollapsed, setIsCostOfEquityCollapsed] = useState(true);

  const fmpApiKey = process.env.NEXT_PUBLIC_FINANCIAL_API_KEY;

  const toggleCollapse = () => {
    setIsCollapsed((prevState) => !prevState);
  };

  const toggleCostOfEquityCollapse = () => {
    setIsCostOfEquityCollapsed((prevState) => !prevState);
  };

  useEffect(() => {
    if (!Ticker) return;
  
    const fetchFinancialData = async () => {
      const [
        profileData,
        incomeData,
        cashFlowData,
        ratioData,
        treasuryData,
        marketRiskData,
      ] = await Promise.all([
        fetchData(`https://financialmodelingprep.com/api/v3/profile/${Ticker}?apikey=${fmpApiKey}`),
        fetchData(`https://financialmodelingprep.com/api/v3/income-statement/${Ticker}?period=annual&apikey=${fmpApiKey}`),
        fetchData(`https://financialmodelingprep.com/api/v3/cash-flow-statement/${Ticker}?period=annual&apikey=${fmpApiKey}`),
        fetchData(`https://financialmodelingprep.com/api/v3/ratios/${Ticker}?apikey=${fmpApiKey}`),
        fetchData(`https://financialmodelingprep.com/api/v4/treasury?apikey=${fmpApiKey}`),
        fetchData(`https://financialmodelingprep.com/api/v4/market_risk_premium?apikey=${fmpApiKey}`),
      ]);
  
      // Determine sector and set ten-year growth rate using the sectorPerformance mapping
      const sector = profileData?.[0]?.sector || null;
      const tenYearGrowthRate = sectorPerformance[sector] || "N/A";
      setTenYearGrowthRate(tenYearGrowthRate.toFixed(2));
  
      // Retrieve net income and cash flow components
      const netIncome = incomeData?.[0]?.netIncome || 0;
      const mostRecentCashFlow = cashFlowData?.[0] || {};
      const netBorrowing =
        parseFloat(mostRecentCashFlow.commonStockIssued || 0) -
        parseFloat(mostRecentCashFlow.debtRepayment || 0);
  
      // Calculate five-year growth rate using ratios data
      const fiveYearGrowthRate = (() => {
        if (!ratioData || ratioData.length < 5) return "Insufficient data";
        const roeValues = ratioData
          .slice(0, 5)
          .map((year) => parseFloat(year.returnOnEquity || 0))
          .filter((roe) => !isNaN(roe) && roe > 0);
        if (roeValues.length === 0) return "Invalid data";
        const avgROE = roeValues.reduce((sum, roe) => sum + roe, 0) / roeValues.length;
        const payoutRatio = parseFloat(ratioData[0].payoutRatio || 0);
        if (isNaN(payoutRatio) || payoutRatio < 0 || payoutRatio > 1) return "Invalid data";
        return ((1 - payoutRatio) * avgROE * 100).toFixed(2);
      })();
      setFiveYearGrowthRate(fiveYearGrowthRate);
  
      // Retrieve risk-free rate and market risk premium from treasury and market data
      const riskFreeRate = parseFloat(treasuryData?.[0]?.year10) || null;
      const marketRiskPremium =
        marketRiskData?.find(
          (item) => item.country.toLowerCase() === "united states"
        )?.countryRiskPremium || null;
  
      // Update the financialData state object with all fetched metrics
      setFinancialData({
        netIncome,
        depreciationAmortization: mostRecentCashFlow.depreciationAndAmortization || 0,
        capitalExpenditure: mostRecentCashFlow.capitalExpenditure || 0,
        changeInWorkingCapital: mostRecentCashFlow.changeInWorkingCapital || 0,
        netBorrowing,
        beta: profileData?.[0]?.beta || null,
        riskFreeRate,
        marketRiskPremium,
        sector,
      });
  
      // Set a default long-term growth rate (here, 3%)
      setLongTermGrowthRate(3);
    };
  
    fetchFinancialData();
  }, [Ticker]);

 

    // 2️⃣ Compute Cost of Equity (CAPM)
    useEffect(() => {
      if (!financialData.beta || !financialData.riskFreeRate || !financialData.marketRiskPremium) return;
  
      const calculatedCostOfEquity = (
        financialData.riskFreeRate +
        financialData.beta * financialData.marketRiskPremium
      ).toFixed(2);
  
      setCostOfEquity(calculatedCostOfEquity);
  
      // 🔹 Update financialData with Cost of Equity
      setFinancialData((prevData) => ({
        ...prevData,
        costOfEquity: calculatedCostOfEquity,
      }));
    }, [financialData.beta, financialData.riskFreeRate, financialData.marketRiskPremium]);
  
    
  
    // 4️⃣ Compute Free Cash Flow to Equity
    const calculatedFreeCashFlowEquity = useMemo(() => {
      const {
        netIncome,
        depreciationAmortization,
        capitalExpenditure,
        netBorrowing,
      } = financialData;
      return (
        netIncome + depreciationAmortization - capitalExpenditure + netBorrowing
      );
    }, [financialData]);
  
    useEffect(() => {
      setFreeCashFlowEquityData(calculatedFreeCashFlowEquity);
    }, [calculatedFreeCashFlowEquity]);

  return (
    <>
      <div className="max-w-[800px] mx-auto pt-12 pb-12 mt-8 border border-zinc-200 bg-white-100 rounded-md p-6 shadow-sm uppercase text-sm ">
        <p className=" text-gray-600 font-bold">Financials</p>
        <hr className="my-4 border-zinc-200 mt-4 mb-4" />

        <div className="space-y-5 text-gray-500 ">
          <div className="flex justify-between items-center min-w-s">
           

            {/* Group the arrow toggle and title together */}
            <div className="flex items-center">
              <span className="cursor-pointer" onClick={toggleCollapse}>
                {isCollapsed ? (
                  <img
                    src="/Toggle-Arrow-Collapsed.svg"
                    alt="View More"
                    className="w-2 h-2"
                  />
                ) : (
                  <img
                    src="/Toggle-Arrow-notCollapsed.svg"
                    alt="View Less"
                    className="w-2 h-2"
                  />
                )}
              </span>
              <span className="  ml-4 w-80 ">Free Cash Flow to Equity</span>
            </div>

            {/* Currency and value on the right */}
            <span className="text-right">
              <div className="flex items-center">
                <span className="  mr-2">{currency}</span>
                <span className=" w-48 ">
                  {freeCashFlowEquityData !== null
                    ? freeCashFlowEquityData.toLocaleString()
                    : "Calculating..."}
                </span>
              </div>
            </span>
          </div>

          {!isCollapsed && (
            <div className="pl-8 space-y-5">
              <div className="flex justify-between items-center">
                <span className="  ml-4 w-80">Net Income</span>
                <span className="text-right">
                  <div className="flex items-center">
                    <span className="  mr-2">{currency}</span>
                    <span className=" w-48 ">
                      {financialData.netIncome !== null
                        ? financialData.netIncome.toLocaleString()
                        : "Calculating..."}
                    </span>
                  </div>
                </span>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="  ml-4 w-80">Depreciation & Amortization</span>
                <span className="text-right">
                  <div className="flex items-center">
                    <span className="  mr-2">{currency}</span>
                    <span className=" w-48 ">
                      {financialData.depreciationAmortization !== null
                        ? financialData.depreciationAmortization.toLocaleString()
                        : "Calculating..."}
                    </span>
                  </div>
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="  ml-4 w-80">Capital Expenditure</span>
                <span className="text-right">
                  <div className="flex items-center">
                    <span className="  mr-2">{currency}</span>
                    <span className=" w-48 ">
                      {financialData.capitalExpenditure !== null
                        ? financialData.capitalExpenditure.toLocaleString()
                        : "Calculating..."}
                    </span>
                  </div>
                </span>
              </div>

          

              <div className="flex justify-between items-center">
                <span className="  ml-4 w-80">Change In Working Capital</span>
                <span className="text-right">
                  <div className="flex items-center">
                    <span className="  mr-2">{currency}</span>
                    <span className=" w-48 ">
                      {financialData.changeInWorkingCapital !== null
                        ? financialData.changeInWorkingCapital.toLocaleString()
                        : "Calculating..."}
                    </span>
                  </div>
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="  ml-4 w-80">Net Borrowing</span>
                <span className="text-right">
                  <div className="flex items-center">
                    <span className="  mr-2">{currency}</span>
                    <span className=" w-48 ">
                      {financialData.netBorrowing !== null
                        ? financialData.netBorrowing.toLocaleString()
                        : "Calculating..."}
                    </span>
                  </div>
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="  ml-6 w-80">
              Cash Flow Growth Rate (Year 1-5)
            </span>
            <span className="text-right">
              <div className="flex items-center">
                <span className="  mr-[11px]">PCT</span>
                <span className=" w-48 ">
                  {fiveYearGrowthRate !== "Invalid data" &&
                  fiveYearGrowthRate !== "Insufficient data"
                    ? `${fiveYearGrowthRate}%`
                    : fiveYearGrowthRate}
                </span>
              </div>
            </span>
          </div>

          {/* Cash Flow Growth Rate (Year 6-10) */}
          <div className="flex justify-between items-center">
            <span className="  ml-6 w-80 ">
              Cash Flow Growth Rate (Year 6-10)
            </span>
            <span className="text-right">
              <div className="flex items-center">
                <span className="  mr-[11px]">PCT</span>
                <span className=" w-48 ">
                  {tenYearGrowthRate !== "Invalid data" &&
                  tenYearGrowthRate !== "Insufficient data"
                    ? `${tenYearGrowthRate} %`
                    : tenYearGrowthRate}
                </span>
              </div>
            </span>
          </div>

          {/* Cash Flow Growth Rate (Year 10-∞) */}
          <div className="flex justify-between items-center h-6">
            <span className="  ml-6 w-80">
              Cash Flow Growth Rate (Long Term)
            </span>
            <span className="text-right">
              <div className="flex items-center">
                <span className="  mr-[11px]">PCT</span>
                <span className=" w-48 ">{longTermGrowthRate} %</span>
              </div>
            </span>
          </div>

          {/* Cost of Equity Section */}
          <div className="flex justify-between items-center">
            {/* Group the arrow toggle and title together */}
            <div className="flex items-center">
              <span
                className="cursor-pointer"
                onClick={toggleCostOfEquityCollapse}
              >
                {isCostOfEquityCollapsed ? (
                  <img
                    src="/Toggle-Arrow-Collapsed.svg"
                    alt="View More"
                    className="w-2 h-2"
                  />
                ) : (
                  <img
                    src="/Toggle-Arrow-notCollapsed.svg"
                    alt="View Less"
                    className="w-2 h-2"
                  />
                )}
              </span>
              <span className="  ml-4 w-80">Cost Of Equity</span>
            </div>

            {/* Percentage and value on the right */}
            <span className="text-right">
              <div className="flex items-center">
                <span className="  mr-[11px]">PCT</span>
                <span className=" w-48 ">
                  {costOfEquity !== null && costOfEquity !== undefined
                    ? `${costOfEquity} %`
                    : "Calculating..."}
                </span>
              </div>
            </span>
          </div>

          {/* Sub-labels (Beta, Risk Free Rate, Market Risk Premium) */}
          {!isCostOfEquityCollapsed && (
            <div className="pl-8 space-y-5">
              {/* Beta */}
              <div className="flex justify-between items-center">
                <span className="  ml-4 w-80">Beta</span>
                <span className="text-right">
                  <div className="flex items-center">
                    <span className="  mr-[13px]">VAL</span>
                    <span className=" w-48 ">
                      {financialData.beta !== null && !isNaN(financialData.beta)
                        ? financialData.beta
                        : "Loading..."}
                    </span>
                  </div>
                </span>
              </div>

              {/* Risk Free Rate */}
              <div className="flex justify-between items-center">
                <span className="  ml-4 w-80">Risk Free Rate</span>
                <span className="text-right">
                  <div className="flex items-center">
                    <span className="  mr-[11px]">PCT</span>
                    <span className=" w-48 ">
                      {financialData.riskFreeRate !== null &&
                      !isNaN(financialData.riskFreeRate)
                        ? `${financialData.riskFreeRate.toFixed(2)} %`
                        : "Loading..."}
                    </span>
                  </div>
                </span>
              </div>

              {/* Market Risk Premium */}
              <div className="flex justify-between items-center">
                <span className="  ml-4 w-80">Market Risk Premium</span>
                <span className="text-right">
                  <div className="flex items-center">
                    <span className="  mr-[11px]">PCT</span>
                    <span className=" w-48 ">
                      {financialData.marketRiskPremium !== null &&
                      !isNaN(financialData.marketRiskPremium)
                        ? `${financialData.marketRiskPremium} %`
                        : "Loading..."}
                    </span>
                  </div>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
