import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { USERS_COLLECTION } from "@/models/user"
import { BUSINESS_SIGNUPS_COLLECTION } from "@/models/businessSignup"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email") // Pass email as query param

    const db = await getDb()

    console.log("🔍 DEBUG: Magic Link Signup Check for email:", email)

    // 1. Check referral clicks
    const referralClicks = await db
      .collection("referralClicks")
      .find({
        ...(email && { email: { $regex: email, $options: "i" } }),
      })
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray()

    console.log("📊 Referral clicks found:", referralClicks.length)

    // 2. Check business signups
    const businessSignups = await db
      .collection(BUSINESS_SIGNUPS_COLLECTION)
      .find({
        ...(email && { email: { $regex: email, $options: "i" } }),
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray()

    console.log("📊 Business signups found:", businessSignups.length)

    // 3. Check users collection
    const users = await db
      .collection(USERS_COLLECTION)
      .find({
        role: "business",
        ...(email && { email: { $regex: email, $options: "i" } }),
      })
      .sort({ dateCreated: -1 })
      .limit(10)
      .toArray()

    console.log("📊 Business users found:", users.length)

    // 4. Check temp auth tokens (for auto-signin)
    const tempTokens = await db.collection("temp_auth_tokens").find({}).sort({ createdAt: -1 }).limit(10).toArray()

    console.log("📊 Temp auth tokens found:", tempTokens.length)

    // 5. Check entries (raffle entries)
    const entries = await db.collection("entries").find({}).sort({ createdAt: -1 }).limit(10).toArray()

    console.log("📊 Entries found:", entries.length)

    // 6. Get all collections to see what exists
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((c) => c.name)

    // 7. Check recent webhook logs if they exist
    let webhookLogs = []
    if (collectionNames.includes("webhook_logs")) {
      webhookLogs = await db.collection("webhook_logs").find({}).sort({ timestamp: -1 }).limit(10).toArray()
    }

    const debugData = {
      searchEmail: email,
      timestamp: new Date().toISOString(),

      // Referral tracking
      referralClicks: {
        count: referralClicks.length,
        recent: referralClicks.map((click) => ({
          referralSlug: click.referralSlug,
          timestamp: click.timestamp,
          ipAddress: click.ipAddress,
          email: click.email,
        })),
      },

      // Business signups
      businessSignups: {
        count: businessSignups.length,
        recent: businessSignups.map((signup) => ({
          email: signup.email,
          businessName: signup.businessName,
          paymentStatus: signup.paymentStatus,
          createdAt: signup.createdAt,
          completedAt: signup.completedAt,
          createdByRepId: signup.createdByRepId,
          stripeSessionId: signup.stripeSessionId,
        })),
      },

      // Users
      businessUsers: {
        count: users.length,
        recent: users.map((user) => ({
          email: user.email,
          businessName: user.businessName,
          role: user.role,
          dateCreated: user.dateCreated,
          stripeCustomerId: user.stripeCustomerId,
          stripeSubscriptionStatus: user.stripeSubscriptionStatus,
          createdByRepId: user.createdByRepId,
        })),
      },

      // Auth tokens
      tempAuthTokens: {
        count: tempTokens.length,
        recent: tempTokens.map((token) => ({
          userId: token.userId,
          used: token.used,
          createdAt: token.createdAt,
          expiresAt: token.expiresAt,
        })),
      },

      // Entries
      entries: {
        count: entries.length,
        recent: entries.map((entry) => ({
          email: entry.email,
          businessId: entry.businessId,
          createdAt: entry.createdAt,
        })),
      },

      // Webhook logs
      webhookLogs: {
        count: webhookLogs.length,
        recent: webhookLogs.map((log) => ({
          type: log.type,
          status: log.status,
          timestamp: log.timestamp,
          data: log.data,
        })),
      },

      // Database info
      database: {
        collections: collectionNames,
        totalCollections: collectionNames.length,
      },
    }

    return NextResponse.json(debugData, { status: 200 })
  } catch (error) {
    console.error("❌ Debug check error:", error)
    return NextResponse.json(
      {
        error: "Debug check failed",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
