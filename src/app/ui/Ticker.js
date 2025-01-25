"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function Ticker() {
  const [stocks, setStocks] = useState([]);

  const fmpApiKey = process.env.NEXT_PUBLIC_FINANCIAL_API_KEY;

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        // API Call to Financial Modeling Prep
        const symbols = ["AAPL", "MSFT", "UBER", "AMZN", "META", "GOOG", "TSLA", "NVDA", "ADBE", "MA", "PYPL"];
        const symbolString = symbols.join(","); // Create a comma-separated string of symbols

        const response = await axios.get(
          `https://financialmodelingprep.com/api/v3/quote/${symbolString}?apikey=${fmpApiKey}`
        );

        // Map API response to desired format
        const stockData = response.data.map((data) => {
          return {
            symbol: data.symbol,
            price: data.price, // Current price
            change: data.change > 0 ? `+${data.change}` : `${data.change} (${data.changesPercentage.toFixed(2)})`, // Price change and percentage
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
    <div className="ticker-wrapper bg-gray-800 overflow-hidden py-2">
      <div className="ticker-content flex animate-scroll space-x-8">
        {stocks.map((stock, index) => (
          <div
            key={index}
            className="ticker-item flex items-center space-x-4 text-black"
          >
            <span className="ticker-stock-symbol font-medium">
              {stock.symbol}
            </span>
            <span className="ticker-stock-price font-light">
              ${stock.price.toFixed(2)}
            </span>
            <span
              className={`font-semibold ${
                stock.change.includes("+")
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {stock.change}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}