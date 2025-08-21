import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { PASSWORD_RESET_TOKENS_COLLECTION, isTokenValid } from "@/models/passwordResetToken"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Token is required", valid: false }, { status: 400 })
    }

    console.log("🔍 Verifying reset token:", token)

    const { db } = await connectToDatabase()

    // Find the reset token
    const resetTokenDoc = await db.collection(PASSWORD_RESET_TOKENS_COLLECTION).findOne({
      token: token,
    })

    if (!resetTokenDoc) {
      console.log("❌ Reset token not found")
      return NextResponse.json({
        valid: false,
        error: "Invalid reset token",
      })
    }

    // Check if token is valid
    const valid = isTokenValid(resetTokenDoc)

    console.log("✅ Token validation result:", valid)

    return NextResponse.json({
      valid: valid,
      error: valid ? null : "Token has expired or been used",
    })
  } catch (error) {
    console.error("❌ Error verifying reset token:", error)
    return NextResponse.json({ error: "Internal server error", valid: false }, { status: 500 })
  }
}
