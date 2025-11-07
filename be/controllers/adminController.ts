import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import type { AuthRequest } from '../middleware/auth.js';

const prisma = new PrismaClient();

// Utility: write admin activity log. Non-fatal on failure.
export const writeAdminLog = async (adminId: number, action: string, module?: string, description?: string, ipAddress?: string, userAgent?: string) => {
    try {
        await prisma.adminLog.create({
            data: {
                adminId,
                action,
                module: module ?? null,
                description: description ?? '',
                ipAddress: ipAddress ?? null,
                userAgent: userAgent ?? null,
            }
        });
    } catch (err) {
        console.error('[AdminLog] Failed to write admin log:', err);
    }
};

// 1. Get admin stats
export const getAdminStats = async (req: Request, res: Response) => {
    try {
        const totalUsers = await prisma.user.count();
        const totalProducts = await prisma.product.count();
        const totalOrders = await prisma.order.count();
        const totalRevenueResult = await prisma.order.aggregate({
            _sum: {
                totalAmount: true,
            },
            where: {
                paymentStatus: 'COMPLETED',
            },
        });
        const totalRevenue = totalRevenueResult._sum.totalAmount || 0;

        // Today's sales data (matching getTodaySales logic)
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

        // New orders today (matching getNewOrdersToday logic)
        const newOrdersToday = await prisma.order.count({
            where: {
                orderDate: {
                    gte: today,
                    lt: tomorrow,
                },
            },
        });

        // Monthly sales for last 12 months
        const monthlySales = [];
        for (let i = 11; i >= 0; i--) {
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
                sales: monthResult._sum?.totalAmount || 0,
            });
        }

        // Rating stats: overall average rating and top-rated products
        let overallAverageRating = 0;
        let totalRatings = 0;
        let topRatedProducts: any[] = [];
        try {
            const ratingAgg = await prisma.rating.aggregate({
                _avg: { value: true },
                _count: { _all: true }
            });

            overallAverageRating = ratingAgg._avg?.value || 0;
            totalRatings = ratingAgg._count?._all || 0;

            // Top-rated products (by average rating, min 1 rating)
            const topRated = await prisma.rating.groupBy({
                by: ['productId'],
                _avg: { value: true },
                _count: { _all: true },
                orderBy: { _avg: { value: 'desc' } },
                where: {},
                take: 5,
            });

            topRatedProducts = await Promise.all(topRated.map(async (t: any) => {
                const p = await prisma.product.findUnique({ where: { id: t.productId }, select: { name: true } });
                return {
                    productId: t.productId,
                    name: p?.name || 'Unknown',
                    average: Math.round((t._avg?.value || 0) * 100) / 100,
                    ratingsCount: t._count?._all || 0,
                };
            }));
        } catch (ratingErr: any) {
            console.error('[getAdminStats] Rating aggregation failed, returning defaults:', ratingErr?.message ?? ratingErr);
            overallAverageRating = 0;
            totalRatings = 0;
            topRatedProducts = [];
        }

        res.status(200).json({
            totalUsers,
            totalProducts,
            totalOrders,
            totalRevenue,
            todaySales,
            newOrdersToday,
            monthlySales,
            ratingStats: {
                overallAverageRating: Math.round((overallAverageRating + Number.EPSILON) * 100) / 100,
                totalRatings,
                topRatedProducts,
            },
        });
    } catch (error: any) {
        console.error('[getAdminStats] Error fetching admin stats:', error);
        res.status(500).json({ message: 'Failed to fetch admin stats.', error: error.message });
    }
};

