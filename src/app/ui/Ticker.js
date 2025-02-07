"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function Ticker() {
  const [stocks, setStocks] = useState([]);

  const fmpApiKey = process.env.NEXT_PUBLIC_FINANCIAL_API_KEY;

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const symbols = ["AAPL", "MSFT", "UBER", "AMZN", "META", "GOOG", "TSLA", "NVDA", "ADBE", "MA", "PYPL"];
        const symbolString = symbols.join(",");

        const response = await axios.get(
          `https://financialmodelingprep.com/api/v3/quote/${symbolString}?apikey=${fmpApiKey}`
        );

        const stockData = response.data.map((data) => {
          return {
            symbol: data.symbol,
            price: data.price,
            change: data.change > 0 ? `+${data.change}` : `${data.change} (${data.changesPercentage.toFixed(2)})`,
          };
        });

        setStocks(stockData);
      } catch (error) {
        console.error("Error fetching stock data:", error);
      }
    };

    fetchStocks();

    const interval = setInterval(fetchStocks, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="ticker-wrapper  overflow-hidden py-2 w-auto font-bold text-sm">
      <div className="ticker-content flex animate-ticker-scroll whitespace-nowrap gap-8">
        {/* Original Ticker Items */}
        {stocks.map((stock, index) => (
          <div
            key={index}
            className="ticker-item flex items-center mr-8 flex-shrink-0"
          >
            <span className="ticker-stock-symbol font-bold">{stock.symbol}</span>
            <span className="ticker-stock-price font-normal mx-2">
              ${stock.price.toFixed(2)}
            </span>
            <span
              className={`font-normal  ${
                stock.change.includes("+") ? "text-green-500" : "text-red-500"
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