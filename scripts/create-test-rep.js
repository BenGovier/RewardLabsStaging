import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"

async function createTestRep() {
  const client = new MongoClient(process.env.MONGODB_URI)

  try {
    await client.connect()
    const db = client.db(process.env.MONGODB_DB)

    // Check if test rep already exists
    const existingTestRep = await db.collection("users").findOne({
      email: "test.rep@raffily.com",
    })

    if (existingTestRep) {
      console.log("Test rep already exists!")
      console.log("Email: test.rep@raffily.com")
      console.log("Password: TestRep123!")
      return
    }

    // Create password hash
    const password = "TestRep123!"
    const passwordHash = await bcrypt.hash(password, 12)

    // Create test rep user
    const testRep = {
      firstName: "Test",
      lastName: "Representative",
      email: "test.rep@raffily.com",
      mobile: "+1234567890",
      passwordHash,
      role: "rep",
      isActive: true,
      invitationSent: true,
      invitationSentAt: new Date(),
      dateCreated: new Date(),
    }

    const result = await db.collection("users").insertOne(testRep)

    console.log("✅ Test rep account created successfully!")
    console.log("📧 Email: test.rep@raffily.com")
    console.log("🔑 Password: TestRep123!")
    console.log("🆔 User ID:", result.insertedId)
    console.log("")
    console.log("You can now log in with these credentials to test the rep functionality.")
  } catch (error) {
    console.error("❌ Error creating test rep:", error)
  } finally {
    await client.close()
  }
}

createTestRep()
