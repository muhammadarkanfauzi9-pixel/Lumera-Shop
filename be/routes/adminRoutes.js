import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { login } from '../controllers/authController.js';
import { getAdminStats, getAdminProfile, updateAdminProfile, updateAdminPassword, getTodaySales, getNewOrdersToday, getTotalRevenue, getReviews, getAdminLogs } from '../controllers/adminController.js';
import { verifyToken, checkRole } from '../middleware/auth.js';
const prisma = new PrismaClient();
const router = Router();
// POST /api/admin/register
// Route untuk setup admin awal (HAPUS atau komentari setelah admin pertama terdaftar!)
router.post('/register', login);
// POST /api/admin/login
// Route utama untuk login
router.post('/login', login);
// GET /api/admin/stats
// Get admin statistics (Admin only)
router.get('/stats', verifyToken, checkRole(['SuperAdmin', 'Editor']), getAdminStats);
// GET /api/admin/profile
// Get admin profile (Admin only)
router.get('/profile', verifyToken, checkRole(['SuperAdmin', 'Editor']), getAdminProfile);
// PUT /api/admin/profile
// Update admin profile (Admin only)
router.put('/profile', verifyToken, checkRole(['SuperAdmin', 'Editor']), updateAdminProfile);
// PUT /api/admin/password
// Update admin password (Admin only)
router.put('/password', verifyToken, checkRole(['SuperAdmin', 'Editor']), updateAdminPassword);
// GET /api/admin/today-sales
// Get today's sales data (Admin only)
router.get('/today-sales', verifyToken, checkRole(['SuperAdmin', 'Editor']), getTodaySales);
// GET /api/admin/new-orders-today
// Get new orders today (Admin only)
router.get('/new-orders-today', verifyToken, checkRole(['SuperAdmin', 'Editor']), getNewOrdersToday);
// GET /api/admin/total-revenue
// Get total revenue data (Admin only)
router.get('/total-revenue', verifyToken, checkRole(['SuperAdmin', 'Editor']), getTotalRevenue);
// GET /api/admin/reviews
// Get reviews data (Admin only)
router.get('/reviews', verifyToken, checkRole(['SuperAdmin', 'Editor']), getReviews);
// GET /api/admin/logs
// Get full admin logs / history (Admin only). Supports ?page=1&limit=20&module=&action=&startDate=&endDate=
router.get('/logs', verifyToken, checkRole(['SuperAdmin', 'Editor']), getAdminLogs);
export default router;
//# sourceMappingURL=adminRoutes.js.map