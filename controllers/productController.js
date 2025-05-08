import products from '../models/products.js'
import mongoose from 'mongoose'

export const scan = async (req,res) => {
    const { barcode } = req.params;

    try {
        const objectId = new mongoose.Types.ObjectId(barcode);
        const product = await products.findById(objectId);

        if(!product) {
            return res.status(404).json({ error: "Product not found." });
        }
        res.status(200).json(product);
    } catch (error) {
        console.error("Scan error:", error);
        res.status(500).json({ error: "Server error while scanning." });
    }
}

export const findall = async (req,res) => {
    try {
        const product = await products.find();
        res.status(200).json({ product });
      } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "Failed to fetch products." });
    }
}

export const add = async (req, res) => {
  try {
    const { product_name, product_price } = req.body;

    if (!product_name || !product_price) {
      return res.status(400).json({ error: "Product name and price are required." });
    }

    const newProduct = new products({
      product_name,
      product_price,
    });

    const savedProduct = await newProduct.save();

    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ error: "Failed to add the product." });
  }
};
