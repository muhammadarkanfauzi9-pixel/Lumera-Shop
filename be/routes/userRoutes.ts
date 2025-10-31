// File: be/routes/userRoutes.ts

import { Router } from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
// Ingat, gunakan .js di TypeScript saat mengimpor relatif!
import { registerUser, loginUser, updateUserProfile } from '../controllers/userController.js';
import { verifyUserToken } from '../middleware/auth.js';

const prisma = new PrismaClient();

const router = Router();

// POST /api/auth/register
router.post('/register', registerUser);

// POST /api/auth/login
router.post('/login', loginUser);

// PUT /api/auth/profile
// Update user profile (User only)
router.put('/profile', verifyUserToken, updateUserProfile);

// GET /api/auth/profile
// Get user profile (User only)
router.get('/profile', verifyUserToken, async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated.' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                address: true,
                image: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ user });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch profile.', error: error.message });
    }
});

export default router;
