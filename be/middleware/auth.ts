import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Definisikan tipe untuk data admin yang ada di JWT payload
interface AdminPayload {
    id: number;
    role: string;
    email: string;
}

// Definisikan tipe untuk data user yang ada di JWT payload
interface UserPayload {
    id: number;
    email: string;
}

// Tambahkan properti 'admin' dan 'user' ke Express Request
export interface AuthRequest extends Request {
    admin?: AdminPayload;
    user?: UserPayload;
}

// GANTI DENGAN KUNCI RAHASIA YANG SAMA DENGAN adminController.ts!
const JWT_SECRET = 'YOUR_SUPER_SECRET_KEY';

// Middleware 1: Memverifikasi Token JWT untuk Admin
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ message: 'Authorization token missing or malformed.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verifikasi dan cast ke tipe AdminPayload
        const decoded = jwt.verify(token, JWT_SECRET) as unknown as AdminPayload;

        // Tambahkan data admin ke request object
        (req as AuthRequest).admin = decoded;

        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

// Middleware untuk Verifikasi Token User
export const verifyUserToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ message: 'Authorization token missing or malformed.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verifikasi dan cast ke tipe UserPayload
        const decoded = jwt.verify(token, 'YOUR_SUPER_SECRET_USER_KEY') as unknown as UserPayload;

        // Tambahkan data user ke request object
        (req as AuthRequest).user = decoded;

        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

// Middleware 2: Memverifikasi Role
export const checkRole = (roles: string[]) => (req: Request, res: Response, next: NextFunction) => {
    const admin = (req as AuthRequest).admin;

    if (!admin || !roles.includes(admin.role)) {
        return res.status(403).json({ message: 'Access denied: Insufficient privileges.' });
    }
    next(); 
};