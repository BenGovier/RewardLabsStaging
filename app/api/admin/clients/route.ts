import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectToDatabase } from "@/lib/mongodb"
import { stripe } from "@/lib/stripe"

export async function GET(request: NextRequest) {
  try {
    // Admin client management - always available for admin users
    const session = await getServerSession(authOptions)

    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Get all business users
    const businessUsers = await db.collection("users").find({ role: "business" }).sort({ createdAt: -1 }).toArray()

    // Get subscription data for each business
    const clientsWithSubscriptions = await Promise.all(
      businessUsers.map(async (user) => {
        try {
          // Look for active subscription in our database
          const subscription = await db.collection("stripeSubscriptions").findOne({
            businessId: user._id.toString(),
            status: { $in: ["active", "trialing", "past_due"] },
          })

          let subscriptionData = null

          if (subscription) {
            // Get latest data from Stripe
            try {
              const stripeSubscription = await stripe.subscriptions.retrieve(subscription.subscriptionId)
              const price = stripeSubscription.items.data[0]?.price

              subscriptionData = {
                id: stripeSubscription.id,
                status: stripeSubscription.status,
                planName: price?.nickname || price?.lookup_key || "Unknown Plan",
                monthlyAmount: price?.unit_amount ? price.unit_amount / 100 : 0,
                currency: price?.currency || "gbp",
                currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
                cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
              }
            } catch (stripeError) {
              console.error("Error fetching Stripe subscription:", stripeError)
              // Use database data as fallback
              subscriptionData = {
                id: subscription.subscriptionId,
                status: subscription.status,
                planName: subscription.planId || "Unknown Plan",
                monthlyAmount: 0,
                currency: "gbp",
                currentPeriodEnd: subscription.currentPeriodEnd || "",
                cancelAtPeriodEnd: false,
              }
            }
          }

          return {
            _id: user._id.toString(),
            businessName: user.businessName || user.firstName + " " + user.lastName,
            email: user.email,
            createdAt: user.createdAt,
            subscription: subscriptionData,
          }
        } catch (error) {
          console.error("Error processing user subscription:", error)
          return {
            _id: user._id.toString(),
            businessName: user.businessName || user.firstName + " " + user.lastName,
            email: user.email,
            createdAt: user.createdAt,
            subscription: null,
          }
        }
      }),
    )

    return NextResponse.json({
      clients: clientsWithSubscriptions,
      total: clientsWithSubscriptions.length,
    })
  } catch (error) {
    console.error("Error fetching clients:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
