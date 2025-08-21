"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  CheckCircle,
  ArrowRight,
  Phone,
  Mail,
  Zap,
  Crown,
  Rocket,
  Star,
  Gift,
  Users,
  BarChart3,
  Shield,
  Clock,
  Download,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function PricingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center">
              <img src="/images/reward-labs-logo-new.png" alt="Reward Labs" className="h-16 w-auto" />
            </Link>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push("/auth/signin")}
                className="font-semibold text-lg px-6 py-3 h-auto text-[#374151] hover:text-[#111827]"
              >
                Sign In
              </Button>
              <Button
                onClick={() => router.push("/register-interest")}
                className="bg-[#009FFD] hover:bg-[#007ACC] font-semibold text-lg px-6 py-3 shadow-lg h-auto text-white"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl sm:text-6xl font-black text-[#111827] mb-6">Simple, Transparent Pricing</h1>
          <p className="text-xl text-[#374151] max-w-3xl mx-auto mb-12">
            Choose a plan that fits your growth. Every plan includes branded raffles, prize sourcing, and full access to
            your leads — no contracts, no setup fees.
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-[#6B7280]">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-[#FFAF40]" />
              <span>No setup fees</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-[#FFAF40]" />
              <span>No contracts</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-[#FFAF40]" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Table */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <Card className="p-8 border-2 border-gray-200 hover:border-[#009FFD] transition-colors relative">
              <CardContent className="p-0">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#009FFD]/10 to-[#009FFD]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-[#009FFD]" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#111827] mb-2">Starter Plan</h3>
                  <div className="text-4xl font-black text-[#111827] mb-2">
                    £149<span className="text-lg font-normal text-[#6B7280]">/month</span>
                  </div>
                  <p className="text-[#6B7280]">Perfect for small businesses getting started</p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3 flex-shrink-0" />
                    <span className="text-[#374151]">250 customer entries per month</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3 flex-shrink-0" />
                    <span className="text-[#374151]">12 branded giveaways per year</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3 flex-shrink-0" />
                    <span className="text-[#374151]">We supply the prize (up to £50/month)</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3 flex-shrink-0" />
                    <span className="text-[#374151]">Download all customer data</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3 flex-shrink-0" />
                    <span className="text-[#374151]">Email support</span>
                  </li>
                </ul>

                <div className="bg-[#009FFD]/5 p-4 rounded-lg mb-6">
                  <p className="text-sm text-[#374151] font-medium">
                    ✅ Great for solo founders or small business owners
                  </p>
                </div>

                <Button
                  onClick={() => router.push("/register-interest")}
                  className="w-full bg-[#009FFD] hover:bg-[#007ACC] text-white font-semibold py-3"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Growth Plan - Most Popular */}
            <Card className="p-8 border-2 border-[#FFAF40] hover:border-[#FF9500] transition-colors relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-[#FFAF40] to-[#FF9500] text-white px-6 py-2 rounded-full text-sm font-bold">
                  MOST POPULAR
                </div>
              </div>
              <CardContent className="p-0">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#FFAF40]/10 to-[#FFAF40]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Crown className="w-8 h-8 text-[#FFAF40]" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#111827] mb-2">Growth Plan</h3>
                  <div className="text-4xl font-black text-[#111827] mb-2">
                    £449<span className="text-lg font-normal text-[#6B7280]">/month</span>
                  </div>
                  <p className="text-[#6B7280]">Ideal for growing businesses and agencies</p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3 flex-shrink-0" />
                    <span className="text-[#374151]">1,500 customer entries per month</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3 flex-shrink-0" />
                    <span className="text-[#374151]">12 branded giveaways per year</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3 flex-shrink-0" />
                    <span className="text-[#374151]">Prize sourcing included (up to £75/month)</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3 flex-shrink-0" />
                    <span className="text-[#374151]">Custom entry forms</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3 flex-shrink-0" />
                    <span className="text-[#374151]">Priority email/chat support</span>
                  </li>
                </ul>

                <div className="bg-[#FFAF40]/5 p-4 rounded-lg mb-6">
                  <p className="text-sm text-[#374151] font-medium">
                    ✅ Most popular – ideal for e-commerce brands or ad agencies
                  </p>
                </div>

                <Button
                  onClick={() => router.push("/register-interest")}
                  className="w-full bg-gradient-to-r from-[#FFAF40] to-[#FF9500] hover:from-[#FF9500] hover:to-[#FF8500] text-white font-semibold py-3"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Professional Plan */}
            <Card className="p-8 border-2 border-gray-200 hover:border-[#2A2A72] transition-colors relative">
              <CardContent className="p-0">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#2A2A72]/10 to-[#2A2A72]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Rocket className="w-8 h-8 text-[#2A2A72]" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#111827] mb-2">Professional Plan</h3>
                  <div className="text-4xl font-black text-[#111827] mb-2">
                    £999<span className="text-lg font-normal text-[#6B7280]">/month</span>
                  </div>
                  <p className="text-[#6B7280]">For scale-ups and high-volume campaigns</p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3 flex-shrink-0" />
                    <span className="text-[#374151]">5,000 customer entries per month</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3 flex-shrink-0" />
                    <span className="text-[#374151]">Unlimited branded giveaways</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3 flex-shrink-0" />
                    <span className="text-[#374151]">Premium prize sourcing (up to £150/month)</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3 flex-shrink-0" />
                    <span className="text-[#374151]">API integration</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3 flex-shrink-0" />
                    <span className="text-[#374151]">Dedicated account manager</span>
                  </li>
                </ul>

                <div className="bg-[#2A2A72]/5 p-4 rounded-lg mb-6">
                  <p className="text-sm text-[#374151] font-medium">
                    ✅ For scale-ups, agencies, and high-volume lead gen teams
                  </p>
                </div>

                <Button
                  onClick={() => router.push("/register-interest")}
                  className="w-full bg-[#2A2A72] hover:bg-[#1F1F5C] text-white font-semibold py-3"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What's Included in Every Plan */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-[#111827] mb-6">What's Included in Every Plan</h2>
            <p className="text-xl text-[#374151] max-w-3xl mx-auto">
              Every Reward Labs plan comes with everything you need to run successful giveaway campaigns
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#009FFD]/10 to-[#009FFD]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-[#009FFD]" />
              </div>
              <h3 className="text-lg font-bold text-[#111827] mb-2">Branded giveaway pages</h3>
              <p className="text-[#6B7280] text-sm">Fully customizable with your logo, colors, and branding</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#FFAF40]/10 to-[#FFAF40]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-[#FFAF40]" />
              </div>
              <h3 className="text-lg font-bold text-[#111827] mb-2">We supply the prizes</h3>
              <p className="text-[#6B7280] text-sm">High-value prizes sourced and delivered by us</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#2A2A72]/10 to-[#2A2A72]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-[#2A2A72]" />
              </div>
              <h3 className="text-lg font-bold text-[#111827] mb-2">Custom entry forms</h3>
              <p className="text-[#6B7280] text-sm">Collect exactly the data you need from entrants</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#009FFD]/10 to-[#009FFD]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-[#009FFD]" />
              </div>
              <h3 className="text-lg font-bold text-[#111827] mb-2">Automated draw system</h3>
              <p className="text-[#6B7280] text-sm">Fair, transparent, and completely automated</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#FFAF40]/10 to-[#FFAF40]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-[#FFAF40]" />
              </div>
              <h3 className="text-lg font-bold text-[#111827] mb-2">Full data exports</h3>
              <p className="text-[#6B7280] text-sm">Export all your leads and campaign data anytime</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#2A2A72]/10 to-[#2A2A72]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-[#2A2A72]" />
              </div>
              <h3 className="text-lg font-bold text-[#111827] mb-2">GDPR-compliant</h3>
              <p className="text-[#6B7280] text-sm">Fully compliant data collection and storage</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#009FFD]/10 to-[#009FFD]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-[#009FFD]" />
              </div>
              <h3 className="text-lg font-bold text-[#111827] mb-2">No contracts or setup fees</h3>
              <p className="text-[#6B7280] text-sm">Start immediately, cancel anytime</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#FFAF40]/10 to-[#FFAF40]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-[#FFAF40]" />
              </div>
              <h3 className="text-lg font-bold text-[#111827] mb-2">Real-time analytics</h3>
              <p className="text-[#6B7280] text-sm">Track entries, engagement, and campaign performance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Need Something Custom */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-black text-[#111827] mb-6">Need Something Bigger?</h2>
          <p className="text-xl text-[#374151] mb-12 max-w-2xl mx-auto">
            If you run frequent campaigns, need more entries, or want white-label options — let's build a custom plan
            for you.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="p-8 text-left">
              <CardContent className="p-0">
                <Phone className="w-12 h-12 text-[#009FFD] mb-4" />
                <h3 className="text-2xl font-bold text-[#111827] mb-4">Book a Call</h3>
                <p className="text-[#374151] mb-6">
                  Speak directly with our team to discuss your specific needs and get a custom quote.
                </p>
                <Button onClick={() => router.push("/demo")} className="bg-[#009FFD] hover:bg-[#007ACC] text-white">
                  Schedule Call
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="p-8 text-left">
              <CardContent className="p-0">
                <Mail className="w-12 h-12 text-[#2A2A72] mb-4" />
                <h3 className="text-2xl font-bold text-[#111827] mb-4">Contact Us</h3>
                <p className="text-[#374151] mb-6">
                  Send us your requirements and we'll get back to you with a custom proposal within 24 hours.
                </p>
                <Button
                  onClick={() => router.push("/register-interest")}
                  variant="outline"
                  className="border-[#2A2A72] text-[#2A2A72] hover:bg-[#2A2A72] hover:text-white"
                >
                  Get in Touch
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gradient-to-r from-[#009FFD]/5 to-[#2A2A72]/5 p-8 rounded-2xl">
            <h3 className="text-2xl font-bold text-[#111827] mb-4">Enterprise Features Available</h3>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div>
                <CheckCircle className="w-5 h-5 text-[#FFAF40] mb-2" />
                <p className="text-[#374151] font-medium">White-label solutions</p>
              </div>
              <div>
                <CheckCircle className="w-5 h-5 text-[#FFAF40] mb-2" />
                <p className="text-[#374151] font-medium">Custom integrations</p>
              </div>
              <div>
                <CheckCircle className="w-5 h-5 text-[#FFAF40] mb-2" />
                <p className="text-[#374151] font-medium">Dedicated support</p>
              </div>
              <div>
                <CheckCircle className="w-5 h-5 text-[#FFAF40] mb-2" />
                <p className="text-[#374151] font-medium">Unlimited entries</p>
              </div>
              <div>
                <CheckCircle className="w-5 h-5 text-[#FFAF40] mb-2" />
                <p className="text-[#374151] font-medium">Premium prize sourcing</p>
              </div>
              <div>
                <CheckCircle className="w-5 h-5 text-[#FFAF40] mb-2" />
                <p className="text-[#374151] font-medium">Advanced analytics</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-r from-[#2A2A72] to-[#009FFD] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-black mb-6">Ready to Start Growing?</h2>
          <p className="text-xl mb-12 opacity-90">
            Join thousands of businesses using Reward Labs to grow their customer base
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button
              size="lg"
              onClick={() => router.push("/register-interest")}
              className="bg-white text-[#009FFD] hover:bg-gray-100 font-semibold text-xl px-10 py-6 h-auto shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              Get Started
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/demo")}
              className="border-2 border-white text-white hover:bg-white hover:text-[#009FFD] text-xl px-10 py-6 h-auto shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Phone className="mr-3 h-6 w-6" />
              Book a Call
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm opacity-75 mt-8">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span>No setup required</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span>We provide prizes</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
