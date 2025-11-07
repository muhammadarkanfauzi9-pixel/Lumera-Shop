// File: be/routes/authRoutes.ts
import { Router } from 'express';
import { login } from '../controllers/authController.js';
import { registerUser, loginUser } from '../controllers/userController.js';
const router = Router();
// Unified login route
router.post('/login', login);
// User registration route
router.post('/register', registerUser);
export default router;
//# sourceMappingURL=authRoutes.js.map