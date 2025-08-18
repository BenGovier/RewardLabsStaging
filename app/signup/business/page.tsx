"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PricingCards } from "@/components/pricing-cards"
import { Loader2, ArrowLeft, Shield, Play, Menu, X, LogIn } from "lucide-react"
import { getPlanById, formatPrice } from "@/lib/plans"

type SignupStep = "plan" | "details" | "processing"

export default function BusinessSignup() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState<SignupStep>("plan")
  const [selectedPlan, setSelectedPlan] = useState<string>("")
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [referralInfo, setReferralInfo] = useState<{ repName?: string; businessName?: string } | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const referralCode = searchParams.get("ref")
  const canceled = searchParams.get("canceled")

  useEffect(() => {
    if (referralCode) {
      trackReferralClick(referralCode)
    }
  }, [referralCode])

  const trackReferralClick = async (refCode: string) => {
    try {
      console.log("🔄 Tracking referral click for:", refCode)
      const response = await fetch("/api/referrals/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referralSlug: refCode }),
      })

      console.log("📊 Response status:", response.status)
      const data = await response.json()
      console.log("📊 Response data:", data)

      if (response.ok) {
        console.log("✅ Referral tracking successful:", data)
        setReferralInfo(data)
      } else {
        const errorData = await response.json()
        console.error("❌ Referral tracking failed:", errorData)
      }
    } catch (error) {
      console.error("❌ Error tracking referral:", error)
    }
  }

  const handlePlanSelect = (planId: string, cycle: "monthly" | "annual") => {
    console.log("📋 Plan selected:", { planId, cycle })
    setSelectedPlan(planId)
    setBillingCycle(cycle)

    if (planId === "enterprise") {
      // Handle enterprise contact form
      window.location.href = "mailto:sales@raffily.com?subject=Enterprise Plan Inquiry"
      return
    }

    setCurrentStep("details")
  }

  const handleBackToPlan = () => {
    setCurrentStep("plan")
    setError("")
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setCurrentStep("processing")

    const formData = new FormData(e.currentTarget)
    const businessName = formData.get("businessName") as string
    const email = formData.get("email") as string
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    console.log("📝 Form submission data:", {
      businessName,
      email,
      firstName,
      lastName,
      selectedPlan,
      billingCycle,
      referralCode,
    })

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setCurrentStep("details")
      setIsLoading(false)
      return
    }

    try {
      console.log("🔄 Sending checkout request...")
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          email,
          firstName,
          lastName,
          password,
          referralCode,
          planId: selectedPlan,
          billingCycle,
        }),
      })

      const data = await response.json()
      console.log("📊 Checkout response:", data)

      if (!response.ok) {
        console.error("❌ Checkout failed:", data)
        throw new Error(data.error || "Something went wrong")
      }

      if (data.checkoutUrl) {
        console.log("🔗 Redirecting to checkout:", data.checkoutUrl)
        window.location.href = data.checkoutUrl
      }
    } catch (err: any) {
      console.error("❌ Signup error:", err)
      setError(err.message || "Something went wrong")
      setCurrentStep("details")
    } finally {
      setIsLoading(false)
    }
  }

  const selectedPlanData = getPlanById(selectedPlan)

  return (
    <div className="min-h-screen bg-white">
      {/* EXACT SAME NAVIGATION FROM HOMEPAGE */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo - Made 50% bigger */}
            <div className="flex items-center">
              <img
                src="/images/reward-labs-new-logo.jpg"
                alt="Reward Labs"
                className="h-16 w-auto cursor-pointer"
                onClick={() => router.push("/")}
              />
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-12">
              <a
                href="/#how-it-works"
                className="text-[#374151] hover:text-[#111827] font-semibold transition-colors text-lg"
              >
                How it Works
              </a>
              <a
                href="/#benefits"
                className="text-[#374151] hover:text-[#111827] font-semibold transition-colors text-lg"
              >
                Benefits
              </a>
              <a
                href="/#testimonials"
                className="text-[#374151] hover:text-[#111827] font-semibold transition-colors text-lg"
              >
                Success Stories
              </a>
              <Button
                variant="ghost"
                onClick={() => router.push("/demo")}
                className="text-[#374151] hover:text-[#111827] font-semibold text-lg"
              >
                <Play className="w-4 h-4 mr-2" />
                Demo
              </Button>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push("/auth/signin")}
                className="font-semibold text-lg px-6 py-3 h-auto text-[#374151] hover:text-[#111827]"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
              <Button
                onClick={() => router.push("/register-interest")}
                className="bg-[#009FFD] hover:bg-[#007ACC] font-semibold text-lg px-6 py-3 shadow-lg h-auto text-white"
              >
                Get Started Free
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-6 border-t border-gray-100">
              <div className="flex flex-col space-y-4">
                <a href="/#how-it-works" className="text-[#374151] hover:text-[#111827] font-semibold py-2 text-lg">
                  How it Works
                </a>
                <a href="/#benefits" className="text-[#374151] hover:text-[#111827] font-semibold py-2 text-lg">
                  Benefits
                </a>
                <a href="/#testimonials" className="text-[#374151] hover:text-[#111827] font-semibold py-2 text-lg">
                  Success Stories
                </a>
                <Button
                  variant="ghost"
                  onClick={() => router.push("/demo")}
                  className="justify-start text-[#374151] hover:text-[#111827] font-semibold text-lg p-2"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Demo
                </Button>
                <div className="flex flex-col space-y-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/auth/signin")}
                    className="w-full text-lg py-3 h-auto border-[#009FFD] text-[#009FFD] hover:bg-[#009FFD] hover:text-white"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                  <Button
                    onClick={() => router.push("/register-interest")}
                    className="w-full bg-[#009FFD] hover:bg-[#007ACC] text-lg py-3 h-auto text-white"
                  >
                    Get Started Free
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* MAIN CONTENT - Keep exactly as it was */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Referral Info */}
          {referralInfo && (
            <div className="mb-8">
              <Alert className="border-green-200 bg-green-50 max-w-2xl mx-auto">
                <Shield className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  You were referred by <strong>{referralInfo.repName}</strong> from {referralInfo.businessName}
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Canceled Payment Alert */}
          {canceled && (
            <div className="mb-8">
              <Alert className="border-yellow-200 bg-yellow-50 max-w-2xl mx-auto">
                <AlertDescription className="text-yellow-800">
                  Payment was canceled. You can try again below.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Step 1: Plan Selection */}
          {currentStep === "plan" && (
            <div className="py-12">
              <PricingCards onPlanSelect={handlePlanSelect} selectedPlan={selectedPlan} selectedCycle={billingCycle} />
            </div>
          )}

          {/* Step 2: Business Details */}
          {currentStep === "details" && selectedPlanData && (
            <div className="max-w-2xl mx-auto py-12">
              <div className="mb-6">
                <Button variant="ghost" onClick={handleBackToPlan} className="mb-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to plans
                </Button>

                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Complete Your {selectedPlanData.name} Plan Setup
                  </h1>
                  <p className="text-gray-600">
                    {formatPrice(
                      billingCycle === "monthly" ? selectedPlanData.monthlyPrice : selectedPlanData.annualPrice,
                    )}
                    /{billingCycle === "monthly" ? "month" : "year"} • Up to{" "}
                    {selectedPlanData.entryLimit.toLocaleString()} entries
                  </p>
                </div>
              </div>

              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                  <CardDescription>Tell us about your business to get started</CardDescription>
                </CardHeader>

                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                          First Name
                        </label>
                        <Input id="firstName" name="firstName" required />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                          Last Name
                        </label>
                        <Input id="lastName" name="lastName" required />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="businessName" className="text-sm font-medium text-gray-700">
                        Business Name
                      </label>
                      <Input id="businessName" name="businessName" required />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email Address
                      </label>
                      <Input id="email" name="email" type="email" required />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="password" className="text-sm font-medium text-gray-700">
                        Password
                      </label>
                      <Input id="password" name="password" type="password" required />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                        Confirm Password
                      </label>
                      <Input id="confirmPassword" name="confirmPassword" type="password" required />
                    </div>

                    {error && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertDescription className="text-red-800">{error}</AlertDescription>
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                      disabled={isLoading}
                      size="lg"
                    >
                      Continue to Payment
                    </Button>
                  </form>

                  <div className="mt-4 text-xs text-gray-500 text-center">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                    <br />
                    Secure payment processing by Stripe.
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Processing */}
          {currentStep === "processing" && (
            <div className="max-w-md mx-auto text-center py-12">
              <Card>
                <CardContent className="pt-6">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-pink-500" />
                  <h3 className="text-lg font-semibold mb-2">Setting up your account...</h3>
                  <p className="text-gray-600">You'll be redirected to complete your payment securely.</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* EXACT SAME FOOTER FROM HOMEPAGE */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <img
                src="/images/reward-labs-new-logo.jpg"
                alt="Reward Labs"
                className="h-12 w-auto mb-6 cursor-pointer"
                onClick={() => router.push("/")}
              />
              <p className="text-gray-300 text-lg leading-relaxed max-w-md">
                The easiest way to run giveaways that grow your business. We handle the prizes, you get the leads.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-xl mb-6">Product</h3>
              <ul className="space-y-4 text-gray-300">
                <li>
                  <a href="/#benefits" className="hover:text-white transition-colors">
                    Benefits
                  </a>
                </li>
                <li>
                  <a href="/#testimonials" className="hover:text-white transition-colors">
                    Success Stories
                  </a>
                </li>
                <li>
                  <a href="/demo" className="hover:text-white transition-colors">
                    Demo
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-xl mb-6">Support</h3>
              <ul className="space-y-4 text-gray-300">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="/terms-and-conditions" className="hover:text-white transition-colors">
                    Terms & Privacy
                  </a>
                </li>
                <li>
                  <a href="/auth/signin" className="hover:text-white transition-colors">
                    Sign In
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Reward Labs. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
