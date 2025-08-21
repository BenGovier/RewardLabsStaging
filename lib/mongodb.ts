import { MongoClient, type Db } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env.local")
}

if (!process.env.MONGODB_DB) {
  throw new Error("Please add your MongoDB Database name to .env.local")
}

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB

// Connection caching
let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
const globalWithMongo = global as typeof global & {
  mongo: {
    conn: MongoClient | null
    promise: Promise<MongoClient> | null
  }
}

if (!globalWithMongo.mongo) {
  globalWithMongo.mongo = {
    conn: null,
    promise: null,
  }
}

/**
 * Connects to MongoDB and returns the database instance
 */
export async function getDb(): Promise<Db> {
  try {
    console.log("🔄 MongoDB connection attempt...")

    // If we have a cached connection, return the cached database
    if (cachedDb) {
      console.log("✅ Using cached MongoDB connection")
      return cachedDb
    }

    // If we don't have a client, create one
    if (!cachedClient) {
      console.log("🆕 Creating new MongoDB client...")

      // If we're in development, use the global cache
      if (process.env.NODE_ENV === "development") {
        if (!globalWithMongo.mongo.promise) {
          console.log("🔗 Creating new MongoDB connection for development...")
          globalWithMongo.mongo.promise = MongoClient.connect(uri, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
          })
        }
        cachedClient = await globalWithMongo.mongo.promise
        globalWithMongo.mongo.conn = cachedClient
      } else {
        // In production, create a new client
        console.log("🔗 Creating new MongoDB connection for production...")
        cachedClient = await MongoClient.connect(uri, {
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
        })
      }
    }

    // Get the database
    cachedDb = cachedClient.db(dbName)
    console.log("✅ MongoDB connection established successfully")
    console.log(`📊 Connected to database: ${dbName}`)

    return cachedDb
  } catch (error) {
    console.error("❌ MongoDB connection error:", error)
    console.error("🔍 Connection details:", {
      uri: uri ? "URI provided" : "URI missing",
      dbName: dbName || "DB name missing",
      nodeEnv: process.env.NODE_ENV,
    })
    throw new Error(`Failed to connect to MongoDB: ${error.message}`)
  }
}

/**
 * Legacy function name for backward compatibility
 * Returns the database instance (same as getDb) - FIXED RETURN TYPE
 */
export async function connectToDatabase(): Promise<{ db: Db }> {
  const db = await getDb()
  return { db }
}

/**
 * Explicitly close the MongoDB connection
 * Useful for testing or when you need to clean up
 */
export async function closeDbConnection(): Promise<void> {
  try {
    if (cachedClient) {
      await cachedClient.close()
      cachedClient = null
      cachedDb = null
    }

    if (globalWithMongo.mongo.conn) {
      await globalWithMongo.mongo.conn.close()
      globalWithMongo.mongo.conn = null
      globalWithMongo.mongo.promise = null
    }
    console.log("🔌 MongoDB connection closed")
  } catch (error) {
    console.error("❌ Error closing MongoDB connection:", error)
  }
}
