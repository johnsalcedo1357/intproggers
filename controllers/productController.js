import products from '../models/products.js'
import mongoose from 'mongoose'

export const scan = async (req, res) => {
    const { barcode } = req.params;

    try {
        const product = await products.findOne({ barcode });

        if (!product) {
            return res.status(404).json({ error: "Product not found." });
        }

        res.status(200).json(product);
    } catch (error) {
        console.error("Scan error:", error);
        res.status(500).json({ error: "Server error while scanning." });
    }
};

export const checkbc = async (req, res) => {
  const { barcode } = req.query;

  try {
    const existingProduct = await products.findOne({ barcode });

    if (existingProduct) {
      return res.status(200).json({ exists: true });
    } else {
      return res.status(404).json({ error: 'Product not found.' });
    }
  } catch (err) {
    console.error('Error checking barcode:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

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
    const { product_name, product_price, barcode } = req.body;

    if (!product_name || !product_price || !barcode) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const existing = await products.findOne({ barcode });
    if (existing) {
      return res.status(409).json({ error: "Barcode already exists." });
    }

    const newProduct = new products({ product_name, product_price, barcode });
    const savedProduct = await newProduct.save();

    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ error: "Failed to add the product." });
  }
};

export const edit = async (req, res) => {
    const { barcode } = req.params;
    const { product_name, product_price } = req.body;
    try {
        const objectId = new mongoose.Types.ObjectId(barcode);
        const product = await products.findById(objectId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found.' });
        }
      if (product_name !== undefined) {
            product.product_name = product_name;
        }
        if (product_price !== undefined) {
            product.product_price = product_price;
        }

        const updatedProduct = await product.save();
        res.status(200).json(updatedProduct);
      } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Server error while updating product.' });
      }
};

export const remove = async (req,res) => {
      const { barcode } = req.params

      try {
        const result = await products.deleteOne({ _id: barcode });

        if (result.deletedCount === 0) {
          return res.status(404).json({ error: 'Product not found.' });
        }

        res.status(200).json({ message: 'Product deleted successfully.' });
      } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Server error while updating product.' });
      }
}
