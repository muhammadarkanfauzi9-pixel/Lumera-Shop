// File: be/controllers/userController.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const prisma = new PrismaClient();
// GANTI DENGAN KUNCI RAHASIA YANG BERBEDA DARI KUNCI ADMIN!
const JWT_SECRET = 'lumera_user_secret_key_2024';
// 1. Fungsi untuk Pendaftaran Pembeli (User Registration)
export const registerUser = async (req, res) => {
    const { name, email, password, phone } = req.body;
    // Validasi input
    if (!name || !email || !password || !phone) {
        return res.status(400).json({ message: 'Name, email, password, and phone are required.' });
    }
    try {
        // Hashing password
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phone,
            },
        });
        // JANGAN kembalikan password
        const { password: _, ...userData } = user;
        res.status(201).json({ message: 'User registered successfully', user: userData });
    }
    catch (error) {
        if (error.code === 'P2002') { // Error unik (email sudah ada)
            return res.status(400).json({ message: 'Email already exists.' });
        }
        res.status(500).json({ message: 'Failed to register user.', error: error.message });
    }
};
// 2. Fungsi untuk Login Pembeli (User Login)
export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        // Bandingkan password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        // Generate JWT Token
        const token = jwt.sign({ id: user.id, email: user.email }, // Payload sederhana untuk user
        JWT_SECRET, { expiresIn: '7d' } // Token berlaku 7 hari
        );
        // Kirim token dan data user (tanpa password)
        const { password: _, ...userData } = user;
        // Set httpOnly cookie for user token
        res.cookie('userToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/',
        });
        res.status(200).json({
            token,
            user: userData,
            message: 'Login successful'
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error during login.', error: error.message });
    }
};
// 3. Update user profile
export const updateUserProfile = async (req, res) => {
    const userId = req.user?.id;
    const { name, email, phone, address } = req.body;
    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated.' });
    }
    try {
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (email !== undefined)
            updateData.email = email;
        if (phone !== undefined)
            updateData.phone = phone;
        if (address !== undefined)
            updateData.address = address;
        // Handle file upload
        if (req.file) {
            const imagePath = `/uploads/${req.file.filename}`;
            updateData.image = imagePath;
        }
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
        });
        const { password: _, ...userData } = updatedUser;
        res.status(200).json({
            message: 'Profile updated successfully',
            user: userData
        });
    }
    catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ message: 'Email already exists.' });
        }
        res.status(500).json({ message: 'Failed to update profile.', error: error.message });
    }
};
// 4. Get user balance (for QRIS simulation)
export const getUserBalance = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated.' });
    }
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { balance: true },
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json({ balance: user.balance });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch balance.', error: error.message });
    }
};
// 5. Update user balance (for QRIS simulation - deduct balance after payment)
export const updateUserBalance = async (req, res) => {
    const userId = req.user?.id;
    const { amount } = req.body;
    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated.' });
    }
    if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ message: 'Invalid amount.' });
    }
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { balance: true },
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        if (user.balance < amount) {
            return res.status(400).json({ message: 'Insufficient balance.' });
        }
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { balance: user.balance - amount },
        });
        res.status(200).json({
            message: 'Balance updated successfully',
            balance: updatedUser.balance
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to update balance.', error: error.message });
    }
};
//# sourceMappingURL=userController.js.map