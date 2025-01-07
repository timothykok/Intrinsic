"use client"

import { useEffect, useState } from "react";
import axios from "axios";

export default function NetIncome() {
  const [netIncomeData, setNetIncomeData] = useState([]);
  const [indicators, setIndicators] = useState([]);

  useEffect(() => {
    const fetchNetIncome = async () => {
      try {
        // Fetch data from the API
        const response = await axios.get(
          "https://financialmodelingprep.com/api/v3/income-statement/AAPL?period=annual&apikey=hg2NroPZx6bZbTWXJjqon6L5Pb53HCko"
        );

        // Extract the last 5 years of data
        const data = response.data.slice(0, 5); // Get the most recent 5 years
        const sortedData = data.sort(
          (a, b) => new Date(a.date) - new Date(b.date) // Sort by date ascending
        );

        // Extract Net Income and Calendar Year
        const netIncomeValues = sortedData.map((item) => ({
          year: item.calendarYear,
          netIncome: item.netIncome,
        }));
        setNetIncomeData(netIncomeValues);

        // Calculate year-over-year (YoY) indicators
        const yoyIndicators = netIncomeValues.map((item, index, arr) => {
          if (index === 0) return null; // No comparison for the first year
          return item.netIncome > arr[index - 1].netIncome ? "green" : "red";
        });
        setIndicators(yoyIndicators);
      } catch (error) {
        console.error("Error fetching Net Income data:", error);
      }
    };

    fetchNetIncome();
  }, []);


  // doesnt have to return net income 

  return (
    <div>
      <h1>Net Income Year-over-Year</h1>
      <ul>
        {netIncomeData.map((item, index) => (
          <li key={index}>
            Year: {item.year}, Net Income: ${item.netIncome.toLocaleString()}{" "}
            <span style={{ color: indicators[index] }}>
              {indicators[index] || "N/A"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}