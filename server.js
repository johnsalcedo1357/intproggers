import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cors from "cors";
import bodyParser from 'body-parser';
import productRoutes from './route/routes.js'
import { MongoClient, ServerApiVersion } from 'mongodb';

const PORT = process.env.PORT || 3000;
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/barcode';
const app = express();
const uri = "mongodb+srv://myuser:BnhTsU3zhaw9KJLN@cluster0.sojtrsl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

dotenv.config();

//setup middlewater
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.json());

//connect the damn thing
// mongoose.connect(mongoURI)
//   .then(() => console.log('Connected to MongoDB'))
//   .catch((error) => console.error('Error connecting to MongoDB:', error));
//or use this for online
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("barcode").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    //route shenanigans
    app.use('/products', productRoutes);
    //check if it's alive
    app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
});
  } catch (error) {
    console.error(error);
  }
}
run().catch(console.dir);