import { Router } from 'express';
import { createOrder, getUserOrders, getAllOrders, updatePaymentStatus, cancelOrder } from '../controllers/orderController';
import { verifyToken, checkRole, verifyUserToken } from '../middleware/auth';
const router = Router();
// POST /api/orders - Create order (User only)
router.post('/', verifyUserToken, createOrder);
// GET /api/orders - Get user orders (User only)
router.get('/', verifyUserToken, getUserOrders);
// GET /api/orders/admin - Get all orders (Admin only)
router.get('/admin', verifyToken, checkRole(['SuperAdmin', 'Editor']), getAllOrders);
// PUT /api/orders/:id/payment - Update payment status (Admin only)
router.put('/:id/payment', verifyToken, checkRole(['SuperAdmin', 'Editor']), updatePaymentStatus);
// DELETE /api/orders/:id - Cancel order (Admin only)
router.delete('/:id', verifyToken, checkRole(['SuperAdmin', 'Editor']), cancelOrder);
export default router;
//# sourceMappingURL=orderRoutes.js.map