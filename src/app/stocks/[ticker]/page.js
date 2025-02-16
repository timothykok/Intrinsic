// app/stocks/[ticker]/page.js (a Server Component)
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Import your client component for the stock page.
const StockPage = dynamic(() => import("./stock.client"), { suspense: true });

export default function Page() {
  return (
    <Suspense fallback={<div>Loading stock data...</div>}>
      <StockPage />
    </Suspense>
  );
}