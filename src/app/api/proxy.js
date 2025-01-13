//api/proxy.js

import axios from 'axios';

export default async function handler(req, res) {
  const { url, params } = req.query;
  console.log('PROXY RUNNING')

  try {
    const response = await axios.get(url, { params });
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}
