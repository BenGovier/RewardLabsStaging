import Stripe from "stripe"
import { getPlanById } from "./plans"

// Lazy initialization - only validate when actually used
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
  typescript: true,
})

// Stripe configuration - Fixed to use correct domain
export const STRIPE_CONFIG = {
  SUCCESS_URL: "https://v0-raffily-rep-portal.vercel.app/business/dashboard?setup=success",
  CANCEL_URL: "https://v0-raffily-rep-portal.vercel.app/signup/business?canceled=true",
  WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
}

// Validation function that runs at runtime, not build time
function validateStripeConfig() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set in environment variables")
  }
}

/**
 * Get Stripe price ID for a plan and billing cycle
 */
export function getStripePriceId(planId: string, billingCycle: "monthly" | "annual"): string {
  const plan = getPlanById(planId)
  if (!plan) {
    throw new Error(`Plan not found: ${planId}`)
  }

  const priceId = billingCycle === "monthly" ? plan.stripePriceIdMonthly : plan.stripePriceIdAnnual
  if (!priceId) {
    throw new Error(`Price ID not configured for plan ${planId} (${billingCycle})`)
  }

  return priceId
}

/**
 * Create a Stripe checkout session for business subscription
 */
export async function createCheckoutSession({
  businessName,
  email,
  planId,
  billingCycle = "monthly",
  referralCode,
  metadata = {},
}: {
  businessName: string
  email: string
  planId: string
  billingCycle?: "monthly" | "annual"
  referralCode?: string
  metadata?: Record<string, string>
}) {
  validateStripeConfig()

  try {
    const priceId = getStripePriceId(planId, billingCycle)
    const plan = getPlanById(planId)

    if (!plan) {
      throw new Error(`Plan not found: ${planId}`)
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: email,
      metadata: {
        businessName,
        planId,
        billingCycle,
        referralCode: referralCode || "",
        ...metadata,
      },
      subscription_data: {
        metadata: {
          businessName,
          planId,
          billingCycle,
          referralCode: referralCode || "",
        },
      },
      success_url: STRIPE_CONFIG.SUCCESS_URL,
      cancel_url: STRIPE_CONFIG.CANCEL_URL,
      allow_promotion_codes: true,
    })

    return session
  } catch (error) {
    console.error("Error creating Stripe checkout session:", error)
    throw error
  }
}

/**
 * Retrieve a Stripe subscription
 */
export async function getSubscription(subscriptionId: string) {
  validateStripeConfig()
  try {
    return await stripe.subscriptions.retrieve(subscriptionId)
  } catch (error) {
    console.error("Error retrieving Stripe subscription:", error)
    throw error
  }
}

/**
 * Cancel a Stripe subscription
 */
export async function cancelSubscription(subscriptionId: string, cancelAtPeriodEnd = true) {
  validateStripeConfig()
  try {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: cancelAtPeriodEnd,
    })
  } catch (error) {
    console.error("Error canceling Stripe subscription:", error)
    throw error
  }
}
