// File: be/server.js

import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client'; 

// Import routes yang sudah dan akan kita buat
import adminRoutes from './routes/adminRoutes'; 
import productRoutes from './routes/productRoutes';

// Inisialisasi Prisma Client
const prisma = new PrismaClient();

const app = express();
const PORT = 5000; // Port 5000 sudah sesuai dengan setting FE Anda

// --- Middleware ---

// 1. CORS Configuration: Mengizinkan frontend Next.js (port 3000)
app.use(cors({
    origin: 'http://localhost:3000', // Izinkan FE Next.js
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

// 2. Body Parser: Mengizinkan server membaca JSON
app.use(express.json()); 

// --- Penggunaan Routes ---

// Route Admin (Login, Register, dll.)
app.use('/api/admin', adminRoutes);

// Route Produk (CRUD)
app.use('/api/products', productRoutes); 

// Endpoint Root - Verifikasi Server
app.get('/', (req, res) => {
    res.status(200).json({ 
        message: 'Lumera Shop Backend API is running successfully!',
        service: 'Express.js',
        database: 'PostgreSQL/Prisma',
        timestamp: new Date().toISOString()
    });
});

// --- Server Startup ---

app.listen(PORT, async () => {
    try {
        // Coba koneksi ke database saat server mulai
        await prisma.$connect();
        console.log('✅ Database connected successfully!');
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
    } catch (error) {
        console.error('❌ Failed to connect to database or start server:', error);
        // Hentikan proses jika gagal terhubung ke DB
        process.exit(1); 
    }
});

// Tutup koneksi database saat aplikasi dimatikan (graceful shutdown)
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    console.log('Database connection closed.');
    process.exit(0);
});