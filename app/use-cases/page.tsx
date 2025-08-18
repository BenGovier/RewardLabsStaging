"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Calendar,
  RefreshCw,
  Crown,
  Zap,
  Target,
  ArrowRight,
  CheckCircle,
  Play,
  TrendingUp,
  Star,
  Mail,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function UseCasesPage() {
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
          <h1 className="text-5xl sm:text-6xl font-black text-[#111827] mb-6">Ways to Use Reward Labs</h1>
          <p className="text-xl text-[#374151] max-w-3xl mx-auto mb-12">
            From monthly engagement campaigns to flash giveaways, discover the tactical ways businesses are using Reward
            Labs to grow their customer base and boost engagement.
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-[#6B7280]">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-[#FFAF40]" />
              <span>5-minute setup</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-[#FFAF40]" />
              <span>We handle prizes</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-[#FFAF40]" />
              <span>Export all data</span>
            </div>
          </div>
        </div>
      </section>

      {/* Monthly Giveaways for Engagement */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="w-20 h-20 bg-gradient-to-br from-[#009FFD]/10 to-[#009FFD]/20 rounded-2xl flex items-center justify-center mb-8">
                <Calendar className="w-10 h-10 text-[#009FFD]" />
              </div>
              <h2 className="text-4xl font-black text-[#111827] mb-6">Monthly Giveaways for Engagement</h2>
              <p className="text-xl text-[#374151] mb-8 leading-relaxed">
                Build anticipation and keep your audience engaged with regular monthly prize draws. Perfect for
                maintaining consistent touchpoints with your customers.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                  <span className="text-lg text-[#374151]">Consistent monthly engagement</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                  <span className="text-lg text-[#374151]">Build anticipation and loyalty</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                  <span className="text-lg text-[#374151]">Regular content for social media</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                  <span className="text-lg text-[#374151]">Predictable lead generation</span>
                </li>
              </ul>
              <div className="bg-gradient-to-r from-[#009FFD]/10 to-[#009FFD]/5 p-6 rounded-xl">
                <div className="flex items-center mb-3">
                  <TrendingUp className="w-5 h-5 text-[#009FFD] mr-2" />
                  <span className="font-semibold text-[#111827]">Best for:</span>
                </div>
                <p className="text-[#374151]">
                  E-commerce stores, subscription services, and content creators looking for consistent engagement.
                </p>
              </div>
            </div>
            <div className="relative">
              <Card className="p-8 shadow-xl bg-gradient-to-br from-[#009FFD]/5 to-[#009FFD]/10">
                <CardContent className="p-0">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-[#009FFD] mb-2">+312%</div>
                    <div className="text-sm text-[#374151] mb-6">increase in social media engagement</div>
                    <div className="flex items-center justify-center space-x-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-[#FFAF40] fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-lg text-[#374151] italic">
                      "Our monthly giveaways have become the most anticipated content we post. Engagement has
                      skyrocketed and our community is more active than ever."
                    </blockquote>
                    <div className="mt-4 font-semibold text-[#111827]">Emma K., Social Media Manager</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Re-engagement Campaigns */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <Card className="p-8 shadow-xl bg-gradient-to-br from-[#2A2A72]/5 to-[#2A2A72]/10">
                <CardContent className="p-0">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-[#2A2A72] mb-2">+89%</div>
                    <div className="text-sm text-[#374151] mb-6">of dormant subscribers re-engaged</div>
                    <div className="flex items-center justify-center space-x-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-[#FFAF40] fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-lg text-[#374151] italic">
                      "We were about to clean our email list when we tried a re-engagement giveaway. 89% of our 'dead'
                      subscribers came back to life!"
                    </blockquote>
                    <div className="mt-4 font-semibold text-[#111827]">Marcus T., Email Marketing Manager</div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="order-1 lg:order-2">
              <div className="w-20 h-20 bg-gradient-to-br from-[#2A2A72]/10 to-[#2A2A72]/20 rounded-2xl flex items-center justify-center mb-8">
                <RefreshCw className="w-10 h-10 text-[#2A2A72]" />
              </div>
              <h2 className="text-4xl font-black text-[#111827] mb-6">Re-engagement Campaigns for Dormant Lists</h2>
              <p className="text-xl text-[#374151] mb-8 leading-relaxed">
                Wake up your cold email lists with exciting prize draws. Perfect for bringing back subscribers who
                haven't engaged in months.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                  <span className="text-lg text-[#374151]">Revive dormant email subscribers</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                  <span className="text-lg text-[#374151]">Improve email deliverability</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                  <span className="text-lg text-[#374151]">Segment active vs inactive users</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                  <span className="text-lg text-[#374151]">Cost-effective list cleaning</span>
                </li>
              </ul>
              <div className="bg-gradient-to-r from-[#2A2A72]/10 to-[#2A2A72]/5 p-6 rounded-xl">
                <div className="flex items-center mb-3">
                  <Mail className="w-5 h-5 text-[#2A2A72] mr-2" />
                  <span className="font-semibold text-[#111827]">Best for:</span>
                </div>
                <p className="text-[#374151]">
                  Businesses with large email lists, SaaS companies, and anyone with declining email engagement rates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Loyalty Raffles for VIPs */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="w-20 h-20 bg-gradient-to-br from-[#FFAF40]/10 to-[#FFAF40]/20 rounded-2xl flex items-center justify-center mb-8">
                <Crown className="w-10 h-10 text-[#FFAF40]" />
              </div>
              <h2 className="text-4xl font-black text-[#111827] mb-6">Loyalty Raffles for VIPs</h2>
              <p className="text-xl text-[#374151] mb-8 leading-relaxed">
                Reward your best customers with exclusive prize draws. Perfect for increasing customer lifetime value
                and building brand advocates.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                  <span className="text-lg text-[#374151]">Exclusive VIP-only prizes</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                  <span className="text-lg text-[#374151]">Increase customer lifetime value</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                  <span className="text-lg text-[#374151]">Build brand advocates</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                  <span className="text-lg text-[#374151]">Encourage repeat purchases</span>
                </li>
              </ul>
              <div className="bg-gradient-to-r from-[#FFAF40]/10 to-[#FFAF40]/5 p-6 rounded-xl">
                <div className="flex items-center mb-3">
                  <Crown className="w-5 h-5 text-[#FFAF40] mr-2" />
                  <span className="font-semibold text-[#111827]">Best for:</span>
                </div>
                <p className="text-[#374151]">
                  Premium brands, subscription services, and businesses with established customer tiers or loyalty
                  programs.
                </p>
              </div>
            </div>
            <div className="relative">
              <Card className="p-8 shadow-xl bg-gradient-to-br from-[#FFAF40]/5 to-[#FFAF40]/10">
                <CardContent className="p-0">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-[#FFAF40] mb-2">+156%</div>
                    <div className="text-sm text-[#374151] mb-6">increase in repeat purchases</div>
                    <div className="flex items-center justify-center space-x-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-[#FFAF40] fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-lg text-[#374151] italic">
                      "Our VIP customers feel truly valued with exclusive monthly draws. They're buying more frequently
                      and referring friends constantly."
                    </blockquote>
                    <div className="mt-4 font-semibold text-[#111827]">Rachel P., Customer Success Manager</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Seasonal or Flash Giveaways */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <Card className="p-8 shadow-xl bg-gradient-to-br from-[#009FFD]/5 to-[#009FFD]/10">
                <CardContent className="p-0">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-[#009FFD] mb-2">+423%</div>
                    <div className="text-sm text-[#374151] mb-6">spike in website traffic during flash sales</div>
                    <div className="flex items-center justify-center space-x-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-[#FFAF40] fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-lg text-[#374151] italic">
                      "Our Black Friday flash giveaway created massive buzz. We had more traffic in 48 hours than we
                      usually get in a month!"
                    </blockquote>
                    <div className="mt-4 font-semibold text-[#111827]">Jake M., E-commerce Director</div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="order-1 lg:order-2">
              <div className="w-20 h-20 bg-gradient-to-br from-[#009FFD]/10 to-[#009FFD]/20 rounded-2xl flex items-center justify-center mb-8">
                <Zap className="w-10 h-10 text-[#009FFD]" />
              </div>
              <h2 className="text-4xl font-black text-[#111827] mb-6">Seasonal or Flash Giveaways</h2>
              <p className="text-xl text-[#374151] mb-8 leading-relaxed">
                Create urgency and excitement with time-limited prize draws. Perfect for product launches, seasonal
                sales, or creating viral moments.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                  <span className="text-lg text-[#374151]">Create urgency and FOMO</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                  <span className="text-lg text-[#374151]">Boost seasonal sales</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                  <span className="text-lg text-[#374151]">Generate viral social sharing</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                  <span className="text-lg text-[#374151]">Rapid lead collection</span>
                </li>
              </ul>
              <div className="bg-gradient-to-r from-[#009FFD]/10 to-[#009FFD]/5 p-6 rounded-xl">
                <div className="flex items-center mb-3">
                  <Zap className="w-5 h-5 text-[#009FFD] mr-2" />
                  <span className="font-semibold text-[#111827]">Best for:</span>
                </div>
                <p className="text-[#374151]">
                  Product launches, holiday sales, event promotions, and any time you need to create immediate buzz and
                  urgency.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lead Magnet Campaigns */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="w-20 h-20 bg-gradient-to-br from-[#2A2A72]/10 to-[#2A2A72]/20 rounded-2xl flex items-center justify-center mb-8">
                <Target className="w-10 h-10 text-[#2A2A72]" />
              </div>
              <h2 className="text-4xl font-black text-[#111827] mb-6">Lead Magnet Campaigns from Paid Ads</h2>
              <p className="text-xl text-[#374151] mb-8 leading-relaxed">
                Turn your paid traffic into qualified leads with irresistible prize draws. Perfect for maximizing ROI
                from Facebook, Google, and TikTok ads.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                  <span className="text-lg text-[#374151]">Higher conversion rates than traditional lead magnets</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                  <span className="text-lg text-[#374151]">Maximize paid traffic ROI</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                  <span className="text-lg text-[#374151]">Collect qualified leads at scale</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                  <span className="text-lg text-[#374151]">Perfect for retargeting campaigns</span>
                </li>
              </ul>
              <div className="bg-gradient-to-r from-[#2A2A72]/10 to-[#2A2A72]/5 p-6 rounded-xl">
                <div className="flex items-center mb-3">
                  <Target className="w-5 h-5 text-[#2A2A72] mr-2" />
                  <span className="font-semibold text-[#111827]">Best for:</span>
                </div>
                <p className="text-[#374151]">
                  Performance marketers, agencies running paid campaigns, and businesses looking to scale lead
                  generation quickly.
                </p>
              </div>
            </div>
            <div className="relative">
              <Card className="p-8 shadow-xl bg-gradient-to-br from-[#2A2A72]/5 to-[#2A2A72]/10">
                <CardContent className="p-0">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-[#2A2A72] mb-2">67%</div>
                    <div className="text-sm text-[#374151] mb-6">
                      higher conversion rate vs traditional lead magnets
                    </div>
                    <div className="flex items-center justify-center space-x-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-[#FFAF40] fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-lg text-[#374151] italic">
                      "We replaced our PDF lead magnets with giveaway campaigns and saw conversion rates jump from 12%
                      to 67%. Our cost per lead dropped dramatically."
                    </blockquote>
                    <div className="mt-4 font-semibold text-[#111827]">Alex R., Performance Marketing Manager</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Setup Guide */}
      <section className="py-24 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-[#111827] mb-6">
              Ready to Launch Your First Campaign?
            </h2>
            <p className="text-xl text-[#374151] max-w-3xl mx-auto">
              Choose your use case and get started in minutes. We'll handle the prizes, you keep the leads.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-gradient-to-br from-[#009FFD]/10 to-[#009FFD]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-[#009FFD]">1</span>
                </div>
                <h3 className="text-xl font-bold text-[#111827] mb-2">Choose Your Campaign Type</h3>
                <p className="text-[#374151]">
                  Select from monthly engagement, flash giveaways, VIP rewards, or lead magnets.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-gradient-to-br from-[#2A2A72]/10 to-[#2A2A72]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-[#2A2A72]">2</span>
                </div>
                <h3 className="text-xl font-bold text-[#111827] mb-2">Customize & Brand</h3>
                <p className="text-[#374151]">
                  Add your logo, colors, and custom entry questions. Make it yours in minutes.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-gradient-to-br from-[#FFAF40]/10 to-[#FFAF40]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-[#FFAF40]">3</span>
                </div>
                <h3 className="text-xl font-bold text-[#111827] mb-2">Launch & Collect Leads</h3>
                <p className="text-[#374151]">
                  Share your link, watch entries roll in, and export your qualified leads.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button
              size="lg"
              onClick={() => router.push("/register-interest")}
              className="bg-gradient-to-r from-[#FFAF40] to-[#FF9500] hover:from-[#FF9500] hover:to-[#FF8500] text-xl px-12 py-6 h-auto shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-white font-bold rounded-xl mr-4"
            >
              Get Started
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/demo")}
              className="border-2 border-[#009FFD] text-[#009FFD] hover:bg-[#009FFD] hover:text-white text-xl px-12 py-6 h-auto shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
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
