import Link from "next/link";


export default function Nav() {
  return (
    <>
      <div className="wrapper">
        <div className="nav-container">
          <div className="nav">
            <Link href="/home"> Watchlist </Link>
            <Link href="/about"> User Manual </Link>
            <Link href="/about"> Log In </Link>
          </div>
        </div>
      </div>
    </>
  );
}
