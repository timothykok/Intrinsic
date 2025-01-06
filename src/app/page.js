import Image from "next/image";
import Search from "./search/page";
import StockTicker from "./ticker/page";

export default function Home() {
  return (
    <>  
     <StockTicker/>
     <Search />
   
      
    </>
  );
}