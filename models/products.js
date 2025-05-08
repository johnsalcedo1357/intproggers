import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
    product_name: {
        type: String
    },

    product_price: {
        type: Number
    }
});

export default mongoose.model("products", productSchema);