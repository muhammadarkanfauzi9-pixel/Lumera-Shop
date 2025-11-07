import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import type { AuthRequest } from '../middleware/auth.js';
import { writeAdminLog } from './adminController.js';
import multer from 'multer';
import path from 'path';

const prisma = new PrismaClient();

interface Rating {
    id: number;
    productId: number;
    userId: number | null;
    value: number;
    comment: string | null;
    createdAt: Date;
}

interface RatingWithProduct extends Rating {
    product: {
        name: string;
    };
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), '../fe/public/uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// 1. Get all products (for user dashboard)
export const getProducts = async (req: Request, res: Response) => {
    try {
        const products = await prisma.product.findMany({
            where: { isAvailable: true },
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                stock: true,
                imageUrl: true,
            },
        });
        res.status(200).json(products);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch products.', error: error.message });
    }
};

// 2. Get product by ID
export const getProductById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const productId = parseInt(id as string);
    if (isNaN(productId)) {
        return res.status(400).json({ message: 'Invalid product ID.' });
    }
    try {
        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                stock: true,
                imageUrl: true,
            },
        });
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        // compute rating aggregates (guard in case Rating model/table doesn't exist yet)
        try {
            const ratingAgg = await prisma.rating.aggregate({
                where: { productId },
                _avg: { value: true },
                _count: { _all: true }
            });

            const avgRating = ratingAgg._avg?.value || 0;
            const ratingCount = ratingAgg._count?._all || 0;

            res.status(200).json({ ...product, averageRating: Math.round((avgRating + Number.EPSILON) * 100) / 100, ratingCount });
        } catch (ratingErr: any) {
            console.error('[getProductById] Rating aggregation failed, returning product without ratings:', ratingErr?.message ?? ratingErr);
            res.status(200).json({ ...product, averageRating: 0, ratingCount: 0 });
        }
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch product.', error: error.message });
    }
};

// Submit a rating for a product (public)
export const submitRating = async (req: Request, res: Response) => {
    const { id } = req.params;
    const productId = parseInt(id as string);
    if (isNaN(productId)) return res.status(400).json({ message: 'Invalid product ID.' });

    const { value, comment } = req.body;
    const ratingValue = parseInt(value);
    if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
        return res.status(400).json({ message: 'Rating value must be between 1 and 5.' });
    }

    try {
        // optional: if user is authenticated, attach user id
        const userId = (req as any).user?.id || undefined;

        const rating = await prisma.rating.create({
            data: {
                productId,
                userId,
                value: ratingValue,
                comment: comment || undefined,
            }
        });

        // respond with new aggregates (guard if rating table missing)
        try {
            const ratingAgg = await prisma.rating.aggregate({
                where: { productId },
                _avg: { value: true },
                _count: { _all: true }
            });
            const avgRating = ratingAgg._avg?.value || 0;
            const ratingCount = ratingAgg._count?._all || 0;
            res.status(201).json({ message: 'Rating submitted', rating, averageRating: Math.round((avgRating + Number.EPSILON) * 100) / 100, ratingCount });
        } catch (ratingErr: any) {
            console.error('[submitRating] Post-rating aggregation failed, returning created rating only:', ratingErr?.message ?? ratingErr);
            res.status(201).json({ message: 'Rating submitted', rating, averageRating: 0, ratingCount: 0 });
        }
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to submit rating.', error: error.message });
    }
};

