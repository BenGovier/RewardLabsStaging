// Create test business account
const { MongoClient } = require("mongodb")
const bcrypt = require("bcryptjs")

async function createTestBusiness() {
  console.log("Creating test business account...")

  // Use environment variables
  const uri = process.env.MONGODB_URI
  const dbName = process.env.MONGODB_DB

  if (!uri || !dbName) {
    console.error("Missing MongoDB connection details")
    return
  }

  console.log(`Connecting to MongoDB database: ${dbName}`)

  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db(dbName)
    const usersCollection = db.collection("users")

    // Check if test business already exists
    const existingUser = await usersCollection.findOne({ email: "testbusiness@example.com" })

    if (existingUser) {
      console.log("Test business account already exists:")
      console.log({
        email: "testbusiness@example.com",
        businessName: existingUser.businessName,
        role: existingUser.role,
        message: "Use password: TestBusiness123!",
      })
      return
    }

    // Create new test business account
    const passwordHash = await bcrypt.hash("TestBusiness123!", 10)

    const newBusiness = {
      firstName: "Test",
      lastName: "Business",
      email: "testbusiness@example.com",
      passwordHash,
      role: "business",
      businessName: "Test Business Ltd",
      isActive: true,
      dateCreated: new Date(),
    }

    const result = await usersCollection.insertOne(newBusiness)

    console.log("✅ Test business account created successfully!")
    console.log({
      _id: result.insertedId,
      email: "testbusiness@example.com",
      password: "TestBusiness123!",
      businessName: "Test Business Ltd",
      role: "business",
    })
  } catch (error) {
    console.error("❌ Error creating test business account:", error)
  } finally {
    await client.close()
    console.log("MongoDB connection closed")
  }
}

createTestBusiness()