// 2. Get admin profile
export const getAdminProfile = async (req: AuthRequest, res: Response) => {
    try {
        const admin = req.admin;
        if (!admin) {
            return res.status(401).json({ message: 'Unauthorized.' });
        }
        const adminData = await prisma.admin.findUnique({
            where: { id: admin.id },
            select: { id: true, name: true, email: true, role: true, profileImageUrl: true, passwordChanges: true, lastPasswordChange: true, averageActiveTime: true, activeModules: true, createdAt: true, updatedAt: true },
        });
        if (!adminData) {
            return res.status(404).json({ message: 'Admin not found.' });
        }

        // Fetch admin logs for dynamic calculations
        const logs = await prisma.adminLog.findMany({
            where: { adminId: admin.id },
            select: { module: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
        });

        // Calculate active modules (distinct modules accessed)
        const activeModules = new Set(logs.map(log => log.module)).size;

        // Calculate last accessed modules (latest access per module, top 5)
        const moduleMap = new Map<string, Date>();
        logs.forEach(log => {
            if (log.module && !moduleMap.has(log.module)) {
                moduleMap.set(log.module, log.createdAt);
            }
        });
        const lastAccessedModules = Array.from(moduleMap.entries())
            .map(([module, createdAt]) => ({ module, createdAt }))
            .slice(0, 5);

        // Calculate average active time (hours per day based on log activity)
        let averageActiveTime = adminData.averageActiveTime;
        if (logs.length > 0) {
            const firstLog = logs[logs.length - 1].createdAt;
            const lastLog = logs[0].createdAt;
            const daysDiff = Math.max((lastLog.getTime() - firstLog.getTime()) / (1000 * 60 * 60 * 24), 1);
            averageActiveTime = logs.length / daysDiff; // logs per day, approximate as hours
        }

        // Get recent logs (last 10)
        const recentLogs = logs.slice(0, 10).map(log => ({
            action: 'Access',
            module: log.module,
            description: `Accessed ${log.module} module`,
            createdAt: log.createdAt.toISOString(),
        }));

        res.status(200).json({
            admin: {
                id: adminData.id,
                name: adminData.name,
                email: adminData.email,
                role: adminData.role,
                profileImageUrl: adminData.profileImageUrl,
                passwordChanges: adminData.passwordChanges,
                lastPasswordChange: adminData.lastPasswordChange,
                averageActiveTime: Math.round(averageActiveTime * 100) / 100, // Round to 2 decimals
                activeModules,
                createdAt: adminData.createdAt,
                updatedAt: adminData.updatedAt,
            },
            recentLogs,
            lastAccessedModules: lastAccessedModules.map(item => ({
                module: item.module,
                createdAt: item.createdAt.toISOString(),
            })),
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch admin profile.', error: error.message });
    }
};

// 3. Update admin profile
export const updateAdminProfile = async (req: AuthRequest, res: Response) => {
    try {
        const admin = req.admin;
        if (!admin) {
            return res.status(401).json({ message: 'Unauthorized.' });
        }
        const { name, email, profileImageUrl } = req.body;
        const updatedAdmin = await prisma.admin.update({
            where: { id: admin.id },
            data: { name, email, profileImageUrl },
            select: { id: true, name: true, email: true, profileImageUrl: true },
        });
        // Log admin profile update
        try {
            await writeAdminLog(admin.id, 'UPDATE_PROFILE', 'PROFILE', `Updated profile fields: ${Object.keys({name, email, profileImageUrl}).filter(k => (req.body as any)[k] !== undefined).join(', ')}`, req.ip, (req.headers['user-agent'] as string) || undefined);
        } catch (e) {
            console.error('Failed to write admin log for profile update', e);
        }
        res.status(200).json(updatedAdmin);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to update admin profile.', error: error.message });
    }
};

// 4. Update admin password
export const updateAdminPassword = async (req: AuthRequest, res: Response) => {
    try {
        const admin = req.admin;
        if (!admin) {
            return res.status(401).json({ message: 'Unauthorized.' });
        }
        const { currentPassword, newPassword } = req.body;
        const user = await prisma.user.findUnique({
            where: { id: admin.id },
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect.' });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: admin.id },
            data: { password: hashedPassword },
        });
        // Log password change
        try {
            await writeAdminLog(admin.id, 'CHANGE_PASSWORD', 'PROFILE', 'Admin changed password', req.ip, (req.headers['user-agent'] as string) || undefined);
        } catch (e) {
            console.error('Failed to write admin log for password change', e);
        }

        res.status(200).json({ message: 'Password updated successfully.' });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to update admin password.', error: error.message });
    }
};

// 9. Get today's sales data
export const getTodaySales = async (req: Request, res: Response) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Total sales today
        const totalSalesResult = await prisma.order.aggregate({
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
        const totalSales = totalSalesResult._sum.totalAmount || 0;

        // Total orders today
        const totalOrders = await prisma.order.count({
            where: {
                orderDate: {
                    gte: today,
                    lt: tomorrow,
                },
            },
        });

        // Average order value
        const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

        // Top products today
        const topProducts = await prisma.orderItem.groupBy({
            by: ['productId'],
            _sum: {
                quantity: true,
                subtotal: true,
            },
            where: {
                order: {
                    paymentStatus: 'COMPLETED',
                    orderDate: {
                        gte: today,
                        lt: tomorrow,
                    },
                },
            },
            orderBy: {
                _sum: {
                    subtotal: 'desc',
                },
            },
            take: 5,
        });

        // Get product details for top products
        const topProductsWithDetails = await Promise.all(
            topProducts.map(async (item) => {
                const product = await prisma.product.findUnique({
                    where: { id: item.productId },
                    select: { name: true },
                });
                return {
                    id: item.productId,
                    name: product?.name || 'Unknown Product',
                    sales: item._sum.quantity || 0,
                    revenue: item._sum.subtotal || 0,
                };
            })
        );

        // Hourly sales (simplified - group by hour)
        const hourlySales = [];
        for (let hour = 0; hour < 24; hour++) {
            const hourStart = new Date(today);
            hourStart.setHours(hour, 0, 0, 0);
            const hourEnd = new Date(hourStart);
            hourEnd.setHours(hour + 1, 0, 0, 0);

            const hourResult = await prisma.order.aggregate({
                _sum: {
                    totalAmount: true,
                },
                where: {
                    paymentStatus: 'COMPLETED',
                    orderDate: {
                        gte: hourStart,
                        lt: hourEnd,
                    },
                },
            });

            hourlySales.push({
                hour,
                sales: hourResult._sum.totalAmount || 0,
            });
        }

        // Recent orders today
        const recentOrders = await prisma.order.findMany({
            where: {
                orderDate: {
                    gte: today,
                    lt: tomorrow,
                },
            },
            include: {
                user: {
                    select: { name: true, email: true },
                },
            },
            orderBy: { orderDate: 'desc' },
            take: 10,
        });

        const formattedRecentOrders = recentOrders.map(order => ({
            id: order.id,
            customerName: order.user.name,
            amount: order.totalAmount,
            time: order.orderDate.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit'
            }),
        }));

        res.status(200).json({
            totalSales,
            totalOrders,
            averageOrderValue,
            topProducts: topProductsWithDetails,
            hourlySales,
            recentOrders: formattedRecentOrders,
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch today\'s sales data.', error: error.message });
    }
};

// 10. Get new orders today
export const getNewOrdersToday = async (req: Request, res: Response) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const orders = await prisma.order.findMany({
            where: {
                orderDate: {
                    gte: today,
                    lt: tomorrow,
                },
            },
            include: {
                user: {
                    select: { name: true, email: true, phone: true },
                },
                items: {
                    include: {
                        product: true,
                    },
                },
            },
            orderBy: { orderDate: 'desc' },
        });

        const formattedOrders = orders.map(order => ({
            id: order.id,
            customerName: order.user.name,
            customerEmail: order.user.email,
            customerPhone: order.user.phone,
            totalAmount: order.totalAmount,
            orderDate: order.orderDate.toISOString(),
            paymentStatus: order.paymentStatus,
            orderStatus: order.orderStatus,
            deliveryAddress: 'Alamat pengiriman belum diimplementasi', // Placeholder
            items: order.items.map(item => ({
                id: item.id,
                productName: item.product.name,
                quantity: item.quantity,
                price: item.product.price,
            })),
        }));

        res.status(200).json(formattedOrders);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch new orders today.', error: error.message });
    }
};

