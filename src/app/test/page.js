import { useState, useEffect } from 'react'

function MyPage({ initialData }) {
  const [data, setData] = useState(initialData)

  useEffect(() => {
    // You can still fetch data on the client-side if needed
    // This will work without CORS issues since the initial data was fetched server-side
    fetchDataAndUpdate()
  }, [])

  const fetchDataAndUpdate = async () => {
    // Fetch data from API
    const newData = await fetch('/api/my-endpoint')
    setData(await newData.json())
  }

  return (
    <div>
      <h1>HELLOOO API</h1>
      <p>{JSON.stringify(data)}</p>
    </div>
  )
}

export async function getServerSideProps(context) {
  // Fetch data from external API on the server
  const res = await fetch('https://api.stlouisfed.org/fred/series/observations', {
    method: 'GET',
    params: {
      series_id: 'DGS10',
      // api_key: process.env.API_KEY,
      api_key: 'c65a4c196c937ace2b33dda01eb55fb6',
      file_type: 'json'
    }
  })

  const data = await res.json()

  // Pass data to the page via props
  return { props: { initialData: data } }
}

export default MyPage
