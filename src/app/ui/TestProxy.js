import { useState, useEffect } from 'react'

function TestProxy() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const response = await fetch('/api/proxy', {
      params: {
        url: 'https://api.stlouisfed.org/fred/series/observations',
        params: {
          series_id: 'DGS10',
        //   api_key: process.env.API_KEY,
          api_key: 'c65a4c196c937ace2b33dda01eb55fb6',
          file_type: 'json'
        }
      }
    });
    const result = await response.json();
    setData(result);
  };

  return (
    <div>
        <h1>Test Proxy</h1>
      {data ? JSON.stringify(data) : 'Loading...'}
    </div>
  );
}

export default TestProxy;
