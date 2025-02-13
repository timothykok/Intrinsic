import "./globals.css";
import Nav from "./ui/Nav";

import { MethodProvider } from "../context/MethodContext.js"; 

export const metadata = {
  title: "Intrinsic",
  description: "Anytime. Anywhere.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className="antialiased font-light"
        style={{ fontFamily: '"Montserrat", sans-serif' }}
      >
        <MethodProvider>
          <Nav />
          {children}
        </MethodProvider>
      </body>
    </html>
  );
}