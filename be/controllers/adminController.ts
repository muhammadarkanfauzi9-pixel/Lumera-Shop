// File: be/controllers/adminController.ts

import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = 'YOUR_SUPER_SECRET_KEY'; // GANTI DENGAN KUNCI RAHASIA YANG LEBIH KUAT

// 1. Register Admin (Hanya untuk setup)
export const registerAdmin = async (req: Request, res: Response) => {
    const { name, email, password, role } = req.body;
    
    // Validasi data input
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = await prisma.admin.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || 'Editor',
            },
        });
        
        const { password: _, ...adminData } = admin; 
        res.status(201).json({ message: 'Admin registered successfully', admin: adminData });
    } catch (error: any) {
        if (error.code === 'P2002') { 
            return res.status(400).json({ message: 'Email already exists.' });
        }
        res.status(500).json({ message: 'Failed to register admin.', error: error.message });
    }
};

// 2. Login Admin
export const loginAdmin = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const admin = await prisma.admin.findUnique({ where: { email } });

        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { id: admin.id, role: admin.role, email: admin.email },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        const { password: _, ...adminData } = admin;
        res.status(200).json({
            token,
            admin: adminData,
            message: 'Login successful'
        });

    } catch (error: any) {
        res.status(500).json({ message: 'Server error during login.', error: error.message });
    }
};

// 3. Get admin statistics
export const getAdminStats = async (req: Request, res: Response) => {
    try {
        // Total orders
        const totalOrders = await prisma.order.count();

        // Total revenue (from completed orders)
        const revenueResult = await prisma.order.aggregate({
            _sum: {
                totalAmount: true,
            },
            where: {
                paymentStatus: 'COMPLETED',
            },
        });
        const totalRevenue = revenueResult._sum.totalAmount || 0;

        // Total products
        const totalProducts = await prisma.product.count();

        // Recent orders (last 10)
        const recentOrders = await prisma.order.findMany({
            take: 10,
            orderBy: { orderDate: 'desc' },
            include: {
                user: {
                    select: { name: true, email: true },
                },
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        // Orders by status
        const orderStats = await prisma.order.groupBy({
            by: ['orderStatus'],
            _count: {
                id: true,
            },
        });

        res.status(200).json({
            totalOrders,
            totalRevenue: `Rp ${totalRevenue.toLocaleString('id-ID')}`,
            totalProducts,
            recentOrders,
            orderStats,
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch admin statistics.', error: error.message });
    }
};

// 4. Get admin profile
export const getAdminProfile = async (req: Request, res: Response) => {
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

        res.status(200).json({
            admin,
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch admin profile.', error: error.message });
    }
};

// 5. Update admin profile
export const updateAdminProfile = async (req: Request, res: Response) => {
    const adminId = (req as any).admin?.id;
    const { name, email } = req.body;

    if (!adminId) {
        return res.status(401).json({ message: 'Admin not authenticated.' });
    }

    try {
        const updatedAdmin = await prisma.admin.update({
            where: { id: adminId },
            data: {
                name: name || undefined,
                email: email || undefined,
            },
        });

        const { password: _, ...adminData } = updatedAdmin;
        res.status(200).json({
            message: 'Profile updated successfully',
            admin: adminData
        });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return res.status(400).json({ message: 'Email already exists.' });
        }
        res.status(500).json({ message: 'Failed to update profile.', error: error.message });
    }
};
