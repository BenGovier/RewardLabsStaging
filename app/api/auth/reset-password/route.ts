import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { USERS_COLLECTION } from "@/models/user"
import { PASSWORD_RESET_TOKENS_COLLECTION, isTokenValid } from "@/models/passwordResetToken"
import bcrypt from "bcryptjs"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Password reset submission received")

    const { token, password, confirmPassword } = await request.json()

    if (!token || !password || !confirmPassword) {
      console.log("❌ Missing required fields")
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (password !== confirmPassword) {
      console.log("❌ Passwords don't match")
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 })
    }

    if (password.length < 8) {
      console.log("❌ Password too short")
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 })
    }

    console.log("🔍 Looking for reset token:", token)

    const { db } = await connectToDatabase()

    // Find the reset token
    const resetTokenDoc = await db.collection(PASSWORD_RESET_TOKENS_COLLECTION).findOne({
      token: token,
    })

    if (!resetTokenDoc) {
      console.log("❌ Reset token not found")
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 })
    }

    console.log("✅ Reset token found, checking validity")

    // Check if token is valid (not used and not expired)
    if (!isTokenValid(resetTokenDoc)) {
      console.log("❌ Reset token is invalid or expired")
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 })
    }

    console.log("✅ Reset token is valid")

    // Find the user
    const user = await db.collection(USERS_COLLECTION).findOne({
      _id: new ObjectId(resetTokenDoc.userId),
    })

    if (!user) {
      console.log("❌ User not found for token")
      return NextResponse.json({ error: "User not found" }, { status: 400 })
    }

    console.log("✅ User found:", user.email)

    // Hash the new password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    console.log("🔒 Password hashed, updating user")

    // Update user's password
    await db.collection(USERS_COLLECTION).updateOne(
      { _id: new ObjectId(resetTokenDoc.userId) },
      {
        $set: {
          passwordHash: passwordHash,
          updatedAt: new Date(),
        },
      },
    )

    // Mark token as used
    await db.collection(PASSWORD_RESET_TOKENS_COLLECTION).updateOne(
      { _id: resetTokenDoc._id },
      {
        $set: {
          used: true,
          usedAt: new Date(),
        },
      },
    )

    console.log("✅ Password updated successfully")

    return NextResponse.json({
      message: "Password has been reset successfully. You can now sign in with your new password.",
    })
  } catch (error) {
    console.error("❌ Error in reset password:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
