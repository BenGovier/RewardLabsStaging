"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, CheckCircle, Star } from "lucide-react"

interface BenefitPageLayoutProps {
  title: string
  subtitle: string
  heroIcon: React.ReactNode
  heroColor: string
  stats: Array<{
    number: string
    label: string
    description: string
  }>
  features: Array<{
    icon: React.ReactNode
    title: string
    description: string
  }>
  testimonial: {
    quote: string
    author: string
    role: string
    company: string
    image: string
    result: string
  }
  caseStudy: {
    title: string
    description: string
    results: string[]
  }
}

export default function BenefitPageLayout({
  title,
  subtitle,
  heroIcon,
  heroColor,
  stats,
  features,
  testimonial,
  caseStudy,
}: BenefitPageLayoutProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <img src="/images/reward-labs-main-logo.png" alt="Reward Labs" className="h-14 w-auto" />
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push("/")}
                className="font-semibold text-lg px-6 py-3 h-auto text-[#374151] hover:text-[#111827]"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <Button
                onClick={() => router.push("/register-interest")}
                className="bg-[#009FFD] hover:bg-[#007ACC] font-semibold text-lg px-6 py-3 shadow-lg h-auto text-white"
              >
                Get Started Free
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={`relative overflow-hidden bg-gradient-to-br ${heroColor} py-20`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
            {heroIcon}
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight mb-8">{title}</h1>

          <p className="text-xl sm:text-2xl text-white/90 leading-relaxed mb-12 max-w-3xl mx-auto">{subtitle}</p>

          <Button
            size="lg"
            onClick={() => router.push("/register-interest")}
            className="bg-white text-[#009FFD] hover:bg-gray-100 font-bold text-xl px-10 py-6 h-auto shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            Start Growing Today
            <ArrowRight className="ml-3 h-6 w-6" />
          </Button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="text-5xl font-bold text-[#009FFD] mb-4">{stat.number}</div>
                  <h3 className="text-xl font-bold text-[#111827] mb-2">{stat.label}</h3>
                  <p className="text-[#374151]">{stat.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-[#111827] mb-6">How It Works</h2>
            <p className="text-xl text-[#374151] max-w-3xl mx-auto">
              Everything you need to succeed with {title.toLowerCase()}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300 group bg-white"
              >
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#009FFD]/10 to-[#009FFD]/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-[#111827] mb-4">{feature.title}</h3>
                  <p className="text-[#374151] leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-12 border-0 shadow-2xl bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="p-0 text-center">
              <div className="flex items-center justify-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-[#FFAF40] fill-current" />
                ))}
              </div>

              <blockquote className="text-2xl sm:text-3xl text-[#111827] leading-relaxed mb-8 font-medium">
                "{testimonial.quote}"
              </blockquote>

              <div className="flex items-center justify-center mb-6">
                <img
                  src={testimonial.image || "/placeholder.svg"}
                  alt={testimonial.author}
                  className="w-16 h-16 rounded-full mr-6 object-cover"
                />
                <div className="text-left">
                  <div className="font-bold text-xl text-[#111827]">{testimonial.author}</div>
                  <div className="text-[#374151]">
                    {testimonial.role}, {testimonial.company}
                  </div>
                  <div className="text-[#009FFD] font-bold text-lg mt-1">{testimonial.result}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Case Study Section */}
      <section className="py-20 bg-[#F9FAFB]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#111827] mb-6">{caseStudy.title}</h2>
            <p className="text-xl text-[#374151] leading-relaxed">{caseStudy.description}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {caseStudy.results.map((result, index) => (
              <div key={index} className="flex items-center bg-white p-6 rounded-xl shadow-lg">
                <CheckCircle className="w-8 h-8 text-[#FFAF40] mr-4 flex-shrink-0" />
                <p className="text-[#374151] font-medium">{result}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#2A2A72] to-[#009FFD] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-8">Ready to Get Started?</h2>
          <p className="text-xl mb-12 opacity-90">
            Join thousands of businesses using Reward Labs to {title.toLowerCase()}
          </p>

          <Button
            size="lg"
            onClick={() => router.push("/register-interest")}
            className="bg-white text-[#009FFD] hover:bg-gray-100 font-bold text-xl px-10 py-6 h-auto shadow-xl hover:shadow-2xl transition-all duration-300 mb-8"
          >
            Get Started Free
            <ArrowRight className="ml-3 h-6 w-6" />
          </Button>

          <p className="text-lg opacity-90 mb-2">No setup required • GDPR safe • We provide the prize</p>
          <p className="text-sm opacity-75">Takes 30 seconds. We do the rest.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <img src="/images/reward-labs-main-logo.png" alt="Reward Labs" className="h-12 w-auto mb-6" />
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
