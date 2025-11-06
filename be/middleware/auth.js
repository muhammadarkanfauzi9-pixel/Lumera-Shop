import jwt from 'jsonwebtoken';
// GANTI DENGAN KUNCI RAHASIA YANG SAMA DENGAN adminController.ts!
const JWT_SECRET = 'lumera_admin_secret_key_2024';
// GANTI DENGAN KUNCI RAHASIA YANG SAMA DENGAN userController.ts!
const USER_JWT_SECRET = 'lumera_user_secret_key_2024';
// Middleware 1: Memverifikasi Token JWT untuk Admin
export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ message: 'Authorization token missing or malformed.' });
    }
    const token = authHeader.split(' ')[1];
    try {
        // Verifikasi dan cast ke tipe AdminPayload
        const decoded = jwt.verify(token, JWT_SECRET);
        // Tambahkan data admin ke request object
        req.admin = decoded;
        next();
    }
    catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
};
// Middleware untuk Verifikasi Token User
export const verifyUserToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ message: 'Authorization token missing or malformed.' });
    }
    const token = authHeader.split(' ')[1];
    try {
        // Verifikasi dan cast ke tipe UserPayload
        const decoded = jwt.verify(token, USER_JWT_SECRET);
        // Tambahkan data user ke request object
        req.user = decoded;
        next();
    }
    catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
};
// Middleware 2: Memverifikasi Role
export const checkRole = (roles) => (req, res, next) => {
    const admin = req.admin;
    if (!admin || !roles.includes(admin.role)) {
        return res.status(403).json({ message: 'Access denied: Insufficient privileges.' });
    }
    next();
};
//# sourceMappingURL=auth.js.map