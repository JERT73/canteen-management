// File: lib/mongodb.ts

import { MongoClient } from 'mongodb';

// Check if the MONGODB_URI environment variable is set.
// If not, the application cannot connect to the database and should crash.
if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// In development mode, we use a global variable to preserve the 'client'
// instance across module reloads caused by HMR (Hot Module Replacement).
// This prevents creating a new connection on every code change.
if (process.env.NODE_ENV === 'development') {
  // Check if the client promise is already on the global object.
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    // If not, create a new client and a new promise.
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  // Use the existing promise.
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  // Create a new client and connect.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;
