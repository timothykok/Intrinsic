import Image from "next/image";
import Search from "./search/page";
import Ticker from "./ui/Ticker.js";
import Financials from "./ui/Financials.js";

export default function Home() {
  return (
    <>  
     <Ticker/>
  


     <div className="title-wrapper">
        <h1 className="title"> Intrinsic. </h1>

        <input className="search-bar" type="text" placeholder="Enter Stock" />
      </div>


  
     <Financials/>

   
      
    </>
  );
}