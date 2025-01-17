export default function StockInfo({
    logoSrc,
    companyName,
    ticker,
    price,
    currency,
    change,
    percentage,
    timestamp,
  }) {
    return (
      <div className="stock-container">
        <div className="stock-logo-container">
          <img src={logoSrc} alt={`${companyName} Logo`} className="stock-logo" />
        </div>
  
        <div className="stock-details-and-price-container">
          <div className="stock-details-container">
            <div className="stock-details">
              <div className="stock-company-name">{companyName}</div>
              <div className="stock-ticker">{ticker}</div>
            </div>
          </div>
  
          <div className="stock-price-container">
            <div>
              <span className="stock-price">
                {price.toFixed(2)} <span className="stock-currency">{currency}</span>
              </span>
              <div className="stock-timestamp">{timestamp}</div>
            </div>
          </div>
  
          <div className="stock-change">
            <span style={{ color: change > 0 ? "#29B353" : "red" }}>
              {change > 0 ? "+" : ""}
              {change.toFixed(2)} ({percentage.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>
    );
  }