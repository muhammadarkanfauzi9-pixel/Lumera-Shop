import { Router } from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/productController';
import { verifyToken, checkRole } from '../middleware/auth';
const router = Router();
// GET /api/products - Get all products (public for users)
router.get('/', getProducts);
// GET /api/products/:id - Get product by ID (public for users)
router.get('/:id', getProductById);
// POST /api/products - Create product (Admin only)
router.post('/', verifyToken, checkRole(['SuperAdmin', 'Editor']), createProduct);
// PUT /api/products/:id - Update product (Admin only)
router.put('/:id', verifyToken, checkRole(['SuperAdmin', 'Editor']), updateProduct);
// DELETE /api/products/:id - Delete product (Admin only)
router.delete('/:id', verifyToken, checkRole(['SuperAdmin', 'Editor']), deleteProduct);
export default router;
//# sourceMappingURL=productRoutes.js.map