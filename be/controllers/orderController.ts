import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to generate WhatsApp message
const generateWhatsAppMessage = (order: any) => {
    const message = `Halo! Terima kasih telah memesan di Lumera Shop.\n\nDetail Pesanan:\nID Order: ${order.id}\nTotal: Rp ${order.totalAmount.toLocaleString('id-ID')}\nMetode Pembayaran: ${order.paymentMethod}\nStatus: ${order.paymentStatus}\n\nSilakan konfirmasi pembayaran jika belum. Terima kasih!`;
    return encodeURIComponent(message);
};

// 1. Create order (User only)
export const createOrder = async (req: Request, res: Response) => {
    const { items, paymentMethod } = req.body;
    const userId = (req as any).user?.id; // Assuming user is set by auth middleware

    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated.' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Order must have at least one item.' });
    }

    if (!paymentMethod || !['QRIS', 'CASH'].includes(paymentMethod)) {
        return res.status(400).json({ message: 'Invalid payment method.' });
    }

    try {
        // Calculate total and check stock
        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await prisma.product.findUnique({
                where: { id: item.productId },
            });

            if (!product) {
                return res.status(404).json({ message: `Product with ID ${item.productId} not found.` });
            }

            if (!product.isAvailable || product.stock < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for product ${product.name}.` });
            }

            const subtotal = product.price * item.quantity;
            totalAmount += subtotal;

            orderItems.push({
                productId: item.productId,
                quantity: item.quantity,
                subtotal,
            });
        }

        // Create order with expiration time (10 minutes from now)
        const expirationTime = new Date(Date.now() + 10 * 60 * 1000);

        const order = await prisma.order.create({
            data: {
                userId,
                totalAmount,
                paymentMethod,
                paymentStatus: paymentMethod === 'QRIS' ? 'COMPLETED' : 'PENDING',
                orderStatus: 'PENDING',
                expirationTime,
                items: {
                    create: orderItems,
                },
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        // Update product stock
        for (const item of orderItems) {
            await prisma.product.update({
                where: { id: item.productId },
                data: {
                    stock: {
                        decrement: item.quantity,
                    },
                },
            });
        }

        // Generate WhatsApp link for the order
        const whatsappUrl = `https://wa.me/?text=${generateWhatsAppMessage(order)}`; // Dynamic WhatsApp number

        res.status(201).json({
            message: 'Order created successfully',
            order,
            whatsappUrl
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to create order.', error: error.message });
    }
};

// 2. Get user orders (User only)
export const getUserOrders = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated.' });
    }

    try {
        const orders = await prisma.order.findMany({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
            orderBy: { orderDate: 'desc' },
        });
        res.status(200).json(orders);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch orders.', error: error.message });
    }
};

// 3. Get all orders (Admin only)
export const getAllOrders = async (req: Request, res: Response) => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                user: {
                    select: { id: true, name: true, email: true, phone: true },
                },
                items: {
                    include: {
                        product: true,
                    },
                },
            },
            orderBy: { orderDate: 'desc' },
        });
        res.status(200).json(orders);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch orders.', error: error.message });
    }
};

// 4. Update payment status (Admin only for CASH orders)
export const updatePaymentStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    if (!paymentStatus || !['PENDING', 'COMPLETED', 'CANCELED'].includes(paymentStatus as string)) {
        return res.status(400).json({ message: 'Invalid payment status.' });
    }

    const orderId = parseInt(id as string);
    if (isNaN(orderId)) {
        return res.status(400).json({ message: 'Invalid order ID.' });
    }

    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true },
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        if (order.paymentMethod === 'QRIS' && paymentStatus !== 'COMPLETED') {
            return res.status(400).json({ message: 'QRIS orders can only be marked as completed.' });
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                paymentStatus: paymentStatus as any,
                orderStatus: paymentStatus === 'COMPLETED' ? 'PROCESSED' : order.orderStatus,
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        res.status(200).json({ message: 'Payment status updated successfully', order: updatedOrder });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to update payment status.', error: error.message });
    }
};

// 5. Cancel order (Auto or manual)
export const cancelOrder = async (req: Request, res: Response) => {
    const { id } = req.params;
    const orderId = parseInt(id as string);
    if (isNaN(orderId)) {
        return res.status(400).json({ message: 'Invalid order ID.' });
    }

    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true },
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        // Restore stock
        for (const item of order.items) {
            await prisma.product.update({
                where: { id: item.productId },
                data: {
                    stock: {
                        increment: item.quantity,
                    },
                },
            });
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                paymentStatus: 'CANCELED',
                orderStatus: 'CANCELED',
            },
        });

        res.status(200).json({ message: 'Order canceled successfully', order: updatedOrder });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to cancel order.', error: error.message });
    }
};
