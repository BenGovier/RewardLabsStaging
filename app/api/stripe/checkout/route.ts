import { NextResponse } from "next/server"
import { createCheckoutSession } from "@/lib/stripe"
import { connectToDatabase } from "@/lib/mongodb"
import { BUSINESS_SIGNUPS_COLLECTION, type BusinessSignup } from "@/models/businessSignup"
import { getPlanById } from "@/lib/plans"

export async function POST(request: Request) {
  try {
    const { businessName, email, firstName, lastName, password, referralCode, planId, billingCycle } =
      await request.json()

    // Validate input
    if (!businessName || !email || !firstName || !lastName || !password || !planId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate plan
    const plan = getPlanById(planId)
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 })
    }

    // Enterprise plans need special handling
    if (planId === "enterprise") {
      return NextResponse.json(
        { error: "Enterprise plans require custom setup. Please contact sales." },
        { status: 400 },
      )
    }

    const { db } = await connectToDatabase()

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 })
    }

    // Create business signup record
    const businessSignup: BusinessSignup = {
      businessName,
      email,
      firstName,
      lastName,
      createdByRepId: referralCode || undefined,
      paymentStatus: "pending",
      signupStep: "form_submitted",
      createdAt: new Date(),
    }

    const signupResult = await db.collection(BUSINESS_SIGNUPS_COLLECTION).insertOne(businessSignup)

    // Create Stripe checkout session
    const session = await createCheckoutSession({
      businessName,
      email,
      planId,
      billingCycle: billingCycle || "monthly",
      referralCode,
      metadata: {
        signupId: signupResult.insertedId.toString(),
        firstName,
        lastName,
        password, // Note: In production, you might want to hash this or handle differently
      },
    })

    // Update signup record with checkout session ID
    await db.collection(BUSINESS_SIGNUPS_COLLECTION).updateOne(
      { _id: signupResult.insertedId },
      {
        $set: {
          stripeCheckoutSessionId: session.id,
          signupStep: "payment_pending",
        },
      },
    )

    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create checkout session" },
      { status: 500 },
    )
  }
}
