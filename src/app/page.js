"use client";

import Image from "next/image";
import Ticker from "./ui/Ticker.js";
import Financials from "./ui/Financials.js";
import Calculation from "./ui/Calculation";
import ShareValue from "./ui/ShareValue";
import Projection from "./ui/Projection";
import TestProxy from "./ui/TestProxy";
import { useState } from "react";

export default function Home() {
  const [ticker, setTicker] = useState("");

  const handleInputChange = (event) => {
    setTicker(event.target.value); 
  };

  return (
    <>  
     <Ticker Ticker={ticker}/>
  


     <div className="title-wrapper">
        <h1 className="title"> Intrinsic. </h1>

        <input className="search-bar" type="text" placeholder="Enter Stock"  onChange={handleInputChange}  />
      </div>


  
     <Financials Ticker= {ticker}/>
     <Calculation Ticker ={ticker}/>
     <ShareValue Ticker = {ticker}/>
     <Projection Ticker = {ticker}/>

     {/* <TestProxy /> */}
     
     

   
      
    </>
  );
}