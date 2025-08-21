import { getDb } from "../lib/mongodb"
import { USERS_COLLECTION } from "../models/user"
import bcrypt from "bcryptjs"
import { ObjectId } from "mongodb"

async function setTestRepPassword() {
  try {
    console.log("Setting password for test rep account...")

    const db = await getDb()
    const testRepId = "683f09f383b752e80f2ba58a"
    const password = "TestRep123!"

    // Hash the password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Update the test rep account
    const result = await db.collection(USERS_COLLECTION).updateOne(
      { _id: new ObjectId(testRepId) },
      {
        $set: {
          passwordHash: passwordHash,
          invitationSent: true,
          invitationSentAt: new Date(),
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 1) {
      console.log("✅ Test rep password set successfully!")
      console.log("📧 Email: test@gmail.com")
      console.log("🔑 Password: TestRep123!")
      console.log("🚀 You can now login at /auth/signin")
    } else {
      console.log("❌ Test rep account not found")
    }
  } catch (error) {
    console.error("❌ Error setting password:", error)
  }
}

setTestRepPassword()
