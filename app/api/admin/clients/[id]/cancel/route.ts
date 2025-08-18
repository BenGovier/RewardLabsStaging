import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectToDatabase } from "@/lib/mongodb"
import { stripe } from "@/lib/stripe"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Admin subscription cancellation - always available for admin users
    const session = await getServerSession(authOptions)

    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { subscriptionId } = await request.json()

    if (!subscriptionId) {
      return NextResponse.json({ error: "Subscription ID required" }, { status: 400 })
    }

    // Cancel subscription at period end via Stripe
    const cancelledSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    })

    // Update our database record
    const { db } = await connectToDatabase()
    await db.collection("stripeSubscriptions").updateOne(
      { subscriptionId: subscriptionId },
      {
        $set: {
          cancelAtPeriodEnd: true,
          updatedAt: new Date(),
        },
      },
    )

    // Audit log the cancellation
    await db.collection("adminActions").insertOne({
      adminId: session.user.id,
      adminEmail: session.user.email,
      action: "cancel_subscription",
      targetUserId: params.id,
      subscriptionId: subscriptionId,
      timestamp: new Date(),
      details: "Subscription cancelled at period end",
    })

    return NextResponse.json({
      success: true,
      subscription: cancelledSubscription,
    })
  } catch (error) {
    console.error("Error cancelling subscription:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
