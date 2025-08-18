"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import { PLAN_TIERS, formatPrice } from "@/lib/plans"

interface PricingCardsProps {
  onPlanSelect: (planId: string, billingCycle: "monthly" | "annual") => void
  selectedPlan?: string
  selectedCycle?: "monthly" | "annual"
}

export function PricingCards({ onPlanSelect, selectedPlan, selectedCycle = "monthly" }: PricingCardsProps) {
  const [billingCycle] = useState<"monthly" | "annual">("monthly") // Only monthly now

  const handlePlanSelect = (planId: string) => {
    onPlanSelect(planId, billingCycle)
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Section Header */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-gray-900">Choose Your Perfect Plan</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Start running giveaways that drive traffic, capture leads and boost revenue—pick the plan that matches your
          needs.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLAN_TIERS.map((plan) => {
          const price = plan.monthlyPrice
          const isEnterprise = plan.id === "enterprise"

          return (
            <Card
              key={plan.id}
              className={`relative transition-all duration-200 hover:shadow-xl ${
                plan.popular
                  ? "border-2 border-pink-500 shadow-lg transform scale-105"
                  : selectedPlan === plan.id
                    ? "border-2 border-pink-300"
                    : "border hover:border-gray-300"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-pink-500 text-white px-3 py-1 shadow-lg">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center space-y-4 pb-4">
                {/* Plan Name & Price */}
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    {plan.name} — {isEnterprise ? "Custom pricing" : `${formatPrice(price)} /mo`}
                  </h3>
                  <p className="text-sm text-gray-600">{plan.description}</p>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3 text-sm">
                      <span className="text-lg flex-shrink-0">{feature.icon}</span>
                      <span className="text-gray-700">{feature.text}</span>
                    </li>
                  ))}
                </ul>

                {/* Entry Limit */}
                <div className="text-sm text-gray-600 font-medium border-t pt-4">
                  Entries:{" "}
                  {plan.entryLimit === -1 ? "unlimited" : `up to ${plan.entryLimit.toLocaleString()} per month`}
                </div>

                {/* CTA Button */}
                <Button
                  onClick={() => handlePlanSelect(plan.id)}
                  className={`w-full transition-all duration-200 ${
                    plan.popular || selectedPlan === plan.id
                      ? "bg-pink-500 hover:bg-pink-600 text-white shadow-lg hover:shadow-xl"
                      : "bg-pink-500 hover:bg-pink-600 text-white hover:bg-transparent hover:text-pink-500 hover:border-pink-500"
                  }`}
                  size="lg"
                >
                  {isEnterprise ? "Contact Sales" : "Get Started"}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Footer Note */}
      <div className="text-center text-gray-600 max-w-4xl mx-auto">
        <p className="text-sm leading-relaxed">
          All plans include fully branded raffle pages, entry into our £5,000+ Monthly Network Prize, and the exact
          support level you need.
        </p>
      </div>
    </div>
  )
}

export default PricingCards
