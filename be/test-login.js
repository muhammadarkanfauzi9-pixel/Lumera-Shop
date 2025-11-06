(async () => {
  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@lumera.com', password: 'admin123' })
    });

    console.log('Status:', res.status);
    const data = await res.text();
    try {
      console.log('Body JSON:', JSON.parse(data));
    } catch (e) {
      console.log('Body text:', data);
    }
  } catch (err) {
    console.error('Request failed:', err.message);
  }
})();
