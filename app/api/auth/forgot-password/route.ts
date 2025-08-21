import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { USERS_COLLECTION } from "@/models/user"
import { PASSWORD_RESET_TOKENS_COLLECTION, generateResetToken, getTokenExpiration } from "@/models/passwordResetToken"
import { sendEmail, generatePasswordResetEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Password reset request received")

    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.log("❌ Failed to parse request body:", parseError)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { email } = body

    if (!email) {
      console.log("❌ No email provided")
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    console.log("📧 Looking for user with email:", email)

    let db
    try {
      db = await getDb()
    } catch (dbError) {
      console.error("❌ Database connection error:", dbError)
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    // Find user by email
    let user
    try {
      user = await db.collection(USERS_COLLECTION).findOne({
        email: email.toLowerCase().trim(),
      })
    } catch (findError) {
      console.error("❌ Error finding user:", findError)
      return NextResponse.json({ error: "Database query failed" }, { status: 500 })
    }

    if (!user) {
      console.log("❌ User not found for email:", email)
      // Don't reveal if email exists or not for security
      return NextResponse.json(
        { message: "If an account with that email exists, a password reset link has been sent." },
        { status: 200 },
      )
    }

    console.log("✅ User found:", user._id)

    // Generate reset token
    let resetToken, expiresAt
    try {
      resetToken = generateResetToken()
      expiresAt = getTokenExpiration()
      console.log("🔑 Generated reset token, expires at:", expiresAt)
    } catch (tokenError) {
      console.error("❌ Error generating token:", tokenError)
      return NextResponse.json({ error: "Failed to generate reset token" }, { status: 500 })
    }

    // Save reset token to database
    try {
      await db.collection(PASSWORD_RESET_TOKENS_COLLECTION).insertOne({
        userId: user._id,
        token: resetToken,
        expiresAt,
        used: false,
        createdAt: new Date(),
      })
      console.log("💾 Reset token saved to database")
    } catch (saveError) {
      console.error("❌ Error saving reset token:", saveError)
      return NextResponse.json({ error: "Failed to save reset token" }, { status: 500 })
    }

    // Check if SMTP is configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error("❌ SMTP not configured")
      return NextResponse.json({ error: "Email service not configured" }, { status: 500 })
    }

    // Send reset email
    let emailSent
    try {
      emailSent = await sendEmail({
        to: user.email,
        subject: "Password Reset Request - Raffily RepPortal",
        html: generatePasswordResetEmail(user.firstName, user.lastName, resetToken),
      })
    } catch (emailError) {
      console.error("❌ Error sending email:", emailError)
      return NextResponse.json({ error: "Failed to send reset email" }, { status: 500 })
    }

    if (!emailSent) {
      console.log("❌ Failed to send reset email")
      return NextResponse.json({ error: "Failed to send reset email. Please try again." }, { status: 500 })
    }

    console.log("✅ Password reset email sent successfully")

    return NextResponse.json({
      message: "If an account with that email exists, a password reset link has been sent.",
    })
  } catch (error) {
    console.error("❌ Unexpected error in forgot password:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
