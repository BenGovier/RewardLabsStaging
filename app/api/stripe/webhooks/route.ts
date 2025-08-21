import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { stripe, STRIPE_CONFIG } from "@/lib/stripe"
import { getDb } from "@/lib/mongodb"
import { BUSINESS_SIGNUPS_COLLECTION } from "@/models/businessSignup"
import { USERS_COLLECTION } from "@/models/user"
import { STRIPE_SUBSCRIPTIONS_COLLECTION, type StripeSubscription } from "@/models/stripeSubscription"
import bcrypt from "bcryptjs"
import type Stripe from "stripe"
import { sendEmail, generateBusinessWelcomeEmail } from "@/lib/email"

export async function POST(request: Request) {
  console.log("🔔 Stripe webhook received at:", new Date().toISOString())

  try {
    const body = await request.text()
    const headersList = headers()
    const signature = headersList.get("stripe-signature")

    console.log("📋 Webhook details:", {
      hasBody: !!body,
      bodyLength: body.length,
      hasSignature: !!signature,
      hasWebhookSecret: !!STRIPE_CONFIG.WEBHOOK_SECRET,
    })

    if (!signature || !STRIPE_CONFIG.WEBHOOK_SECRET) {
      console.error("❌ Missing Stripe signature or webhook secret")
      return NextResponse.json({ error: "Missing signature" }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, STRIPE_CONFIG.WEBHOOK_SECRET)
      console.log("✅ Webhook signature verified successfully")
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    console.log("🎯 Processing webhook event:", {
      type: event.type,
      id: event.id,
      created: new Date(event.created * 1000).toISOString(),
    })

    const db = await getDb()

    switch (event.type) {
      case "checkout.session.completed": {
        console.log("💳 Processing checkout.session.completed")
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(db, session)
        break
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        console.log("📊 Processing subscription event:", event.type)
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(db, subscription)
        break
      }

      case "customer.subscription.deleted": {
        console.log("🗑️ Processing subscription deletion")
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(db, subscription)
        break
      }

      case "invoice.payment_succeeded": {
        console.log("💰 Processing payment success")
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSucceeded(db, invoice)
        break
      }

      case "invoice.payment_failed": {
        console.log("💸 Processing payment failure")
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(db, invoice)
        break
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`)
    }

    console.log("✅ Webhook processed successfully")
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("❌ Webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}

async function handleCheckoutCompleted(db: any, session: Stripe.Checkout.Session) {
  console.log("🔄 Starting handleCheckoutCompleted")
  console.log("📋 Session details:", {
    id: session.id,
    customer: session.customer,
    subscription: session.subscription,
    paymentStatus: session.payment_status,
    metadata: session.metadata,
  })

  try {
    // Look up signup by checkout session ID
    console.log("🔍 Looking up signup by session ID:", session.id)
    const signup = await db.collection(BUSINESS_SIGNUPS_COLLECTION).findOne({
      stripeCheckoutSessionId: session.id,
    })

    if (!signup) {
      console.error("❌ No signup found for checkout session:", session.id)

      // Additional debug: check what signups exist
      const allSignups = await db
        .collection(BUSINESS_SIGNUPS_COLLECTION)
        .find({}, { projection: { stripeCheckoutSessionId: 1, email: 1, businessName: 1 } })
        .limit(10)
        .toArray()

      console.log("📊 Recent signups in database:", allSignups)
      return
    }

    console.log("✅ Found signup record:", {
      id: signup._id,
      email: signup.email,
      businessName: signup.businessName,
      currentStatus: signup.paymentStatus,
    })

    // Get the subscription to calculate actual monthly revenue
    let monthlyRevenue = 0
    if (session.subscription) {
      try {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
        // Get the actual monthly amount from Stripe (convert from cents to pounds)
        monthlyRevenue = (subscription.items.data[0]?.price.unit_amount || 0) / 100
        console.log("💰 Calculated monthly revenue from Stripe:", monthlyRevenue)
      } catch (error) {
        console.error("❌ Error fetching subscription for revenue calculation:", error)
        // Fallback to default if we can't get the subscription
        monthlyRevenue = 29.99
      }
    }

    // Get password from session metadata or signup record
    const password = session.metadata?.password || signup.password || "defaultPassword123"
    console.log("🔑 Password source:", {
      fromMetadata: !!session.metadata?.password,
      fromSignup: !!signup.password,
      usingDefault: !session.metadata?.password && !signup.password,
    })

    // Hash the password
    console.log("🔐 Hashing password...")
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log("✅ Password hashed successfully")

    // Create the business user account
    console.log("👤 Creating business user account...")
    const userResult = await db.collection(USERS_COLLECTION).insertOne({
      firstName: signup.firstName,
      lastName: signup.lastName,
      email: signup.email,
      passwordHash: hashedPassword,
      role: "business",
      businessName: signup.businessName,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: session.subscription as string,
      stripeSubscriptionStatus: "active",
      createdByRepId: signup.createdByRepId,
      monthlyRevenue: monthlyRevenue, // Use actual calculated revenue
      onboardingCompleted: false,
      isActive: true,
      dateCreated: new Date(),
    })

    console.log("✅ Business account created successfully:", {
      userId: userResult.insertedId,
      email: signup.email,
      businessName: signup.businessName,
      monthlyRevenue: monthlyRevenue,
    })

    // Send welcome email
    console.log("📧 Sending welcome email...")
    try {
      const emailSent = await sendEmail({
        to: signup.email,
        subject: `Welcome to Raffily, ${signup.firstName}! Your ${signup.businessName} account is ready 🎉`,
        html: generateBusinessWelcomeEmail(
          signup.firstName,
          signup.lastName,
          signup.businessName,
          "Professional Plan", // You can make this dynamic based on the plan
          monthlyRevenue,
          signup.createdByRepId ? "Your Rep" : undefined, // You might want to fetch the actual rep name
        ),
      })

      if (emailSent) {
        console.log("✅ Welcome email sent successfully")
      } else {
        console.error("❌ Failed to send welcome email")
      }
    } catch (emailError) {
      console.error("❌ Error sending welcome email:", emailError)
      // Don't throw - we don't want email failures to break the signup process
    }

    // Update signup record with completion status
    console.log("📝 Updating signup record...")
    const updateResult = await db.collection(BUSINESS_SIGNUPS_COLLECTION).updateOne(
      { _id: signup._id },
      {
        $set: {
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          paymentStatus: "completed",
          signupStep: "account_created",
          completedAt: new Date(),
          userId: userResult.insertedId.toString(),
        },
      },
    )

    console.log("✅ Signup record updated:", {
      matchedCount: updateResult.matchedCount,
      modifiedCount: updateResult.modifiedCount,
    })

    console.log("🎉 Checkout completion handled successfully!")
  } catch (error) {
    console.error("❌ Error in handleCheckoutCompleted:", error)
    console.error("❌ Error stack:", error.stack)
  }
}

async function handleSubscriptionUpdated(db: any, subscription: Stripe.Subscription) {
  console.log("📊 Handling subscription update:", subscription.id)
  try {
    // Calculate actual monthly revenue from subscription
    const monthlyRevenue = (subscription.items.data[0]?.price.unit_amount || 0) / 100

    // Update user subscription status
    const userUpdateResult = await db.collection(USERS_COLLECTION).updateOne(
      { stripeSubscriptionId: subscription.id },
      {
        $set: {
          stripeSubscriptionStatus: subscription.status,
          stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          monthlyRevenue: monthlyRevenue, // Update with actual revenue
          updatedAt: new Date(),
        },
      },
    )

    console.log("✅ User subscription updated:", {
      matchedCount: userUpdateResult.matchedCount,
      modifiedCount: userUpdateResult.modifiedCount,
      monthlyRevenue: monthlyRevenue,
    })

    // Update or create subscription record
    const subscriptionData: StripeSubscription = {
      userId: "", // Will be filled by the user lookup
      stripeCustomerId: subscription.customer as string,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0]?.price.id || "",
      status: subscription.status as any,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      monthlyAmount: monthlyRevenue, // Use actual amount
      currency: subscription.currency,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db
      .collection(STRIPE_SUBSCRIPTIONS_COLLECTION)
      .updateOne({ stripeSubscriptionId: subscription.id }, { $set: subscriptionData }, { upsert: true })

    console.log("✅ Subscription record updated")
  } catch (error) {
    console.error("❌ Error handling subscription update:", error)
  }
}

async function handleSubscriptionDeleted(db: any, subscription: Stripe.Subscription) {
  console.log("🗑️ Handling subscription deletion:", subscription.id)
  try {
    // Update user subscription status
    await db.collection(USERS_COLLECTION).updateOne(
      { stripeSubscriptionId: subscription.id },
      {
        $set: {
          stripeSubscriptionStatus: "canceled",
          updatedAt: new Date(),
        },
      },
    )

    // Update subscription record
    await db.collection(STRIPE_SUBSCRIPTIONS_COLLECTION).updateOne(
      { stripeSubscriptionId: subscription.id },
      {
        $set: {
          status: "canceled",
          updatedAt: new Date(),
        },
      },
    )

    console.log("✅ Subscription deletion handled")
  } catch (error) {
    console.error("❌ Error handling subscription deletion:", error)
  }
}

async function handlePaymentSucceeded(db: any, invoice: Stripe.Invoice) {
  console.log("💰 Handling payment success for invoice:", invoice.id)
  try {
    if (invoice.subscription) {
      await db.collection(USERS_COLLECTION).updateOne(
        { stripeSubscriptionId: invoice.subscription },
        {
          $set: {
            stripeSubscriptionStatus: "active",
            updatedAt: new Date(),
          },
        },
      )
      console.log("✅ Payment success handled")
    }
  } catch (error) {
    console.error("❌ Error handling payment success:", error)
  }
}

async function handlePaymentFailed(db: any, invoice: Stripe.Invoice) {
  console.log("💸 Handling payment failure for invoice:", invoice.id)
  try {
    if (invoice.subscription) {
      await db.collection(USERS_COLLECTION).updateOne(
        { stripeSubscriptionId: invoice.subscription },
        {
          $set: {
            stripeSubscriptionStatus: "past_due",
            updatedAt: new Date(),
          },
        },
      )
      console.log("✅ Payment failure handled")
    }
  } catch (error) {
    console.error("❌ Error handling payment failure:", error)
  }
}
