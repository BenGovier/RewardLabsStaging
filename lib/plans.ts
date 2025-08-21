export interface PlanTier {
  id: string
  name: string
  description: string
  monthlyPrice: number
  entryLimit: number
  perEntryPrice: number
  features: Array<{
    icon: string
    text: string
  }>
  popular?: boolean
  stripePriceIdMonthly?: string
}

export const PLAN_TIERS: PlanTier[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for small blasts & quick tests",
    monthlyPrice: 149,
    entryLimit: 250,
    perEntryPrice: 0.596,
    stripePriceIdMonthly: "price_1RZV0aBFf5UFQHctHuUrhUSr",
    features: [
      {
        icon: "⚡",
        text: "250 customer entries per month",
      },
      {
        icon: "🎁",
        text: "12 branded giveaways",
      },
      {
        icon: "🏆",
        text: "Prize sourcing included",
      },
      {
        icon: "📊",
        text: "Download all customer data",
      },
      {
        icon: "📧",
        text: "Email support",
      },
    ],
  },
  {
    id: "growth",
    name: "Growth",
    description: "Ideal for growing SMBs needing scale & data",
    monthlyPrice: 449,
    entryLimit: 1500,
    perEntryPrice: 0.299,
    popular: true,
    stripePriceIdMonthly: "price_1RZDdNBFf5UFQHctQ6h8B3O4",
    features: [
      {
        icon: "⚡",
        text: "1500 customer entries per month",
      },
      {
        icon: "🎁",
        text: "12 branded giveaways",
      },
      {
        icon: "🏆",
        text: "Prize sourcing included",
      },
      {
        icon: "📊",
        text: "Download all customer data",
      },
      {
        icon: "📧",
        text: "Email support",
      },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    description: "Built for mid-market campaigns with high volume",
    monthlyPrice: 999,
    entryLimit: 5000,
    perEntryPrice: 0.199,
    stripePriceIdMonthly: "price_1RZDedBFf5UFQHctctUVc7qW",
    features: [
      {
        icon: "⚡",
        text: "5000 customer entries per month",
      },
      {
        icon: "🎁",
        text: "12 branded giveaways",
      },
      {
        icon: "🏆",
        text: "Prize sourcing included",
      },
      {
        icon: "📊",
        text: "Download all customer data",
      },
      {
        icon: "🔗",
        text: "API integration",
      },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For enterprises needing unlimited scale & compliance",
    monthlyPrice: 0,
    entryLimit: -1,
    perEntryPrice: 0.01,
    features: [
      {
        icon: "♾",
        text: "Unlimited entries & custom SLAs",
      },
      {
        icon: "🔒",
        text: "SSO/SAML, on-prem & data residency",
      },
      {
        icon: "🚀",
        text: "Dedicated CSM, co-marketing & dev",
      },
    ],
  },
]

export function getPlanById(planId: string): PlanTier | undefined {
  return PLAN_TIERS.find((plan) => plan.id === planId)
}

export function calculateAnnualSavings(monthlyPrice: number, annualPrice: number): number {
  const monthlyTotal = monthlyPrice * 12
  return Math.round(((monthlyTotal - annualPrice) / monthlyTotal) * 100)
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}
