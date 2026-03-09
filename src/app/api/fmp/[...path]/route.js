import { NextResponse } from "next/server";

const FMP_API_KEY = process.env.FINANCIAL_API_KEY;
const FMP_BASE_URL = "https://financialmodelingprep.com";

export async function GET(request, { params }) {
  const { path } = await params;
  const pathString = path.join("/");
  
  const { searchParams } = new URL(request.url);
  
  const url = new URL(`${FMP_BASE_URL}/${pathString}`);
  
  searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });
  url.searchParams.set("apikey", FMP_API_KEY);

  try {
    const response = await fetch(url.toString());
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("FMP API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data from FMP API" },
      { status: 500 }
    );
  }
}
