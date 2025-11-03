// File: be/controllers/adminController.ts

import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = 'lumera_admin_secret_key_2024'; // GANTI DENGAN KUNCI RAHASIA YANG LEBIH KUAT

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

        // Today's sales (orders completed today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todaySalesResult = await prisma.order.aggregate({
            _sum: {
                totalAmount: true,
            },
            where: {
                paymentStatus: 'COMPLETED',
                orderDate: {
                    gte: today,
                    lt: tomorrow,
                },
            },
        });
        const todaySales = todaySalesResult._sum.totalAmount || 0;

        // New orders today
        const newOrdersToday = await prisma.order.count({
            where: {
                orderDate: {
                    gte: today,
                    lt: tomorrow,
                },
            },
        });

        // Monthly sales data for chart (last 8 months)
        const monthlySales = [];
        for (let i = 7; i >= 0; i--) {
            const monthStart = new Date();
            monthStart.setMonth(monthStart.getMonth() - i, 1);
            monthStart.setHours(0, 0, 0, 0);

            const monthEnd = new Date(monthStart);
            monthEnd.setMonth(monthEnd.getMonth() + 1);

            const monthResult = await prisma.order.aggregate({
                _sum: {
                    totalAmount: true,
                },
                where: {
                    paymentStatus: 'COMPLETED',
                    orderDate: {
                        gte: monthStart,
                        lt: monthEnd,
                    },
                },
            });

            const monthName = monthStart.toLocaleString('default', { month: 'short' });
            monthlySales.push({
                month: monthName,
                sales: monthResult._sum.totalAmount || 0,
            });
        }

        // Average rating (placeholder for now, can be enhanced with review system)
        const avgRating = 4.9;

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
            totalRevenue: `Rp ${totalRevenue.toLocaleString('id-ID')}`,
            totalOrders,
            totalProducts,
            todaySales: `Rp ${todaySales.toLocaleString('id-ID')}`,
            newOrdersToday,
            avgRating,
            monthlySales,
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
                profileImageUrl: true,
                passwordChanges: true,
                lastPasswordChange: true,
                averageActiveTime: true,
                activeModules: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found.' });
        }

        // Get recent admin logs (last 10 activities)
        const recentLogs = await prisma.adminLog.findMany({
            where: { adminId },
            orderBy: { createdAt: 'desc' },
            take: 10,
            select: {
                action: true,
                module: true,
                description: true,
                createdAt: true,
            },
        });

        // Get last accessed modules (group by module and get latest)
        const lastAccessedModules = await prisma.adminLog.findMany({
            where: { adminId, module: { not: null } },
            orderBy: { createdAt: 'desc' },
            distinct: ['module'],
            take: 5,
            select: {
                module: true,
                createdAt: true,
            },
        });

        res.status(200).json({
            admin,
            recentLogs,
            lastAccessedModules,
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch admin profile.', error: error.message });
    }
};

// 5. Update admin profile
export const updateAdminProfile = async (req: Request, res: Response) => {
    const adminId = (req as any).admin?.id;
    const { name, email, profileImageUrl } = req.body;

    if (!adminId) {
        return res.status(401).json({ message: 'Admin not authenticated.' });
    }

    try {
        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (profileImageUrl !== undefined) updateData.profileImageUrl = profileImageUrl;

        const updatedAdmin = await prisma.admin.update({
            where: { id: adminId },
            data: updateData,
        });

        // Log the profile update activity
        await prisma.adminLog.create({
            data: {
                adminId,
                action: 'update_profile',
                module: 'Profile',
                description: 'Updated admin profile information',
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
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

// 6. Update admin password
export const updateAdminPassword = async (req: Request, res: Response) => {
    const adminId = (req as any).admin?.id;
    const { currentPassword, newPassword } = req.body;

    if (!adminId) {
        return res.status(401).json({ message: 'Admin not authenticated.' });
    }

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current password and new password are required.' });
    }

    try {
        const admin = await prisma.admin.findUnique({ where: { id: adminId } });
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found.' });
        }

        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ message: 'Current password is incorrect.' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        const updatedAdmin = await prisma.admin.update({
            where: { id: adminId },
            data: {
                password: hashedNewPassword,
                passwordChanges: { increment: 1 },
                lastPasswordChange: new Date(),
            },
        });

        // Log the password change activity
        await prisma.adminLog.create({
            data: {
                adminId,
                action: 'change_password',
                module: 'Security',
                description: 'Changed admin password',
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
            },
        });

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to update password.', error: error.message });
    }
};

// 7. Log admin activity
export const logAdminActivity = async (adminId: number, action: string, module: string, description: string, req?: Request) => {
    try {
        await prisma.adminLog.create({
            data: {
                adminId,
                action,
                module,
                description,
                ipAddress: req?.ip,
                userAgent: req?.get('User-Agent'),
            },
        });
    } catch (error) {
        console.error('Failed to log admin activity:', error);
    }
};

// 8. Update admin activity stats
export const updateAdminActivityStats = async (adminId: number) => {
    try {
        // Calculate average active time (simplified - based on login frequency)
        const loginLogs = await prisma.adminLog.count({
            where: {
                adminId,
                action: 'login',
                createdAt: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                },
            },
        });

        const avgActiveTime = loginLogs * 8; // Assume 8 hours per login session

        // Count active modules (unique modules accessed in last 30 days)
        const activeModulesCount = await prisma.adminLog.findMany({
            where: {
                adminId,
                module: { not: null },
                createdAt: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                },
            },
            distinct: ['module'],
            select: { module: true },
        });

        await prisma.admin.update({
            where: { id: adminId },
            data: {
                averageActiveTime: avgActiveTime,
                activeModules: activeModulesCount.length,
            },
        });
    } catch (error) {
        console.error('Failed to update admin activity stats:', error);
    }
};
