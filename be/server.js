const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get('/api/data', (req, res) => {
    console.log('Permintaan ke /api/data diterima');
    // BENAR: res (Response) memiliki method .json()
    res.json({ 
        message: 'Data dari Express.js Back-end!',
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});