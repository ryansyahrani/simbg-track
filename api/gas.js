// Vercel Serverless Function — proxy ke Google Apps Script
// Menyelesaikan masalah CORS: browser → Vercel (same-origin) → GAS

const GAS_URL = 'https://script.google.com/macros/s/AKfycbx2PQaGvbNiPUNDZaGpHoxkINhljgxMR8TxJ2PdVrrEfZKKWJiCAe1jBFUzREjeWv4g8g/exec';

module.exports = async function handler(req, res) {
  // Izinkan semua origin (karena ini proxy internal)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const body = JSON.stringify(req.body);

    const gasResponse = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: body,
      redirect: 'follow'
    });

    const text = await gasResponse.text();

    // Coba parse JSON, jika gagal kembalikan error
    let data;
    try {
      data = JSON.parse(text);
    } catch(e) {
      data = { success: false, message: 'GAS response bukan JSON: ' + text.substring(0, 200) };
    }

    res.status(200).json(data);

  } catch (err) {
    res.status(500).json({ success: false, message: 'Proxy error: ' + err.message });
  }
};
