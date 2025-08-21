import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"

async function createSecondTestUser() {
  const client = new MongoClient(process.env.MONGODB_URI)

  try {
    await client.connect()
    const db = client.db(process.env.MONGODB_DB)

    // Check if second test user already exists
    const existingUser = await db.collection("users").findOne({
      email: "testuser2@raffily.com",
    })

    if (existingUser) {
      console.log("Second test user already exists!")
      console.log("Email: testuser2@raffily.com")
      console.log("Password: TestUser123!")
      return
    }

    // Create password hash
    const password = "TestUser123!"
    const passwordHash = await bcrypt.hash(password, 12)

    // Create second test user
    const testUser = {
      firstName: "Jane",
      lastName: "Smith",
      email: "testuser2@raffily.com",
      mobile: "+1987654321",
      passwordHash,
      role: "rep",
      isActive: true,
      invitationSent: true,
      invitationSentAt: new Date(),
      dateCreated: new Date(),
    }

    const result = await db.collection("users").insertOne(testUser)

    console.log("✅ Second test user created successfully!")
    console.log("📧 Email: testuser2@raffily.com")
    console.log("🔑 Password: TestUser123!")
    console.log("🆔 User ID:", result.insertedId)
    console.log("")
    console.log("Now you can test messaging between two different users!")

    // Also show the first test user details
    console.log("")
    console.log("First test user:")
    console.log("📧 Email: test.rep@raffily.com")
    console.log("🔑 Password: TestRep123!")
  } catch (error) {
    console.error("❌ Error creating second test user:", error)
  } finally {
    await client.close()
  }
}

createSecondTestUser()
