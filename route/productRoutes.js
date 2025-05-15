import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { scan, findall, add, edit, remove } from '../controllers/productController.js';

const router = express.Router();

// read only
router.get('/', findall);
router.get('/:barcode', scan);

// admin
router.post('/', authenticate, add);
router.patch('/:barcode', authenticate, edit);
router.delete('/:barcode', authenticate, remove);

export default router;