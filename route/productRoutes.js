import express from 'express';
import { scan, findall, add, edit, remove, checkbc } from '../controllers/productController.js';

const router = express.Router();

// read only
router.get('/', findall);
router.get('/check', checkbc);
router.get('/:barcode', scan);

// admin
router.post('/', add);
router.patch('/:barcode', edit);
router.delete('/:barcode', remove);

export default router;