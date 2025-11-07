import { PrismaClient } from '@prisma/client';
import { writeAdminLog } from './adminController.js';
const prisma = new PrismaClient();
// Helper function to generate WhatsApp message
const generateWhatsAppMessage = (order) => {
    // Build order items details
    let itemsText = '';
    if (order.items && order.items.length > 0) {
        itemsText = '\n\nDetail Item:\n';
        order.items.forEach((item, index) => {
            itemsText += `${index + 1}. ${item.product.name}\n   Jumlah: ${item.quantity} x Rp ${item.product.price.toLocaleString('id-ID')} = Rp ${(item.quantity * item.product.price).toLocaleString('id-ID')}\n`;
        });
    }
    const message = `Halo! Terima kasih telah memesan di Lumera Shop.\n\nDetail Pesanan:\nID Order: ${order.id}${itemsText}\nTotal: Rp ${order.totalAmount.toLocaleString('id-ID')}\nMetode Pembayaran: ${order.paymentMethod}\nStatus: ${order.paymentStatus}\n\nSilakan konfirmasi pembayaran jika belum. Terima kasih!`;
    return encodeURIComponent(message);
};
// 1. Create order (User only)
export const createOrder = async (req, res) => {
    const { items, paymentMethod } = req.body;
    const userId = req.user?.id; // Assuming user is set by auth middleware
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
                // For QRIS payments we mark the order as processed immediately
                orderStatus: paymentMethod === 'QRIS' ? 'PROCESSED' : 'PENDING',
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
        const whatsappUrl = `https://wa.me/6281239450638?text=${generateWhatsAppMessage(order)}`; // Dynamic WhatsApp number
        res.status(201).json({
            message: 'Order created successfully',
            order,
            whatsappUrl
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to create order.', error: error.message });
    }
};
// 2. Get user orders (User only)
export const getUserOrders = async (req, res) => {
    const userId = req.user?.id;
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
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch orders.', error: error.message });
    }
};
// 3. Get all orders (Admin only)
export const getAllOrders = async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch orders.', error: error.message });
    }
};
// 4. Update payment status (Admin only for CASH orders)
export const updatePaymentStatus = async (req, res) => {
    const { id } = req.params;
    const { paymentStatus } = req.body;
    if (!paymentStatus || !['PENDING', 'COMPLETED', 'CANCELED'].includes(paymentStatus)) {
        return res.status(400).json({ message: 'Invalid payment status.' });
    }
    const orderId = parseInt(id);
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
                paymentStatus: paymentStatus,
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
        // Write admin log if available
        try {
            const adminId = req.admin?.id;
            if (adminId) {
                await writeAdminLog(adminId, 'UPDATE_PAYMENT_STATUS', 'ORDERS', `Order ${orderId} paymentStatus -> ${paymentStatus}`, req.ip, req.headers['user-agent'] || undefined);
            }
        }
        catch (e) {
            console.error('Failed to write admin log for payment update', e);
        }
        res.status(200).json({ message: 'Payment status updated successfully', order: updatedOrder });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to update payment status.', error: error.message });
    }
};
// 5. Cancel order (Auto or manual)
export const cancelOrder = async (req, res) => {
    const { id } = req.params;
    const orderId = parseInt(id);
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
        // Write admin log if available
        try {
            const adminId = req.admin?.id;
            if (adminId) {
                await writeAdminLog(adminId, 'CANCEL_ORDER', 'ORDERS', `Canceled order ${orderId}`, req.ip, req.headers['user-agent'] || undefined);
            }
        }
        catch (e) {
            console.error('Failed to write admin log for order cancel', e);
        }
        res.status(200).json({ message: 'Order canceled successfully', order: updatedOrder });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to cancel order.', error: error.message });
    }
};
//# sourceMappingURL=orderController.js.map