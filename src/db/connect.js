import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); // Load .env variables

// const uri = "mongodb+srv://samansaeed2306:saman@cluster0.wvdsiey.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
// const uri = "mongodb+srv://samansaeed2306:saman@cluster0.wvdsiey.mongodb.net/VideoAnnotations?retryWrites=true&w=majority&appName=Cluster0";
// const uri = "mongodb+srv://samansageteck:annotations@cluster0.fsljclx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

//const client = new MongoClient(uri, {
  //serverApi: {
     //version: ServerApiVersion.v1,
     //strict: true,
     //deprecationErrors: true,
//   }
//});


const uri = "mongodb+srv://production:g0DDB+kf7Y%5D1@tuneup-prod.ggzwzqu.mongodb.net/VideoAnnotations?retryWrites=true&w=majority&appName=tuneup-prod";

if (!uri) {
  throw new Error("MONGO_URI is not defined in environment variables");
}

const client = new MongoClient(uri);

export async function connectToDb () {
  try {
    // Connect using MongoClient
    await client.connect();
    console.log(" Connected to MongoDB with MongoClient");

    // Connect using Mongoose
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(" Connected to MongoDB with Mongoose");

    // Return the database instance for MongoClient usage
    return client.db('VideoAnnotations');
  } catch (error) {
    console.error(" Error connecting to MongoDB:", error);
    throw error;
  }
}
