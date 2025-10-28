import { Router } from 'express';

const router = Router();

// Placeholder routes for products
router.get('/', (req, res) => {
  res.json({ message: 'Products endpoint' });
});

export default router;
