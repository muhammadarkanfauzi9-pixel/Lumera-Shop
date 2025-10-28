// File: be/controllers/adminController.ts

import express from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = 'YOUR_SUPER_SECRET_KEY'; // GANTI DENGAN KUNCI RAHASIA YANG LEBIH KUAT

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