import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { USERS_COLLECTION } from "@/models/user"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 })
    }

    const db = await getDb()

    // Find user by email
    const user = await db.collection(USERS_COLLECTION).findOne({
      email: email.toLowerCase(),
    })

    if (!user) {
      return NextResponse.json({
        found: false,
        message: "User not found",
        email: email.toLowerCase(),
      })
    }

    return NextResponse.json({
      found: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        businessName: user.businessName,
        dateCreated: user.dateCreated,
        hasPasswordHash: !!user.passwordHash,
        hasPassword: !!user.password,
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: user.stripeSubscriptionId,
        stripeSubscriptionStatus: user.stripeSubscriptionStatus,
      },
    })
  } catch (error) {
    console.error("❌ User creation check error:", error)
    return NextResponse.json({ error: "Check failed", details: error.message }, { status: 500 })
  }
}
