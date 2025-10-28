// File: be/routes/userRoutes.ts

import { Router } from 'express';
// Ingat, gunakan .js di TypeScript saat mengimpor relatif!
import { registerUser, loginUser } from '../controllers/userController.js'; 

const router = Router();

// POST /api/auth/register
router.post('/register', registerUser); 

// POST /api/auth/login
router.post('/login', loginUser);

export default router;