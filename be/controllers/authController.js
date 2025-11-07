// File: be/controllers/authController.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { writeAdminLog } from './adminController.js';
const prisma = new PrismaClient();
// JWT Secrets
const ADMIN_JWT_SECRET = 'lumera_admin_secret_key_2024';
const USER_JWT_SECRET = 'lumera_user_secret_key_2024';
// Unified Login Function
export const login = async (req, res) => {
    let { email, password } = req.body;
    // Normalize incoming email to avoid casing/whitespace issues
    email = typeof email === 'string' ? email.trim().toLowerCase() : email;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }
    try {
        // First, try to find admin (normalize lookup by using the normalized email)
        let admin = await prisma.admin.findUnique({ where: { email } });
        let isAdmin = true;
        if (!admin) {
            // If not admin, try user
            let user = await prisma.user.findUnique({ where: { email } });
            isAdmin = false;
            if (!user) {
                console.warn(`[AUTH] Login failed: no account found for email=${email}`);
                return res.status(401).json({ message: 'Invalid credentials.' });
            }
            // Check password for user
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                console.warn(`[AUTH] Login failed: invalid password for user email=${email}`);
                return res.status(401).json({ message: 'Invalid credentials.' });
            }
            // Generate user token
            const token = jwt.sign({ id: user.id, email: user.email }, USER_JWT_SECRET, { expiresIn: '7d' });
            const { password: _, ...userData } = user;
            // Set httpOnly cookie for user token (safer for server-side proxy)
            res.cookie('userToken', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                path: '/',
            });
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
            console.warn(`[AUTH] Login failed: invalid password for admin email=${email}`);
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        // Generate admin token
        const token = jwt.sign({ id: admin.id, role: admin.role, email: admin.email }, ADMIN_JWT_SECRET, { expiresIn: '1d' });
        const { password: _, ...adminData } = admin;
        // Log admin login
        try {
            await writeAdminLog(admin.id, 'LOGIN', 'AUTH', 'Admin logged in', req.ip, req.headers['user-agent'] || undefined);
        }
        catch (e) {
            console.error('Failed to write admin log for login', e);
        }
        // Set httpOnly cookie for admin token
        res.cookie('adminToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000, // 1 day
            path: '/',
        });
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