import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { USERS_COLLECTION } from "@/models/user"
import bcrypt from "bcryptjs"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
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
      return NextResponse.json({
        success: true,
        message: "Test rep password set successfully!",
        loginDetails: {
          email: "test@gmail.com",
          password: "TestRep123!",
          loginUrl: "/auth/signin",
        },
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Test rep account not found",
        },
        { status: 404 },
      )
    }
  } catch (error) {
    console.error("Error setting password:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error setting password",
        error: String(error),
      },
      { status: 500 },
    )
  }
}
