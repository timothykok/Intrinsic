"use client"

import { useEffect, useState } from "react";
import axios from "axios";

export default function FreeCashFlowEquity() {
  const [netIncomeData, setNetIncomeData] = useState([]);
  const [depreceationAmortizationData, setDepreceationAmortizationData] = useState([]);
  const [capitalExpenditureData, setCapitalExpenditureData] = useState([]);
  const [changeInWorkingCapitalData, setChangeInWorkingCapitalData] = useState([]);
  const [netBorrowingData, setNetBorrowingData] = useState([]);
  const [indicatorsData, setIndicatorsData] = useState([]);

  useEffect(() => {
    const fetchNetIncome = async () => {
      try {
        // Fetch data from the API
        const response = await axios.get(
          "https://financialmodelingprep.com/api/v3/income-statement/AAPL?period=annual&apikey=hg2NroPZx6bZbTWXJjqon6L5Pb53HCko"
        );
 
        // Extract the last 1 year of data (you can expand this later to 5 years)
        const data = response.data.slice(0, 1); // Get the most recent year
                
        // Access netIncome from the first item in the array
        const netIncomeValues = data.map((item) => ({
        year: item.calendarYear,
        netIncome: item.netIncome,
        }));
        setNetIncomeData(netIncomeValues);

        
       
      } catch (error) {
        console.error("Error fetching Net Income data:", error);
      }
    };

    const fetchCashFlow = async () => {
        try{
            //fetch data 
            const response = await axios.get(
                "https://financialmodelingprep.com/api/v3/cash-flow-statement/AAPL?period=annual&apikey=hg2NroPZx6bZbTWXJjqon6L5Pb53HCko"
            );


            const data = response.data.slice(0, 5);
            const sortedData = data.sort(
                (a, b) => new Date(b.date) - new Date(a.date) // Sort by date descending
              );

            //extract depreceationAmortization, capEx, changeInWorkingCapital and calendar year

            const depreceationAmortizationValues = sortedData.map((item) => ({
                year: item.calendarYear,
                depreceationAmortization: item.depreciationAndAmortization
            
            }));

            const capitalExpenditureValues = sortedData.map((item) => ({
                year: item.calendarYear,
                capitalExpenditure: item.capitalExpenditure

            }));

            const changeInWorkingCapitalValues = sortedData.map((item) => ({
                year: item.changeInWorkingCapital,
                changeInWorkingCapital: item.changeInWorkingCapital
            
            }));

            setDepreceationAmortizationData(depreceationAmortizationValues)
            setCapitalExpenditureData(capitalExpenditureValues)
            setChangeInWorkingCapitalData(changeInWorkingCapitalValues)

        }
       


        catch (error){
            console.error("Error fetching cashflow")

        }


    }

    const fetch 

    fetchNetIncome();
    fetchCashFlow();
  }, []);


  





 
  return (
    <div className="fcfe-values">
      <p>
        Net Income: $
        {netIncomeData.length > 0
          ? netIncomeData[0].netIncome.toLocaleString()
          : "Loading..."}
      </p>
      <p>
        Depreciation & Amortization: $
        {depreceationAmortizationData.length > 0
          ? depreceationAmortizationData[0].depreceationAmortization.toLocaleString()
          : "Loading..."}
      </p>
      <p>
        Capital Expenditure: $
        {capitalExpenditureData.length > 0
          ? capitalExpenditureData[0].capitalExpenditure.toLocaleString()
          : "Loading..."}
      </p>

      <p>
        Change In Working Capital: $
        {changeInWorkingCapitalData.length > 0
          ? changeInWorkingCapitalData[0].changeInWorkingCapital.toLocaleString()
          : "Loading..."}
      </p>
    </div>
  );
}
