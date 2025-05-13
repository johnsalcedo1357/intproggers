import express from 'express'
import { scan , findall , add , remove , edit } from '../controllers/productController.js'

const router = express.Router();

router.get("/:barcode", scan);
router.post("/" , add);
router.get("/", findall);
router.patch("/:barcode", edit);
router.delete("/:barcode", remove);

export default router;