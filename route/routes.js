import express from 'express'
import { scan , findall , add } from '../controllers/productController.js'

const router = express.Router();

router.get("/:barcode", scan);
router.post("/" , add);
router.get("/", findall);

export default router;