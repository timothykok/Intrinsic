import Link from "next/link";


export default function Nav() {
  return (
    <>
   
        <div className="flex justify-between ml-[122px] mr-[122px] pt-12 mb-12">
          <div className="">
            <Link href="/"> 
            <img
                    src="/Intrinsic..svg"
                    alt="View More"
                    className="w-[109] h-[29px]"
                    href="/"
                  />
            </Link>
         
          </div>


          <div className="flex gap-6">
            <Link href="/home"> Watchlist </Link>
            <Link href="/about"> User Manual </Link>
            <Link href="/about"> Log In </Link>
          </div>
        </div>
 
    </>
  );
}
