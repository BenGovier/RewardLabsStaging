import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { USERS_COLLECTION } from "@/models/user"

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 400 })
    }

    const db = await getDb()

    // Find and validate the temporary auth token
    const authToken = await db.collection("temp_auth_tokens").findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    })

    if (!authToken) {
      console.log("❌ Invalid or expired auth token:", token)
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
    }

    // Get the user
    const user = await db.collection(USERS_COLLECTION).findOne({
      _id: authToken.userId,
    })

    if (!user) {
      console.log("❌ User not found for token:", authToken.userId)
      return NextResponse.json({ error: "User not found" }, { status: 400 })
    }

    // Mark token as used
    await db
      .collection("temp_auth_tokens")
      .updateOne({ _id: authToken._id }, { $set: { used: true, usedAt: new Date() } })

    console.log("✅ Auto-signin token validated for user:", user.email)

    // Return user data for client-side signin
    return NextResponse.json({
      success: true,
      user: {
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
        businessName: user.businessName,
      },
    })
  } catch (error) {
    console.error("❌ Auto-signin error:", error)
    return NextResponse.json({ error: "Auto-signin failed" }, { status: 500 })
  }
}
