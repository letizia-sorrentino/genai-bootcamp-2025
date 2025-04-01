import { MongoClient, ServerApiVersion } from 'mongodb';
import mongoose from 'mongoose';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// MongoDB Schema
const wordSchema = new mongoose.Schema({
  italian: String,
  english: String,
  example: String,
  imageUrl: String,
  category: String
});

const categorySchema = new mongoose.Schema({
  name: String,
  words: [wordSchema]
});

const Category = mongoose.model('Category', categorySchema);

async function migrateData() {
  // Create a MongoClient with a MongoClientOptions object
  const client = new MongoClient(process.env.MONGODB_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  try {
    // Connect the client to the server
    await client.connect();
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Successfully connected to MongoDB!");

    // Get the database
    const db = client.db("flashcards");
    const categoriesCollection = db.collection("categories");

    // Read JSON file
    const filePath = path.join(__dirname, '../data/vocabulary.json');
    const jsonData = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(jsonData);

    // Clear existing data
    await categoriesCollection.deleteMany({});
    console.log('Cleared existing categories');

    // Insert categories
    const result = await categoriesCollection.insertMany(data.categories);
    console.log(`Migrated ${result.insertedCount} categories`);

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
    console.log('MongoDB connection closed');
  }
}

migrateData().catch(console.dir); 