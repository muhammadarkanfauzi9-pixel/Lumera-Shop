// File: be/routes/authRoutes.ts

import { Router } from 'express';
import { login } from '../controllers/authController.js';

const router = Router();

// Unified login route
router.post('/login', login);

export default router;
