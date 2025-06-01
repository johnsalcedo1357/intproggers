import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    product_name: {
        type: String,
        required: true
    },
    product_price: {
        type: Number,
        required: true
    },
    barcode: {
        type: String,
        required: true,
        unique: true
    }
});

export default mongoose.model("products", productSchema);
