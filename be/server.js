// File: be/server.js
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import cron from 'node-cron';
// Import routes yang sudah dan akan kita buat
import adminRoutes from './routes/adminRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
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
// 3. Static Files: Serve uploaded images
app.use('/uploads', express.static('../fe/public/uploads'));
// --- Penggunaan Routes ---
// Route Admin (Login, Register, dll.)
app.use('/api/admin', adminRoutes);
// Route Produk (CRUD)
app.use('/api/products', productRoutes);
// Route Orders (CRUD)
app.use('/api/orders', orderRoutes);
// Route Users (Login, Register, dll.)
app.use('/api/users', userRoutes);
// Route Auth (Unified Login)
app.use('/api/auth', authRoutes);
// Endpoint Root - Verifikasi Server
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Lumera Shop Backend API is running successfully!',
        service: 'Express.js',
        database: 'PostgreSQL/Prisma',
        timestamp: new Date().toISOString()
    });
});
// --- Cron Job untuk Auto-Cancel Expired Orders ---
// Jalankan setiap menit untuk cek order yang expired
cron.schedule('* * * * *', async () => {
    try {
        const now = new Date();
        const expiredOrders = await prisma.order.findMany({
            where: {
                expirationTime: {
                    lt: now
                },
                paymentStatus: 'PENDING',
                orderStatus: 'PENDING'
            },
            include: {
                items: true
            }
        });
        for (const order of expiredOrders) {
            // Update order status to CANCELED
            await prisma.order.update({
                where: { id: order.id },
                data: {
                    paymentStatus: 'CANCELED',
                    orderStatus: 'CANCELED'
                }
            });
            // Restore stock
            for (const item of order.items) {
                await prisma.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            increment: item.quantity
                        }
                    }
                });
            }
        }
        if (expiredOrders.length > 0) {
            console.log(`Auto-canceled ${expiredOrders.length} expired orders`);
        }
    }
    catch (error) {
        console.error('Error in cron job:', error);
    }
});
// --- Server Startup ---
app.listen(PORT, async () => {
    try {
        // Coba koneksi ke database saat server mulai
        await prisma.$connect();
        console.log('✅ Database connected successfully!');
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
        console.log('⏰ Cron job for order expiration started');
    }
    catch (error) {
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
//# sourceMappingURL=server.js.map