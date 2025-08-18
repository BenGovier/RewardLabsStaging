import type { ObjectId } from "mongodb"

/**
 * Stripe Subscription interface for tracking subscription details
 */
export interface StripeSubscription {
  _id?: ObjectId | string
  userId: string
  stripeCustomerId: string
  stripeSubscriptionId: string
  stripePriceId: string
  status: "active" | "canceled" | "past_due" | "unpaid" | "incomplete" | "trialing"
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  monthlyAmount: number
  currency: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Collection name for MongoDB
 */
export const STRIPE_SUBSCRIPTIONS_COLLECTION = "stripeSubscriptions"

/**
 * Helper function to validate a subscription object
 */
export function validateStripeSubscription(subscription: Partial<StripeSubscription>): string[] {
  const errors: string[] = []

  if (!subscription.userId) errors.push("User ID is required")
  if (!subscription.stripeCustomerId) errors.push("Stripe Customer ID is required")
  if (!subscription.stripeSubscriptionId) errors.push("Stripe Subscription ID is required")
  if (!subscription.stripePriceId) errors.push("Stripe Price ID is required")
  if (!subscription.status) errors.push("Subscription status is required")
  if (!subscription.monthlyAmount || subscription.monthlyAmount <= 0)
    errors.push("Monthly amount must be greater than 0")

  return errors
}
