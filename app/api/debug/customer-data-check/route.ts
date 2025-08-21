import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { BUSINESS_SIGNUPS_COLLECTION } from "@/models/businessSignup"

export async function GET() {
  try {
    const db = await getDb()
    const usersCollection = db.collection("users")
    const businessSignupsCollection = db.collection(BUSINESS_SIGNUPS_COLLECTION)

    // Check all business users in users collection
    const allBusinessUsers = await usersCollection.find({ role: "business" }).toArray()

    // Check all completed business signups
    const allBusinessSignups = await businessSignupsCollection.find({ paymentStatus: "completed" }).toArray()

    // Check users with various subscription status fields
    const usersWithSubscriptionStatus = await usersCollection
      .find({
        role: "business",
        $or: [
          { stripeSubscriptionStatus: { $exists: true } },
          { subscriptionStatus: { $exists: true } },
          { paymentStatus: { $exists: true } },
          { status: { $exists: true } },
        ],
      })
      .toArray()

    // Check for direct signups (no rep referral)
    const directSignups = await usersCollection
      .find({
        role: "business",
        $or: [{ createdByRepId: { $exists: false } }, { createdByRepId: null }],
      })
      .toArray()

    // Check for rep-referred signups
    const repReferredSignups = await usersCollection
      .find({
        role: "business",
        createdByRepId: { $exists: true, $ne: null },
      })
      .toArray()

    return NextResponse.json({
      summary: {
        totalBusinessUsers: allBusinessUsers.length,
        totalBusinessSignups: allBusinessSignups.length,
        usersWithSubscriptionStatus: usersWithSubscriptionStatus.length,
        directSignups: directSignups.length,
        repReferredSignups: repReferredSignups.length,
      },
      data: {
        allBusinessUsers: allBusinessUsers.map((user) => ({
          id: user._id,
          email: user.email,
          businessName: user.businessName || user.name || user.firstName,
          role: user.role,
          createdByRepId: user.createdByRepId || "DIRECT",
          stripeSubscriptionStatus: user.stripeSubscriptionStatus,
          subscriptionStatus: user.subscriptionStatus,
          paymentStatus: user.paymentStatus,
          status: user.status,
          dateCreated: user.dateCreated,
          createdAt: user.createdAt,
        })),
        businessSignups: allBusinessSignups.map((signup) => ({
          id: signup._id,
          businessName: signup.businessName,
          email: signup.email,
          paymentStatus: signup.paymentStatus,
          completedAt: signup.completedAt,
          createdByRepId: signup.createdByRepId || "DIRECT",
        })),
      },
    })
  } catch (error) {
    console.error("Customer data check error:", error)
    return NextResponse.json({ error: "Failed to check customer data" }, { status: 500 })
  }
}
