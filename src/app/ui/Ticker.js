"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import gsap from 'gsap';

export default function Ticker() {
  const [stocks, setStocks] = useState([]);
  const stockRefs = useRef([]); // Ref for each stock item
  const router = useRouter(); // Initialize router


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

    // Hover Animation
    const handleMouseEnter = (index) => {
      gsap.to(stockRefs.current[index], {
        scale: 1.2, // Slightly enlarge
  
        duration: 0.2,
      });
    };
  
    const handleMouseLeave = (index) => {
      gsap.to(stockRefs.current[index], {
        scale: 1, // Return to normal
        boxShadow: "none",
        duration: 0.2,
      });
    };

    // Click to Navigate to Slug Page
    const handleStockClick = (symbol, index) => {
      gsap.to(stockRefs.current[index], {
        opacity: 0, // Fade out
        scale: 0.8, // Shrink slightly
        duration: 0.3,
        onComplete: () => router.push(`/stocks/${symbol}`), // Navigate after animation
      });
    };




    return (
      <div className="ticker-wrapper overflow-hidden py-2 w-auto font-bold text-sm mt-12">
        <div className="ticker-content flex animate-ticker-scroll whitespace-nowrap gap-8">
          {stocks.map((stock, index) => (
            <div
              key={index}
              ref={(el) => (stockRefs.current[index] = el)} // Assign ref to each stock
              className="ticker-item flex items-center mr-8 flex-shrink-0 px-4 py-2 bg-white rounded-lg transition-all cursor-pointer"
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={() => handleMouseLeave(index)}
              onClick ={() => handleStockClick(stock.symbol)}
            >
              <span className="ticker-stock-symbol font-bold">{stock.symbol}</span>
              <span className="ticker-stock-price font-normal mx-2">${stock.price.toFixed(2)}</span>
              <span
                className={`font-normal ${stock.change.includes("+") ? "text-green-500" : "text-red-500"}`}
              >
                {stock.change}%
              </span>
            </div>
          ))}
        </div>
      </div>
    );
}