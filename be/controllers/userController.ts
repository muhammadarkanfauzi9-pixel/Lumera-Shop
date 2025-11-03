// File: be/controllers/userController.ts

import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
// GANTI DENGAN KUNCI RAHASIA YANG BERBEDA DARI KUNCI ADMIN!
const JWT_SECRET = 'lumera_user_secret_key_2024';

// 1. Fungsi untuk Pendaftaran Pembeli (User Registration)
export const registerUser = async (req: Request, res: Response) => {
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
    } catch (error: any) {
        if (error.code === 'P2002') { // Error unik (email sudah ada)
            return res.status(400).json({ message: 'Email already exists.' });
        }
        res.status(500).json({ message: 'Failed to register user.', error: error.message });
    }
};

// 2. Fungsi untuk Login Pembeli (User Login)
export const loginUser = async (req: Request, res: Response) => {
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
        const token = jwt.sign(
            { id: user.id, email: user.email }, // Payload sederhana untuk user
            JWT_SECRET,
            { expiresIn: '7d' } // Token berlaku 7 hari
        );

        // Kirim token dan data user (tanpa password)
        const { password: _, ...userData } = user;
        res.status(200).json({
            token,
            user: userData,
            message: 'Login successful'
        });

    } catch (error: any) {
        res.status(500).json({ message: 'Server error during login.', error: error.message });
    }
};

// 3. Update user profile
export const updateUserProfile = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const { name, email, phone } = req.body;

    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated.' });
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                name: name || undefined,
                email: email || undefined,
                phone: phone || undefined,
            },
        });

        const { password: _, ...userData } = updatedUser;
        res.status(200).json({
            message: 'Profile updated successfully',
            user: userData
        });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return res.status(400).json({ message: 'Email already exists.' });
        }
        res.status(500).json({ message: 'Failed to update profile.', error: error.message });
    }
};
