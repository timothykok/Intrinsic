import Image from "next/image";
import Search from "./search/page";
import Ticker from "./ui/Ticker.js";
import Financials from "./ui/Financials.js";
import Calculation from "./ui/Calculation";
import ShareValue from "./ui/ShareValue";

export default function Home() {
  return (
    <>  
     <Ticker/>
  


     <div className="title-wrapper">
        <h1 className="title"> Intrinsic. </h1>

        <input className="search-bar" type="text" placeholder="Enter Stock" />
      </div>


  
     <Financials/>
     <Calculation/>
     <ShareValue/>
     
     

   
      
    </>
  );
}