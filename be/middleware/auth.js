import jwt from 'jsonwebtoken';
// GANTI DENGAN KUNCI RAHASIA YANG SAMA DENGAN adminController.ts!
const JWT_SECRET = 'lumera_admin_secret_key_2024';
// GANTI DENGAN KUNCI RAHASIA YANG SAMA DENGAN userController.ts!
const USER_JWT_SECRET = 'lumera_user_secret_key_2024';

// Helper: extract token from Authorization header, req.cookies (if present), or raw Cookie header
const extractToken = (req, cookieNames = []) => {
    // 1) Authorization header (Bearer)
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        return { token: authHeader.split(' ')[1], source: 'authorization' };
    }

    // 2) req.cookies (if cookie-parser is used)
    if (req.cookies) {
        for (const name of cookieNames) {
            if (req.cookies[name]) return { token: req.cookies[name], source: `cookie:${name}` };
        }
    }

    // 3) raw Cookie header fallback
    if (req.headers && req.headers.cookie) {
        try {
            const cookies = Object.fromEntries(req.headers.cookie.split(';').map(c => {
                const [k, ...v] = c.trim().split('=');
                return [k, decodeURIComponent(v.join('='))];
            }));
            for (const name of cookieNames) {
                if (cookies[name]) return { token: cookies[name], source: `cookie:${name}` };
            }
        } catch (e) {
            console.error('[auth.extractToken] Failed to parse cookies header:', e.message || e);
        }
    }

    return { token: null, source: null };
};

// Middleware 1: Memverifikasi Token JWT untuk Admin
export const verifyToken = (req, res, next) => {
    const { token, source } = extractToken(req, ['adminToken']);
    if (!token) {
        // Give a single, consistent message the frontend expects
        return res.status(401).json({ message: 'Authorization token missing or malformed.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.admin = decoded;
        // small non-sensitive debug log to help trace token source (do not log token value)
        console.debug(`[verifyToken] token source=${source}, adminId=${decoded && decoded.id ? decoded.id : 'unknown'}`);
        next();
    } catch (err) {
        console.error('[verifyToken] Token verification failed:', err && err.message ? err.message : err);
        return res.status(401).json({ message: 'Authorization token missing or malformed.' });
    }
};

// Middleware untuk Verifikasi Token User
export const verifyUserToken = (req, res, next) => {
    const { token, source } = extractToken(req, ['userToken']);
    if (!token) {
        return res.status(401).json({ message: 'Authorization token missing or malformed.' });
    }
    try {
        const decoded = jwt.verify(token, USER_JWT_SECRET);
        req.user = decoded;
        console.debug(`[verifyUserToken] token source=${source}, userId=${decoded && decoded.id ? decoded.id : 'unknown'}`);
        next();
    } catch (err) {
        console.error('[verifyUserToken] Token verification failed:', err && err.message ? err.message : err);
        return res.status(401).json({ message: 'Authorization token missing or malformed.' });
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