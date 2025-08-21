import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { BUSINESS_SIGNUPS_COLLECTION } from "@/models/businessSignup"
import { USERS_COLLECTION } from "@/models/user"

export async function GET() {
  try {
    const db = await getDb()

    // Check recent business signups
    const recentSignups = await db
      .collection(BUSINESS_SIGNUPS_COLLECTION)
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray()

    // Check recent business users
    const recentBusinessUsers = await db
      .collection(USERS_COLLECTION)
      .find({ role: "business" })
      .sort({ dateCreated: -1 })
      .limit(5)
      .toArray()

    // Check for any users created in last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const recentUsers = await db
      .collection(USERS_COLLECTION)
      .find({ dateCreated: { $gte: oneHourAgo } })
      .toArray()

    return NextResponse.json({
      success: true,
      data: {
        recentSignups: recentSignups.map((signup) => ({
          id: signup._id,
          businessName: signup.businessName,
          email: signup.email,
          paymentStatus: signup.paymentStatus,
          signupStep: signup.signupStep,
          createdAt: signup.createdAt,
          stripeCheckoutSessionId: signup.stripeCheckoutSessionId,
        })),
        recentBusinessUsers: recentBusinessUsers.map((user) => ({
          id: user._id,
          email: user.email,
          businessName: user.businessName,
          role: user.role,
          dateCreated: user.dateCreated,
          stripeCustomerId: user.stripeCustomerId,
          stripeSubscriptionId: user.stripeSubscriptionId,
        })),
        recentUsersLastHour: recentUsers.map((user) => ({
          id: user._id,
          email: user.email,
          role: user.role,
          dateCreated: user.dateCreated,
        })),
        totalBusinessUsers: await db.collection(USERS_COLLECTION).countDocuments({ role: "business" }),
        totalSignups: await db.collection(BUSINESS_SIGNUPS_COLLECTION).countDocuments(),
      },
    })
  } catch (error) {
    console.error("❌ Debug webhook test error:", error)
    return NextResponse.json({ error: "Debug failed", details: error.message }, { status: 500 })
  }
}
