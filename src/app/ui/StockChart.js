// File: ./ui/TradingViewWidget.js
import { useEffect, useRef } from "react";

export default function StockChart({ ticker }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!ticker) return; // Prevent running for an empty ticker

    // Remove previous widget (if any) before adding a new one
    containerRef.current.innerHTML = "";

    const style = document.createElement("style");
    style.innerHTML = `
      #tradingview-widget-container * {
        font-family: "Verlag", sans-serif !important;
        font-weight: 300 !important;
      }
    `;
    document.head.appendChild(style);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      if (window.TradingView) {
        new window.TradingView.widget({
          autosize: true,
          symbol: ticker, // Use the dynamic ticker value
          interval: "D", // Daily interval
          timezone: "Etc/UTC",
          theme: "light",
          style: "2", // Line chart
          locale: "en",
          toolbar_bg: "#f1f3f6",
          enable_publishing: false,
          hide_top_toolbar: true,
          save_image: false,
          container_id: "tradingview-widget-container",
        });
      }
    };

    containerRef.current.appendChild(script);
  }, [ticker]); // Re-run effect when `ticker` changes

  return (
    <div
      id="tradingview-widget-container"
      ref={containerRef}

      className="h-[450px] w-[800px] m-auto mt-12 mb-12 border border-solid rounded-lg shadow-sm z-100"
    


    />
  );
}