// 11. Get total revenue data
export const getTotalRevenue = async (req: Request, res: Response) => {
    try {
        // Total revenue all time
        const totalRevenueResult = await prisma.order.aggregate({
            _sum: {
                totalAmount: true,
            },
            where: {
                paymentStatus: 'COMPLETED',
            },
        });
        const totalRevenue = totalRevenueResult._sum.totalAmount || 0;

        // Monthly revenue for last 12 months
        const monthlyRevenue = [];
        for (let i = 11; i >= 0; i--) {
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
            const prevMonthStart = new Date(monthStart);
            prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);

            const prevMonthResult = await prisma.order.aggregate({
                _sum: {
                    totalAmount: true,
                },
                where: {
                    paymentStatus: 'COMPLETED',
                    orderDate: {
                        gte: prevMonthStart,
                        lt: monthStart,
                    },
                },
            });

            const current = monthResult._sum.totalAmount || 0;
            const previous = prevMonthResult._sum.totalAmount || 0;
            const growth = previous > 0 ? ((current - previous) / previous) * 100 : 0;

            monthlyRevenue.push({
                month: monthName,
                revenue: current,
                growth: Math.round(growth * 100) / 100,
            });
        }

        // Yearly revenue for last 5 years
        const yearlyRevenue = [];
        for (let i = 4; i >= 0; i--) {
            const yearStart = new Date();
            yearStart.setFullYear(yearStart.getFullYear() - i, 0, 1);
            yearStart.setHours(0, 0, 0, 0);

            const yearEnd = new Date(yearStart);
            yearEnd.setFullYear(yearEnd.getFullYear() + 1);

            const yearResult = await prisma.order.aggregate({
                _sum: {
                    totalAmount: true,
                },
                where: {
                    paymentStatus: 'COMPLETED',
                    orderDate: {
                        gte: yearStart,
                        lt: yearEnd,
                    },
                },
            });

            yearlyRevenue.push({
                year: yearStart.getFullYear().toString(),
                revenue: yearResult._sum.totalAmount || 0,
            });
        }

        // Top revenue products (all time)
        const topRevenueProducts = await prisma.orderItem.groupBy({
            by: ['productId'],
            _sum: {
                subtotal: true,
            },
            where: {
                order: {
                    paymentStatus: 'COMPLETED',
                },
            },
            orderBy: {
                _sum: {
                    subtotal: 'desc',
                },
            },
            take: 10,
        });

        const totalRevenueForPercentage = totalRevenue;

        const topProductsWithDetails = await Promise.all(
            topRevenueProducts.map(async (item) => {
                const product = await prisma.product.findUnique({
                    where: { id: item.productId },
                    select: { name: true },
                });
                const revenue = item._sum.subtotal || 0;
                return {
                    id: item.productId,
                    name: product?.name || 'Unknown Product',
                    revenue,
                    percentage: totalRevenueForPercentage > 0 ? (revenue / totalRevenueForPercentage) * 100 : 0,
                };
            })
        );

        // Revenue by category (simplified - assuming categories from product names)
        const revenueByCategory = [
            { category: 'Makanan Asin', revenue: totalRevenue * 0.6, percentage: 60 },
            { category: 'Dessert', revenue: totalRevenue * 0.4, percentage: 40 },
        ];

        res.status(200).json({
            totalRevenue,
            monthlyRevenue,
            yearlyRevenue,
            topRevenueProducts: topProductsWithDetails,
            revenueByCategory,
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch total revenue data.', error: error.message });
    }
};

// Types for ratings with product info
interface RatingWithProduct {
    id: number;
    productId: number;
    userId: number | null;
    value: number;
    comment: string | null;
    createdAt: Date;
    productName: string;
}

interface UserInfo {
    id: number;
    name: string;
    email: string;
}

// 12. Get reviews data
export const getReviews = async (req: Request, res: Response) => {
    try {
        // Fetch all ratings with comments and their associated products and users
        const allRatings = await prisma.$queryRaw<RatingWithProduct[]>`
            SELECT r.*, p.name as "productName"
            FROM "Rating" r
            INNER JOIN "Product" p ON r."productId" = p.id
            WHERE r.comment IS NOT NULL
            ORDER BY r."createdAt" DESC
        `;

        // Fetch user details in parallel for performance
        const userIds = allRatings.filter(r => r.userId !== null).map(r => r.userId!);
        const users = userIds.length > 0 ? await prisma.user.findMany({
            where: {
                id: { in: userIds }
            },
            select: {
                id: true,
                name: true,
                email: true
            }
        }) : [];

        const userMap = new Map(users.map(u => [u.id, u] as [number, UserInfo]));

        // Calculate stats
        const totalReviews = allRatings.length;
        const totalRatingValue = allRatings.reduce((sum: number, r: RatingWithProduct) => sum + r.value, 0);
        const averageRating = totalReviews > 0 ? totalRatingValue / totalReviews : 0;

        // Calculate rating distribution
        const ratingDistribution = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
        };
        
        allRatings.forEach((rating: RatingWithProduct) => {
            ratingDistribution[rating.value as 1|2|3|4|5]++;
        });

        // Transform ratings into review objects
        const reviews = allRatings.map((rating: RatingWithProduct) => ({
            id: rating.id,
            customerName: rating.userId ? userMap.get(rating.userId)?.name || 'Anonymous' : 'Anonymous',
            customerEmail: rating.userId ? userMap.get(rating.userId)?.email || null : null,
            productName: rating.productName,
            productId: rating.productId,
            rating: rating.value,
            comment: rating.comment,
            createdAt: rating.createdAt.toISOString(),
            isVerified: rating.userId !== null,  // Consider verified if user is logged in
            helpful: 0, // Placeholder for future feature
            notHelpful: 0 // Placeholder for future feature
        }));

        res.status(200).json({
            stats: {
                totalReviews,
                averageRating: Math.round(averageRating * 10) / 10,
                ratingDistribution,
                recentReviews: reviews.slice(0, 5) // Get 5 most recent reviews
            },
            reviews
        });
    } catch (error: any) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Failed to fetch reviews data.', error: error.message });
    }
};

