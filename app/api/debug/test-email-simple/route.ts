import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/email"

export async function GET() {
  try {
    console.log("🧪 Testing email configuration...")

    // Check environment variables
    const requiredVars = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM"]
    const missing = requiredVars.filter((varName) => !process.env[varName])

    if (missing.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Missing environment variables: ${missing.join(", ")}`,
      })
    }

    console.log("✅ All SMTP environment variables present")
    console.log("📧 SMTP Config:", {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      from: process.env.SMTP_FROM,
      secure: process.env.SMTP_SECURE,
    })

    // Send test email
    const testEmail = process.env.SMTP_FROM || process.env.SMTP_USER

    const emailSent = await sendEmail({
      to: testEmail,
      subject: "Test Email - Raffily RepPortal",
      html: `
        <h1>Test Email</h1>
        <p>This is a test email to verify SMTP configuration.</p>
        <p>Sent at: ${new Date().toISOString()}</p>
      `,
    })

    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: `Test email sent successfully to ${testEmail}`,
      })
    } else {
      return NextResponse.json({
        success: false,
        error: "Failed to send test email",
      })
    }
  } catch (error) {
    console.error("❌ Email test error:", error)
    return NextResponse.json({
      success: false,
      error: error.message,
    })
  }
}
