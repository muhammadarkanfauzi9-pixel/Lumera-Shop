// File: be/routes/adminRoutes.ts

import { Router } from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { loginAdmin, registerAdmin, getAdminStats, getAdminProfile, updateAdminProfile, updateAdminPassword } from '../controllers/adminController';
import { verifyToken, checkRole } from '../middleware/auth';

const prisma = new PrismaClient();

const router = Router();

// POST /api/admin/register
// Route untuk setup admin awal (HAPUS atau komentari setelah admin pertama terdaftar!)
router.post('/register', registerAdmin);

// POST /api/admin/login
// Route utama untuk login
router.post('/login', loginAdmin);

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

export default router;
