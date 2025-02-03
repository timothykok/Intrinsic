import Link from "next/link";


export default function Nav() {
  return (
    <>
   
        <div className="flex justify-between ml-[122px] mr-[122px] align-center pt-12 mb-12 font-sm">
          <div className="p-2">
            <Link href="/"> 
            <img
                    src="/Intrinsic..png"
                    alt="View More"
                    className="w-[128px] h-[24px]"
                    href="/"
                  />
            </Link>
         
          </div>


          <div className="flex gap-2 text-sm">


          <div className="hover:bg-[#EEEEEE]  hover:font-sm hover:text-stone-500  text-[#878686] p-2 rounded-lg ">
           <Link href="/"> How This Works </Link>
           </div> 


            <div className="hover:bg-[#EEEEEE]  hover:font-sm hover:text-stone-500  text-[#878686] p-2 rounded-lg ">
            <Link href="/"> Watchlist </Link>
            </div>

            
        
         

           <div className="hover:bg-[#EEEEEE]  hover:font-sm hover:text-stone-500  text-[#878686] p-2 rounded-lg ">
           <Link href="/"> Login </Link>
           </div> 
          </div>
        </div>
 
    </>
  );
}
