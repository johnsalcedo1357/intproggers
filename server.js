import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cors from "cors";
import bodyParser from 'body-parser';
import productRoutes from './route/routes.js'

const PORT = process.env.PORT || 3000;
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/barcode';
const app = express();

dotenv.config();

//setup middlewater
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.json());

//connect the damn thing
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

//route shenanigans
app.use('/products', productRoutes);

//check if it's alive
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
});