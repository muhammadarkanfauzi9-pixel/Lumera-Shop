// File: be/routes/adminRoutes.ts

import { Router } from 'express';
import { loginAdmin, registerAdmin } from '../controllers/adminController';

const router = Router();

// POST /api/admin/register
// Route untuk setup admin awal (HAPUS atau komentari setelah admin pertama terdaftar!)
router.post('/register', registerAdmin); 

// POST /api/admin/login
// Route utama untuk login
router.post('/login', loginAdmin);

export default router;