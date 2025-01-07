import Image from "next/image";
import Search from "./search/page";
import StockTicker from "./ticker/page";
import Financials from "./financials/page";
import NetIncome from "./financials/free_cash_flow_equity/page";

export default function Home() {
  return (
    <>  
     <StockTicker/>
     <Search />
     <Financials/>
     <NetIncome/>

   
      
    </>
  );
}