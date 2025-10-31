// File: be/routes/adminRoutes.ts

import { Router } from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { loginAdmin, registerAdmin, getAdminStats, getAdminProfile, updateAdminProfile } from '../controllers/adminController';
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
router.get('/profile', verifyToken, checkRole(['SuperAdmin', 'Editor']), async (req: Request, res: Response) => {
    const adminId = (req as any).admin?.id;

    if (!adminId) {
        return res.status(401).json({ message: 'Admin not authenticated.' });
    }

    try {
        const admin = await prisma.admin.findUnique({
            where: { id: adminId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found.' });
        }

        res.status(200).json({ admin });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch profile.', error: error.message });
    }
});

export default router;
