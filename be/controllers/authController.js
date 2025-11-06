// File: be/controllers/authController.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const prisma = new PrismaClient();
// JWT Secrets
const ADMIN_JWT_SECRET = 'lumera_admin_secret_key_2024';
const USER_JWT_SECRET = 'lumera_user_secret_key_2024';
// Unified Login Function
export const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }
    try {
        // First, try to find admin
        let admin = await prisma.admin.findUnique({ where: { email } });
        let isAdmin = true;
        if (!admin) {
            // If not admin, try user
            let user = await prisma.user.findUnique({ where: { email } });
            isAdmin = false;
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials.' });
            }
            // Check password for user
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid credentials.' });
            }
            // Generate user token
            const token = jwt.sign({ id: user.id, email: user.email }, USER_JWT_SECRET, { expiresIn: '7d' });
            const { password: _, ...userData } = user;
            res.status(200).json({
                token,
                user: { ...userData, type: 'user' },
                message: 'Login successful'
            });
            return;
        }
        // Check password for admin
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        // Generate admin token
        const token = jwt.sign({ id: admin.id, role: admin.role, email: admin.email }, ADMIN_JWT_SECRET, { expiresIn: '1d' });
        const { password: _, ...adminData } = admin;
        res.status(200).json({
            token,
            user: { ...adminData, type: 'admin' },
            message: 'Login successful'
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error during login.', error: error.message });
    }
};
//# sourceMappingURL=authController.js.map