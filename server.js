import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from './route/userRoutes.js';
import productRoutes from './route/productRoutes.js';

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Replaces bodyParser.json()

// MongoDB Atlas Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "barcode", // Explicitly set the DB name
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: true,
      w: "majority",
    });
    console.log('✅ MongoDB Atlas Connected!');
  } catch (err) {
    console.error('❌ Atlas Connection Error:', err.message);
    process.exit(1); // Exit on failure
  }
};

app.use(express.static('public'));

// Routes
app.use('/auth', userRoutes);
app.use('/products', productRoutes);

// Start Server
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});