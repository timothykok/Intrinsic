'use client'

import { createContext, useContext, useState } from "react";

const MethodContext = createContext();

export function MethodProvider({ children }) {
  const [selectedMethod, setSelectedMethod] = useState("");
  return (
    <MethodContext.Provider value={{ selectedMethod, setSelectedMethod }}>
      {children}
    </MethodContext.Provider>
  );
}

export function useMethod() {
  return useContext(MethodContext);
}