"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function Ticker() {
  const [stocks, setStocks] = useState([]);

  const finnhubApiKey = process.env.NEXT_PUBLIC_FINANCIAL_API_KEY;

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        // API Call to Finnhub 
        const symbols = ["AAPL", "MSFT", "UBER", "AMZN", "META", "GOOG", "TSLA", "NVDA", "ADBE", "MA", "PYPL"];
        const stockPromises = symbols.map((symbol) =>
          axios.get(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${finnhubApiKey}`)
        );

        const stockResponses = await Promise.all(stockPromises);

        // Map API response to desired format
        const stockData = stockResponses.map((response, index) => {
          const symbol = symbols[index]; // Symbol from the array
          const data = response.data;
          return {
            symbol: symbol,
            price: data.c, // Current price
            change: data.d > 0 ? `+${data.d}` : `${data.d} (${data.dp.toFixed(2)})` , // Price change
          };
        });

        setStocks(stockData);
      } catch (error) {
        console.error("Error fetching stock data:", error);
      }
    };

    fetchStocks();

    // Refresh stock data every minute
    const interval = setInterval(fetchStocks, 60000); // Update every 60 seconds
    return () => clearInterval(interval); // Clean up interval on unmount
  }, []);

  

  return (
    <div className="ticker-wrapper bg-gray-800 overflow-hidden">
      <div className="ticker-content flex animate-scroll space-x-8">
        {stocks.map((stock, index) => (
          <div key={index} className="ticker-item flex items-center space-x-2">
            <span className="ticker-stock-symbol">{stock.symbol}</span>
            <span className="ticker-stock-price ">${stock.price.toFixed(2)}</span>
            <span
              className={
                stock.change.includes("+") ? "text-green-500" : "text-red-500"
              }
            >
              {stock.change}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
