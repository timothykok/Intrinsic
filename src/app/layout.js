import "./globals.css";
import SearchNav from "./ui/NavBars/SearchNav";

import { MethodProvider } from "../context/MethodContext.js";
import Footer from "./ui/Footer";

export const metadata = {
  title: "Intrinsic",
  description: "Anytime. Anywhere.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body
        className="antialiased font-light"
        style={{ fontFamily: '"Montserrat", sans-serif' }}
        suppressHydrationWarning={true}
      >
        <MethodProvider>
          {/* <SearchNav /> */}
          {children}
        </MethodProvider>
        {/* <Footer/> */}
      </body>

    </html>
  );
}
