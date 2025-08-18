"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, Users, Briefcase, Building, Utensils, ArrowRight, CheckCircle, Play, Star } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function WhoItsForPage() {
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
          <h1 className="text-5xl sm:text-6xl font-black text-[#111827] mb-6">Who Reward Labs Is For</h1>
          <p className="text-xl text-[#374151] max-w-3xl mx-auto mb-12">
            From e-commerce stores to marketing agencies, discover how businesses like yours are using Reward Labs to
            grow their customer base and boost engagement.
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-[#6B7280]">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-[#FFAF40]" />
              <span>No setup required</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-[#FFAF40]" />
              <span>We supply prizes</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-[#FFAF40]" />
              <span>Keep all leads</span>
            </div>
          </div>
        </div>
      </section>

      {/* E-commerce & Online Stores */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="w-20 h-20 bg-gradient-to-br from-[#009FFD]/10 to-[#009FFD]/20 rounded-2xl flex items-center justify-center mb-8">
                <ShoppingCart className="w-10 h-10 text-[#009FFD]" />
              </div>
              <h2 className="text-4xl font-black text-[#111827] mb-6">E-commerce & Online Stores</h2>
              <p className="text-xl text-[#374151] mb-8 leading-relaxed">
                Run raffles for product launches, clearances, or seasonal boosts. Perfect for growing your email list
                and increasing repeat purchases.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                  <span className="text-lg text-[#374151]">Product launch campaigns</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                  <span className="text-lg text-[#374151]">Seasonal sales boosters</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                  <span className="text-lg text-[#374151]">Abandoned cart recovery</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                  <span className="text-lg text-[#374151]">Customer retention campaigns</span>
                </li>
              </ul>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => router.push("/use-cases")}
                  variant="outline"
                  className="border-[#009FFD] text-[#009FFD] hover:bg-[#009FFD] hover:text-white"
                >
                  See Example Campaigns
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  onClick={() => router.push("/demo")}
                  variant="ghost"
                  className="text-[#009FFD] hover:text-[#007ACC]"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Book a Demo
                </Button>
              </div>
            </div>
            <div className="relative">
              <Card className="p-8 shadow-xl bg-gradient-to-br from-[#009FFD]/5 to-[#009FFD]/10">
                <CardContent className="p-0">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-[#009FFD] mb-2">+4,800</div>
                    <div className="text-sm text-[#374151] mb-6">new email subscribers in 30 days</div>
                    <div className="flex items-center justify-center space-x-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-[#FFAF40] fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-lg text-[#374151] italic">
                      "Our monthly giveaways have become the highlight of our marketing calendar. Customers love them
                      and engagement is through the roof."
                    </blockquote>
                    <div className="mt-4 font-semibold text-[#111827]">Sarah M., Online Store Owner</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Businesses */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <Card className="p-8 shadow-xl bg-gradient-to-br from-[#2A2A72]/5 to-[#2A2A72]/10">
                <CardContent className="p-0">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-[#2A2A72] mb-2">-34%</div>
                    <div className="text-sm text-[#374151] mb-6">reduction in customer churn</div>
                    <div className="flex items-center justify-center space-x-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-[#FFAF40] fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-lg text-[#374151] italic">
                      "The monthly draws give our subscribers something to look forward to. It's completely transformed
                      our retention rates."
                    </blockquote>
                    <div className="mt-4 font-semibold text-[#111827]">Mike J., SaaS Founder</div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="order-1 lg:order-2">
              <div className="w-20 h-20 bg-gradient-to-br from-[#2A2A72]/10 to-[#2A2A72]/20 rounded-2xl flex items-center justify-center mb-8">
                <Users className="w-10 h-10 text-[#2A2A72]" />
              </div>
              <h2 className="text-4xl font-black text-[#111827] mb-6">Subscription Businesses</h2>
              <p className="text-xl text-[#374151] mb-8 leading-relaxed">
                Keep members engaged and reduce churn with monthly draws. Perfect for SaaS, memberships, and
                subscription boxes.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                  <span className="text-lg text-[#374151]">Monthly member rewards</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                  <span className="text-lg text-[#374151]">Churn reduction campaigns</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                  <span className="text-lg text-[#374151]">New subscriber incentives</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                  <span className="text-lg text-[#374151]">Loyalty tier rewards</span>
                </li>
              </ul>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => router.push("/use-cases")}
                  variant="outline"
                  className="border-[#2A2A72] text-[#2A2A72] hover:bg-[#2A2A72] hover:text-white"
                >
                  See Example Campaigns
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  onClick={() => router.push("/demo")}
                  variant="ghost"
                  className="text-[#2A2A72] hover:text-[#1F1F5C]"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Book a Demo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marketing Agencies */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="w-20 h-20 bg-gradient-to-br from-[#FFAF40]/10 to-[#FFAF40]/20 rounded-2xl flex items-center justify-center mb-8">
                <Briefcase className="w-10 h-10 text-[#FFAF40]" />
              </div>
              <h2 className="text-4xl font-black text-[#111827] mb-6">Marketing Agencies</h2>
              <p className="text-xl text-[#374151] mb-8 leading-relaxed">
                Offer done-for-you raffles to your clients as a white-label solution. Add a new revenue stream while
                delivering real results.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                  <span className="text-lg text-[#374151]">White-label campaigns</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                  <span className="text-lg text-[#374151]">Client lead generation</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                  <span className="text-lg text-[#374151]">New service offering</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                  <span className="text-lg text-[#374151]">Recurring revenue model</span>
                </li>
              </ul>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => router.push("/use-cases")}
                  variant="outline"
                  className="border-[#FFAF40] text-[#FFAF40] hover:bg-[#FFAF40] hover:text-white"
                >
                  See Example Campaigns
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  onClick={() => router.push("/demo")}
                  variant="ghost"
                  className="text-[#FFAF40] hover:text-[#FF9500]"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Book a Demo
                </Button>
              </div>
            </div>
            <div className="relative">
              <Card className="p-8 shadow-xl bg-gradient-to-br from-[#FFAF40]/5 to-[#FFAF40]/10">
                <CardContent className="p-0">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-[#FFAF40] mb-2">+2,100</div>
                    <div className="text-sm text-[#374151] mb-6">qualified leads for clients</div>
                    <div className="flex items-center justify-center space-x-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-[#FFAF40] fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-lg text-[#374151] italic">
                      "We've added giveaway campaigns as a core service. Clients love the results and it's become a
                      major revenue driver for us."
                    </blockquote>
                    <div className="mt-4 font-semibold text-[#111827]">David C., Agency Owner</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Local & Service-Based Businesses */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <Card className="p-8 shadow-xl bg-gradient-to-br from-[#009FFD]/5 to-[#009FFD]/10">
                <CardContent className="p-0">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-[#009FFD] mb-2">+67%</div>
                    <div className="text-sm text-[#374151] mb-6">increase in foot traffic</div>
                    <div className="flex items-center justify-center space-x-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-[#FFAF40] fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-lg text-[#374151] italic">
                      "The local giveaways have brought so many new faces through our doors. It's the best marketing
                      investment we've made."
                    </blockquote>
                    <div className="mt-4 font-semibold text-[#111827]">Lisa R., Local Business Owner</div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="order-1 lg:order-2">
              <div className="w-20 h-20 bg-gradient-to-br from-[#009FFD]/10 to-[#009FFD]/20 rounded-2xl flex items-center justify-center mb-8">
                <Building className="w-10 h-10 text-[#009FFD]" />
              </div>
              <h2 className="text-4xl font-black text-[#111827] mb-6">Local & Service-Based Businesses</h2>
              <p className="text-xl text-[#374151] mb-8 leading-relaxed">
                Reward footfall, increase referrals, or collect leads from walk-ins. Perfect for building a loyal local
                customer base.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                  <span className="text-lg text-[#374151]">Local community engagement</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                  <span className="text-lg text-[#374151]">Referral reward programs</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                  <span className="text-lg text-[#374151]">Walk-in lead capture</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                  <span className="text-lg text-[#374151]">Seasonal promotions</span>
                </li>
              </ul>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => router.push("/use-cases")}
                  variant="outline"
                  className="border-[#009FFD] text-[#009FFD] hover:bg-[#009FFD] hover:text-white"
                >
                  See Example Campaigns
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  onClick={() => router.push("/demo")}
                  variant="ghost"
                  className="text-[#009FFD] hover:text-[#007ACC]"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Book a Demo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hospitality & Leisure */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="w-20 h-20 bg-gradient-to-br from-[#2A2A72]/10 to-[#2A2A72]/20 rounded-2xl flex items-center justify-center mb-8">
                <Utensils className="w-10 h-10 text-[#2A2A72]" />
              </div>
              <h2 className="text-4xl font-black text-[#111827] mb-6">Hospitality & Leisure</h2>
              <p className="text-xl text-[#374151] mb-8 leading-relaxed">
                Perfect for gyms, hotels, restaurants, and entertainment venues. Offer off-peak incentives and loyalty
                draws with zero extra effort.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                  <span className="text-lg text-[#374151]">Off-peak promotions</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                  <span className="text-lg text-[#374151]">Member loyalty rewards</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                  <span className="text-lg text-[#374151]">Event bookings boost</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                  <span className="text-lg text-[#374151]">Social media engagement</span>
                </li>
              </ul>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => router.push("/use-cases")}
                  variant="outline"
                  className="border-[#2A2A72] text-[#2A2A72] hover:bg-[#2A2A72] hover:text-white"
                >
                  See Example Campaigns
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  onClick={() => router.push("/demo")}
                  variant="ghost"
                  className="text-[#2A2A72] hover:text-[#1F1F5C]"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Book a Demo
                </Button>
              </div>
            </div>
            <div className="relative">
              <Card className="p-8 shadow-xl bg-gradient-to-br from-[#2A2A72]/5 to-[#2A2A72]/10">
                <CardContent className="p-0">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-[#2A2A72] mb-2">+89%</div>
                    <div className="text-sm text-[#374151] mb-6">increase in off-peak bookings</div>
                    <div className="flex items-center justify-center space-x-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-[#FFAF40] fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-lg text-[#374151] italic">
                      "The monthly draws have completely filled our quiet periods. Our members love the surprise rewards
                      and it's boosted retention significantly."
                    </blockquote>
                    <div className="mt-4 font-semibold text-[#111827]">Tom H., Gym Owner</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-r from-[#2A2A72] to-[#009FFD] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-black mb-6">Ready to Start Growing?</h2>
          <p className="text-xl mb-12 opacity-90">
            Join businesses like yours who are already using Reward Labs to grow their customer base
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
              <Play className="mr-3 h-6 w-6" />
              Watch Demo (0:45)
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