// 13. Get admin logs / riwayat lengkap (supports pagination and filters)
export const getAdminLogs = async (req: AuthRequest, res: Response) => {
    try {
        const admin = req.admin;
        if (!admin) {
            return res.status(401).json({ message: 'Unauthorized.' });
        }

        const page = Math.max(parseInt((req.query.page as string) || '1', 10), 1);
        const limit = Math.min(parseInt((req.query.limit as string) || '20', 10), 100);
        const skip = (page - 1) * limit;

        const moduleFilter = req.query.module as string | undefined;
        const actionFilter = req.query.action as string | undefined;
        const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
        const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

        // Build dynamic where clause
        const where: any = { adminId: admin.id };
        if (moduleFilter) where.module = { contains: moduleFilter, mode: 'insensitive' };
        if (actionFilter) where.action = { contains: actionFilter, mode: 'insensitive' };
        if (startDate || endDate) {
            where.createdAt = {} as any;
            if (startDate) where.createdAt.gte = startDate;
            if (endDate) where.createdAt.lte = endDate;
        }

        const total = await prisma.adminLog.count({ where });

        const logs = await prisma.adminLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        });

        const formatted = logs.map(l => ({
            id: l.id,
            action: l.action,
            module: l.module,
            description: l.description,
            ipAddress: l.ipAddress,
            userAgent: l.userAgent,
            createdAt: l.createdAt.toISOString(),
        }));

        res.status(200).json({
            total,
            page,
            limit,
            logs: formatted,
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch admin logs.', error: error.message });
    }
};
