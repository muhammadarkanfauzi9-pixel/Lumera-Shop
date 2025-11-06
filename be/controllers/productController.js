import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
// 1. Get all products (for user dashboard)
export const getProducts = async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch products.', error: error.message });
    }
};
// 2. Get product by ID
export const getProductById = async (req, res) => {
    const { id } = req.params;
    const productId = parseInt(id);
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
        res.status(200).json(product);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch product.', error: error.message });
    }
};
// 3. Create product (Admin only)
export const createProduct = async (req, res) => {
    const { name, description, price, stock, imageUrl } = req.body;
    if (!name || !price || stock === undefined) {
        return res.status(400).json({ message: 'Name, price, and stock are required.' });
    }
    try {
        const product = await prisma.product.create({
            data: {
                name: name,
                description: description,
                price: parseFloat(price),
                stock: parseInt(stock),
                imageUrl: imageUrl,
            },
        });
        res.status(201).json({ message: 'Product created successfully', product });
    }
    catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ message: 'Product name already exists.' });
        }
        res.status(500).json({ message: 'Failed to create product.', error: error.message });
    }
};
// 4. Update product (Admin only)
export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, description, price, stock, imageUrl, isAvailable } = req.body;
    const productId = parseInt(id);
    if (isNaN(productId)) {
        return res.status(400).json({ message: 'Invalid product ID.' });
    }
    const updateData = {};
    if (name !== undefined)
        updateData.name = name;
    if (description !== undefined)
        updateData.description = description;
    if (price !== undefined)
        updateData.price = parseFloat(price);
    if (stock !== undefined)
        updateData.stock = parseInt(stock);
    if (imageUrl !== undefined)
        updateData.imageUrl = imageUrl;
    if (isAvailable !== undefined)
        updateData.isAvailable = isAvailable;
    try {
        const product = await prisma.product.update({
            where: { id: productId },
            data: updateData,
        });
        res.status(200).json({ message: 'Product updated successfully', product });
    }
    catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Product not found.' });
        }
        res.status(500).json({ message: 'Failed to update product.', error: error.message });
    }
};
// 5. Delete product (Admin only)
export const deleteProduct = async (req, res) => {
    const { id } = req.params;
    const productId = parseInt(id);
    if (isNaN(productId)) {
        return res.status(400).json({ message: 'Invalid product ID.' });
    }
    try {
        await prisma.product.delete({
            where: { id: productId },
        });
        res.status(200).json({ message: 'Product deleted successfully' });
    }
    catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Product not found.' });
        }
        res.status(500).json({ message: 'Failed to delete product.', error: error.message });
    }
};
//# sourceMappingURL=productController.js.map