// Get reviews for a product
export const getProductReviews = async (req: Request, res: Response) => {
    const { id } = req.params;
    const productId = parseInt(id as string);
    if (isNaN(productId)) {
        return res.status(400).json({ message: 'Invalid product ID.' });
    }

    try {
        // Get all ratings with comments for this product
        const productReviews = await prisma.$queryRaw<Array<Rating & { userName: string | null }>>`
            SELECT r.*, u.name as "userName"
            FROM "Rating" r
            LEFT JOIN "User" u ON r."userId" = u.id
            WHERE r."productId" = ${productId}
            AND r.comment IS NOT NULL
            ORDER BY r."createdAt" DESC
        `;

        // Transform into reviews format
        const reviews = productReviews.map(r => ({
            id: r.id,
            customerName: r.userName || 'Anonymous',
            rating: r.value,
            comment: r.comment,
            createdAt: r.createdAt.toISOString(),
            isVerified: r.userId !== null
        }));

        res.status(200).json({ reviews });
    } catch (error: any) {
        console.error('[getProductReviews] Error:', error);
        res.status(500).json({ message: 'Failed to fetch product reviews.', error: error.message });
    }
};

// 3. Create product (Admin only)
export const createProduct = [
    upload.single('image'),
    async (req: Request, res: Response) => {
        const { name, description, price, stock } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        if (!name || !price || stock === undefined) {
            return res.status(400).json({ message: 'Name, price, and stock are required.' });
        }

        try {
            const product = await prisma.product.create({
                data: {
                    name: name as string,
                    description: description as string,
                    price: parseFloat(price as string),
                    stock: parseInt(stock as string),
                    imageUrl: imageUrl as string,
                },
            });
            // Write admin log if available
            try {
                const adminId = (req as AuthRequest).admin?.id;
                if (adminId) {
                    await writeAdminLog(adminId, 'CREATE_PRODUCT', 'PRODUCTS', `Created product ${product.name}`, req.ip, (req.headers['user-agent'] as string) || undefined);
                }
            } catch (e) {
                console.error('Failed to write admin log for product create', e);
            }
            res.status(201).json({ message: 'Product created successfully', product });
        } catch (error: any) {
            if (error.code === 'P2002') {
                return res.status(400).json({ message: 'Product name already exists.' });
            }
            res.status(500).json({ message: 'Failed to create product.', error: error.message });
        }
    }
];

// 4. Update product (Admin only)
export const updateProduct = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, price, stock, imageUrl, isAvailable } = req.body;

    const productId = parseInt(id as string);
    if (isNaN(productId)) {
        return res.status(400).json({ message: 'Invalid product ID.' });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name as string;
    if (description !== undefined) updateData.description = description as string;
    if (price !== undefined) updateData.price = parseFloat(price as string);
    if (stock !== undefined) updateData.stock = parseInt(stock as string);
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl as string;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;

    try {
        const product = await prisma.product.update({
            where: { id: productId },
            data: updateData,
        });
        // Write admin log if available
        try {
            const adminId = (req as AuthRequest).admin?.id;
            if (adminId) {
                const changed = Object.keys(updateData).join(', ');
                await writeAdminLog(adminId, 'UPDATE_PRODUCT', 'PRODUCTS', `Updated product ${product.name} fields: ${changed}`, req.ip, (req.headers['user-agent'] as string) || undefined);
            }
        } catch (e) {
            console.error('Failed to write admin log for product update', e);
        }
        res.status(200).json({ message: 'Product updated successfully', product });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Product not found.' });
        }
        res.status(500).json({ message: 'Failed to update product.', error: error.message });
    }
};

// 5. Delete product (Admin only)
export const deleteProduct = async (req: Request, res: Response) => {
    const { id } = req.params;
    const productId = parseInt(id as string);
    if (isNaN(productId)) {
        return res.status(400).json({ message: 'Invalid product ID.' });
    }
    try {
        await prisma.product.delete({
            where: { id: productId },
        });
        // Write admin log if available
        try {
            const adminId = (req as AuthRequest).admin?.id;
            if (adminId) {
                await writeAdminLog(adminId, 'DELETE_PRODUCT', 'PRODUCTS', `Deleted product id=${productId}`, req.ip, (req.headers['user-agent'] as string) || undefined);
            }
        } catch (e) {
            console.error('Failed to write admin log for product delete', e);
        }
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Product not found.' });
        }
        res.status(500).json({ message: 'Failed to delete product.', error: error.message });
    }
};
