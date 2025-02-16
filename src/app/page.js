// app/page.js (a Server Component)
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamically import the Home client component.
// Make sure the file path matches where you renamed your Home component.
const Home = dynamic(() => import("./home.client"), { suspense: true });

export default function Page() {
  return (
    <Suspense fallback={<div>Loading Home page...</div>}>
      <Home />
    </Suspense>
  );
}