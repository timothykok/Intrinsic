import { useEffect, useRef } from "react";

export default function StockChart({ ticker }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!ticker) return; // Prevent running for an empty ticker

    // Clear any previous widget instance
    containerRef.current.innerHTML = "";

    // Append custom styles
    const style = document.createElement("style");
    style.innerHTML = `
      #tradingview-widget-container * {
        font-family: "Montserrat", sans-serif !important;
        font-weight: 300 !important;
      }
    `;
    document.head.appendChild(style);

    // Create and configure the advanced chart script element with studies
    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "autosize": true,
        "symbol": "${ticker}",
        "interval": "D",
        "timezone": "Etc/UTC",
        "theme": "light",
        "style": "1",
        "locale": "en",
        "hide_side_toolbar": false,
        "allow_symbol_change": true,
        "calendar": false,
        "studies": [
          "STD;SMA",
          "STD;EMA",
           "STD;MACD"
        ],
        "support_host": "https://www.tradingview.com"
      }`;

    // Append the script to our container
    containerRef.current.appendChild(script);
  }, [ticker]);

  return (
    <>
      <div className="h-[450px]">


      <div
        id="tradingview-widget-container"
        ref={containerRef}
        className="tradingview-widget-container m-auto mt-12 mb-12 border border-solid rounded-lg shadow-xs z-100"
        style={{ height: "100%", width: "100%" }} // Increased overall height
      >
        <div
          className="tradingview-widget-container__widget"
          style={{ height: "100%", width: "100%" }} // Adjust inner widget height as needed
        ></div>
        <div className="tradingview-widget-copyright">
          <a
            href="https://www.tradingview.com/"
            rel="noopener nofollow"
            target="_blank"
          >
            <span className="blue-text">Track all markets on TradingView</span>
          </a>
        </div>
      </div>
      </div>

      
    </>
  );
}
