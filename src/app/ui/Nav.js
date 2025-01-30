import Link from "next/link";


export default function Nav() {
  return (
    <>
   
        <div className="flex justify-between ml-[122px] mr-[122px]  pt-12 mb-12 font-normal">
          <div className="p-2">
            <Link href="/"> 
            <img
                    src="/Intrinsic..png"
                    alt="View More"
                    className="w-[109] h-[11`px]"
                    href="/"
                  />
            </Link>
         
          </div>


          <div className="flex gap-2">
            <div className="hover:bg-[#EEEEEE]  hover:font-normal hover:text-stone-500  text-[#878686] p-2 rounded-lg pr-2 pl-2">
            <Link href="/home"> Watchlist </Link>
            </div>
           <div className="hover:bg-[#EEEEEE]  hover:font-normal hover:text-stone-500  text-[#878686] p-2 rounded-lg pr-2 pl-2">
           <Link href="/about"> User Manual </Link>
           </div> 
         

           <div className="hover:bg-[#EEEEEE]  hover:font-normal hover:text-stone-500  text-[#878686] p-2 rounded-lg pr-2 pl-2">
           <Link href="/about"> Login </Link>
           </div> 
          </div>
        </div>
 
    </>
  );
}
