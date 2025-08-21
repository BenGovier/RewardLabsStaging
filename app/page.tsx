"use client"

import type React from "react"

export const dynamic = "force-dynamic"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Play,
  Gift,
  ArrowRight,
  Star,
  Menu,
  X,
  Palette,
  TrendingUp,
  Zap,
  Target,
  Award,
  Clock,
  Sparkles,
  CheckCircle,
  LogIn,
  Quote,
  Users,
  ShoppingCart,
  Building,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Settings,
  TrendingDown,
  MailX,
  UserX,
} from "lucide-react"

// Dynamic Ticket Counter Component
function DynamicTicketCounter() {
  const [ticketCount, setTicketCount] = useState(500000)

  useEffect(() => {
    // Get saved count from localStorage or use default
    const savedCount = localStorage.getItem("rewardLabsTicketCount")
    const initialCount = savedCount ? Number.parseInt(savedCount) : 500000
    setTicketCount(initialCount)

    const increments = [1, 3, 5, 1, 3, 5]
    let incrementIndex = 0

    const interval = setInterval(
      () => {
        setTicketCount((prev) => {
          const newCount = prev + increments[incrementIndex]
          localStorage.setItem("rewardLabsTicketCount", newCount.toString())
          return newCount
        })
        incrementIndex = (incrementIndex + 1) % increments.length
      },
      Math.random() * 3000 + 2000,
    )

    return () => clearInterval(interval)
  }, [])

  return (
    <span className="ml-3 text-lg font-semibold text-[#374151]">{ticketCount.toLocaleString()} tickets issued</span>
  )
}

// Video Modal Component - Fixed
function VideoModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-4xl mx-4">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10 bg-black/50 rounded-full p-2"
        >
          <X className="w-8 h-8" />
        </button>
        <div className="bg-black rounded-2xl overflow-hidden shadow-2xl">
          <div className="relative aspect-video bg-gradient-to-br from-[#2A2A72] to-[#009FFD] flex items-center justify-center">
            <video
              controls
              autoPlay
              muted
              className="w-full h-full object-cover"
              poster="/placeholder.svg?height=400&width=800"
              onError={() => console.log("Video failed to load")}
              onLoadStart={() => console.log("Video loading started")}
            >
              <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screen%20Recording%202025-06-23%20at%2023.30.28-Sgn9QTzObUglweFfkaxxzRACZlKFQa.mp4" type="video/mp4" />
              <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3188988-hd_1920_1080_25fps-vdv0CsC2Ikcc3AdkzD3AZTjWohTvts.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Fallback content if video doesn't load */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8">
              <Play className="w-16 h-16 mb-4 opacity-50" />
              <h3 className="text-2xl font-bold mb-2">Demo Video</h3>
              <p className="text-center opacity-90">See how Reward Labs works in just 45 seconds</p>
              <p className="text-sm opacity-75 mt-4">Video loading... If this persists, please refresh the page.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// UI Demo Modal Component
function UIDemoModal({ isOpen, onClose, demoType }: { isOpen: boolean; onClose: () => void; demoType: string }) {
  if (!isOpen) return null

  const demoContent = {
    setup: {
      title: "Setup Your Giveaway in Minutes",
      description: "Choose your plan and get started with our simple pricing structure",
      image: "/images/ui-setup-screenshot.png",
    },
    branding: {
      title: "Brand Your Giveaway Page",
      description: "Upload your logo, customize colors, and add your branding elements",
      image: "/images/ui-branding-screenshot.png",
    },
    reporting: {
      title: "Track Entries & Export Data",
      description: "Monitor your campaign performance and export leads for follow-up",
      image: "/images/ui-reporting-screenshot.png",
    },
  }

  const demo = demoContent[demoType as keyof typeof demoContent]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-5xl">
        <button onClick={onClose} className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors">
          <X className="w-8 h-8" />
        </button>
        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-2xl font-bold text-[#111827] mb-2">{demo.title}</h3>
            <p className="text-[#374151]">{demo.description}</p>
          </div>
          <div className="p-6">
            <img
              src={demo.image || "/placeholder.svg"}
              alt={demo.title}
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Example Page Modal Component
function ExamplePageModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10 bg-white rounded-full p-2 shadow-lg"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-2xl font-bold text-[#111827] mb-2">Example Giveaway Page</h3>
            <p className="text-[#374151]">This is how your branded giveaway page will look to customers</p>
          </div>
          <div className="p-6">
            <img
              src="/images/example-giveaway-page.png"
              alt="Example Giveaway Page"
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Testimonial Carousel Component
function TestimonialCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const testimonials = [
    {
      quote:
        "We grew our email list by 4,800 contacts in 30 days. Our customers love the monthly giveaways and engagement is through the roof.",
      name: "Sarah Mitchell",
      title: "Owner, Local Café",
      image: "/images/testimonial-woman-1.png",
      logo: "/images/logo-carpbook-new.png",
      metric: "+4,800",
      metricLabel: "leads in 30 days",
      color: "#009FFD",
      business: "Eatinout",
    },
    {
      quote:
        "The insights we get are incredible. We increased our conversion rate by 34% and understand our customers better than ever.",
      name: "Mike Johnson",
      title: "Marketing Director",
      image: "/images/testimonial-man-2.png",
      logo: "/images/logo-wilson-house.png",
      metric: "+34%",
      metricLabel: "conversion rate",
      color: "#2A2A72",
      business: "Wilson House",
    },
    {
      quote:
        "Setup was incredibly easy. Our first giveaway was live in 10 minutes and we collected 2,100 qualified leads.",
      name: "David Chen",
      title: "Founder, Online Store",
      image: "/images/testimonial-man-1.png",
      logo: "/images/logo-tandem.png",
      metric: "+2,100",
      metricLabel: "qualified leads",
      color: "#FFAF40",
      business: "AJX Capital",
    },
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <div className="relative">
      {/* Desktop View */}
      <div className="hidden md:grid md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <Card
            key={index}
            className="p-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white relative overflow-hidden group"
          >
            <CardContent className="p-0">
              <Quote className="w-12 h-12 opacity-20 absolute top-4 right-4" style={{ color: testimonial.color }} />

              <div className="flex items-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-[#FFAF40] fill-current" />
                ))}
              </div>

              <blockquote className="text-lg text-[#374151] mb-6 leading-relaxed font-medium">
                "{testimonial.quote}"
              </blockquote>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <img
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full mr-4 object-cover border-2"
                    style={{ borderColor: `${testimonial.color}20` }}
                  />
                  <div>
                    <div className="font-bold text-[#111827] text-lg">{testimonial.name}</div>
                    <div className="text-[#374151] text-sm">{testimonial.title}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold" style={{ color: testimonial.color }}>
                    {testimonial.metric}
                  </div>
                  <div className="text-xs text-[#374151]">{testimonial.metricLabel}</div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-semibold text-[#374151]">{testimonial.business}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mobile Carousel */}
      <div className="md:hidden">
        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {testimonials.map((testimonial, index) => (
              <div key={index} className="w-full flex-shrink-0 px-4">
                <Card className="p-6 border-0 shadow-lg bg-white relative overflow-hidden">
                  <CardContent className="p-0">
                    <Quote
                      className="w-10 h-10 opacity-20 absolute top-4 right-4"
                      style={{ color: testimonial.color }}
                    />

                    <div className="flex items-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-[#FFAF40] fill-current" />
                      ))}
                    </div>

                    <blockquote className="text-base text-[#374151] mb-4 leading-relaxed font-medium">
                      "{testimonial.quote}"
                    </blockquote>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <img
                          src={testimonial.image || "/placeholder.svg"}
                          alt={testimonial.name}
                          className="w-12 h-12 rounded-full mr-3 object-cover border-2"
                          style={{ borderColor: `${testimonial.color}20` }}
                        />
                        <div>
                          <div className="font-bold text-[#111827]">{testimonial.name}</div>
                          <div className="text-[#374151] text-xs">{testimonial.title}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold" style={{ color: testimonial.color }}>
                          {testimonial.metric}
                        </div>
                        <div className="text-xs text-[#374151]">{testimonial.metricLabel}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-semibold text-[#374151]">{testimonial.business}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex items-center justify-center mt-6 space-x-4">
          <Button variant="ghost" size="sm" onClick={prevSlide} className="p-2">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlide ? "bg-[#009FFD]" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={nextSlide} className="p-2">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Animated Logos Carousel Component
function AnimatedLogosCarousel() {
  const logos = [
    { src: "/images/logo-financial-cloud.png", alt: "Financial Cloud" },
    { src: "/images/logo-carpbook-new.png", alt: "Carpbook" },
    { src: "/images/logo-wilson-house.png", alt: "Wilson House" },
    { src: "/images/logo-forever-thirsty.png", alt: "Forever Thirsty" },
    { src: "/images/logo-porcelain.png", alt: "Porcelain Flooring Direct" },
    { src: "/images/logo-sourced.png", alt: "Sourced Property" },
    { src: "/images/logo-first-brand.png", alt: "First Brand" },
  ]

  return (
    <div className="w-full bg-gray-50 py-8">
      <div className="relative overflow-hidden">
        <div className="flex animate-scroll justify-center items-center">
          {/* First set of logos */}
          {logos.map((logo, index) => (
            <div key={`first-${index}`} className="flex-shrink-0 mx-12 flex items-center justify-center">
              <img
                src={logo.src || "/placeholder.svg"}
                alt={logo.alt}
                className="h-16 w-auto max-w-[120px] object-contain transition-all duration-300 hover:opacity-80"
              />
            </div>
          ))}
          {/* Duplicate set for seamless loop */}
          {logos.map((logo, index) => (
            <div key={`second-${index}`} className="flex-shrink-0 mx-12 flex items-center justify-center">
              <img
                src={logo.src || "/placeholder.svg"}
                alt={logo.alt}
                className="h-16 w-auto max-w-[120px] object-contain transition-all duration-300 hover:opacity-80"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Sticky Header CTA Component
function StickyHeaderCTA() {
  const [isVisible, setIsVisible] = useState(false)
  const [showDemo, setShowDemo] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed top-20 left-0 right-0 z-40 bg-gradient-to-r from-[#2A2A72] to-[#009FFD] text-white shadow-2xl animate-slideDown">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="font-semibold">Ready to grow your business?</span>
          <div className="hidden sm:flex items-center space-x-2 text-sm opacity-90">
            <CheckCircle className="w-4 h-4" />
            <span>5-min setup</span>
            <CheckCircle className="w-4 h-4" />
            <span>We provide prizes</span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDemo(true)}
            className="text-white hover:bg-white/20 text-sm hover:scale-105 transition-all duration-200"
          >
            <Play className="w-4 h-4 mr-1" />
            Demo (0:45)
          </Button>
          <Button
            onClick={() => router.push("/register-interest")}
            className="bg-white text-[#009FFD] hover:bg-gray-100 font-semibold px-4 py-2 text-sm hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Get Started
          </Button>
        </div>
      </div>
      <VideoModal isOpen={showDemo} onClose={() => setShowDemo(false)} />

      <style jsx>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [showUIDemo, setShowUIDemo] = useState(false)
  const [demoType, setDemoType] = useState("")
  const [showExamplePage, setShowExamplePage] = useState(false)

  const openUIDemo = (type: string) => {
    setDemoType(type)
    setShowUIDemo(true)
  }

  useEffect(() => {
    if (status === "loading") return

    if (session?.user) {
      if (session.user.role === "admin") {
        router.push("/admin/dashboard")
      } else {
        router.push("/feed")
      }
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-pulse text-lg font-medium text-gray-600">Loading...</div>
      </div>
    )
  }

  if (session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-pulse text-lg font-medium text-gray-600">Redirecting...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Schema Markup for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Reward Labs",
            description:
              "Run irresistible giveaways in minutes – no prize sourcing, no coding, just leads on autopilot.",
            url: "https://rewardlabs.com",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "149",
              priceCurrency: "GBP",
              priceValidUntil: "2025-12-31",
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "5",
              reviewCount: "8000",
            },
          }),
        }}
      />

      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Do I need to provide my own prizes?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "No! We supply high-value prizes worth up to £5,000 each month. You don't need to source, buy, or store anything.",
                },
              },
              {
                "@type": "Question",
                name: "Is this GDPR compliant?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, 100%. All data collection, storage, and processing is fully GDPR compliant. We handle all the legal requirements for you.",
                },
              },
            ],
          }),
        }}
      />

      {/* Sticky Header CTA */}
      <StickyHeaderCTA />

      {/* Video Modal */}
      <VideoModal isOpen={showVideoModal} onClose={() => setShowVideoModal(false)} />

      {/* UI Demo Modal */}
      <UIDemoModal isOpen={showUIDemo} onClose={() => setShowUIDemo(false)} demoType={demoType} />

      {/* Example Page Modal */}
      <ExamplePageModal isOpen={showExamplePage} onClose={() => setShowExamplePage(false)} />

      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center">
              <img src="/images/reward-labs-logo-new.png" alt="Reward Labs" className="h-16 w-auto" />
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-12">
              <a
                href="#how-it-works"
                className="text-[#374151] hover:text-[#111827] font-semibold transition-colors text-lg hover:scale-105 duration-200"
              >
                How it Works
              </a>
              <a
                href="#benefits"
                className="text-[#374151] hover:text-[#111827] font-semibold transition-colors text-lg hover:scale-105 duration-200"
              >
                Benefits
              </a>
              <a
                href="#testimonials"
                className="text-[#374151] hover:text-[#111827] font-semibold transition-colors text-lg hover:scale-105 duration-200"
              >
                Success Stories
              </a>
              <a
                href="/demo"
                className="text-[#374151] hover:text-[#111827] font-semibold transition-colors text-lg hover:scale-105 duration-200 flex items-center"
              >
                <Play className="w-4 h-4 mr-2" />
                Demo (0:45)
              </a>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push("/auth/signin")}
                className="font-semibold text-lg px-6 py-3 h-auto text-[#374151] hover:text-[#111827] hover:scale-105 transition-all duration-200"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
              <Button
                onClick={() => router.push("/register-interest")}
                className="bg-[#009FFD] hover:bg-[#007ACC] font-semibold text-lg px-6 py-3 shadow-lg h-auto text-white hover:scale-105 transition-all duration-200 hover:shadow-xl"
              >
                Get Started
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
                <a href="#how-it-works" className="text-[#374151] hover:text-[#111827] font-semibold py-2 text-lg">
                  How it Works
                </a>
                <a href="#benefits" className="text-[#374151] hover:text-[#111827] font-semibold py-2 text-lg">
                  Benefits
                </a>
                <a href="#testimonials" className="text-[#374151] hover:text-[#111827] font-semibold py-2 text-lg">
                  Success Stories
                </a>
                <a
                  href="/demo"
                  className="justify-start text-[#374151] hover:text-[#111827] font-semibold text-lg p-2 flex items-center"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Demo (0:45)
                </a>
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
                    Get Started
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-20 pb-24 lg:pt-32">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#2A2A72]/5 to-[#009FFD]/10"></div>

        {/* Floating Icons with Animation */}
        <div className="absolute top-20 left-10 opacity-20 animate-bounce">
          <Zap className="w-8 h-8 text-[#009FFD]" />
        </div>
        <div className="absolute top-40 right-20 opacity-20 animate-pulse delay-1000">
          <Target className="w-6 h-6 text-[#2A2A72]" />
        </div>
        <div className="absolute bottom-40 left-20 opacity-20 animate-bounce delay-2000">
          <Award className="w-7 h-7 text-[#FFAF40]" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="text-center lg:text-left">
              {/* Star Rating and Dynamic Tickets Issued */}

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-[#111827] leading-tight mb-6 text-center lg:text-left">
                Turn Giveaways Into{" "}
                <span className="bg-gradient-to-r from-[#2A2A72] to-[#009FFD] bg-clip-text text-transparent">
                  Growth
                </span>
              </h1>

              <p className="text-2xl sm:text-3xl text-[#374151] leading-relaxed mb-8 max-w-3xl text-center lg:text-left">
                Branded prize draws that collect leads, reward customers, and get shared — all on autopilot.
              </p>

              {/* Bullet Points */}
              <div className="flex flex-col space-y-3 mb-12 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start">
                  <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                  <span className="text-lg font-semibold text-[#374151]">We supply the prize</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start">
                  <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                  <span className="text-lg font-semibold text-[#374151]">You keep the leads</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start">
                  <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                  <span className="text-lg font-semibold text-[#374151]">No setup or coding needed</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col items-center lg:items-start mb-8">
                <Button
                  size="lg"
                  onClick={() => router.push("/register-interest")}
                  className="bg-gradient-to-r from-[#FFAF40] to-[#FF9500] hover:from-[#FF9500] hover:to-[#FF8500] text-xl px-12 py-6 h-auto shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-white font-bold rounded-xl mb-4 w-full sm:w-auto"
                >
                  Get Started
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
                <a
                  href="#how-it-works"
                  className="text-[#009FFD] hover:text-[#007ACC] font-semibold text-lg transition-colors flex items-center"
                >
                  → See How It Works
                </a>
              </div>

              {/* Micro Trust Indicators */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-[#6B7280]">
                <div className="flex items-center">
                  <span className="mr-2">🔒</span>
                  <span>No setup needed</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">🎯</span>
                  <span>GDPR-safe</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">🎁</span>
                  <span>We supply prizes</span>
                </div>
              </div>
            </div>

            {/* Right Column - Mobile Mockup */}
            <div className="relative flex justify-center lg:justify-end">
              {/* Enhanced Decorative elements with more sparkles */}
              <div className="absolute -top-6 -left-8 text-3xl animate-bounce delay-1000">🎉</div>
              <div className="absolute -top-4 -right-8 text-2xl animate-pulse delay-2000">⭐️</div>
              <div className="absolute -bottom-6 -left-8 text-2xl animate-bounce delay-3000">✨</div>
              <div className="absolute -bottom-4 -right-6 text-xl animate-pulse delay-4000">🎊</div>
              <div className="absolute top-1/4 -left-12 text-lg animate-bounce delay-5000">💫</div>
              <div className="absolute top-3/4 -right-10 text-lg animate-pulse delay-6000">🌟</div>

              {/* Mobile mockup image - ABSOLUTELY NO BACKGROUND CONTAINERS */}
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled%20design%20-%202025-07-09T170843.622-ha5wNnDoCekbkNvHGVctKHB6huHdCZ.png"
                alt="Mobile Giveaway Page Example"
                className="w-full max-w-sm h-auto transition-all duration-500 transform hover:scale-105 relative z-10"
                style={{
                  filter: "drop-shadow(0 25px 50px rgba(0, 0, 0, 0.25))",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="bg-gray-50">
        <div className="text-center py-8">
          <p className="text-lg font-semibold text-[#374151] mb-6">Trusted by leading businesses</p>
        </div>
        <AnimatedLogosCarousel />
      </section>

      {/* The Problem Most Businesses Face Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-black text-[#111827] mb-6">
              The Hidden Problems Holding Your Marketing Back
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Low Social Media Engagement */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-shadow">
                <TrendingDown className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-[#111827] mb-4">Low Social Media Engagement</h3>
              <p className="text-lg text-[#374151] leading-relaxed">
                Organic posts aren't getting seen. No likes, no shares, no clicks — just silence.
              </p>
            </div>

            {/* Low Email Open Rates */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-shadow">
                <MailX className="w-10 h-10 text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold text-[#111827] mb-4">Low Email Open Rates</h3>
              <p className="text-lg text-[#374151] leading-relaxed">
                Your email list is growing colder by the day. Nobody's opening or interacting anymore.
              </p>
            </div>

            {/* High Customer Churn */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-shadow">
                <UserX className="w-10 h-10 text-gray-500" />
              </div>
              <h3 className="text-2xl font-bold text-[#111827] mb-4">High Customer Churn</h3>
              <p className="text-lg text-[#374151] leading-relaxed">
                People buy once, then disappear. You're spending more to win back the customers you already had.
              </p>
            </div>
          </div>

          <div className="text-center mt-16">
            <p className="text-xl text-[#374151] max-w-3xl mx-auto">
              If this sounds familiar, you're not alone — and it's exactly why we built Reward Labs.
            </p>
          </div>
        </div>
      </section>

      {/* Real Product Screenshots Section - Now Clickable */}
      <section className="py-24 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-black text-[#111827] mb-6">See Reward Labs in Action</h2>
            <p className="text-xl text-[#374151] max-w-3xl mx-auto">
              Real screenshots from our platform - click to explore each feature
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Setup Screenshot - Clickable */}
            <div
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer"
              onClick={() => openUIDemo("setup")}
            >
              <div className="bg-gradient-to-br from-[#009FFD]/10 to-[#009FFD]/20 rounded-xl p-4 mb-6 min-h-[250px] flex items-center justify-center relative overflow-hidden">
                <img
                  src="/images/ui-setup-screenshot.png"
                  alt="Setup Interface"
                  className="w-full h-auto rounded-lg shadow-lg transform group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-[#009FFD]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="bg-white/90 rounded-full p-3">
                    <Settings className="w-6 h-6 text-[#009FFD]" />
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-3 group-hover:text-[#009FFD] transition-colors">
                1. Setup in Minutes
              </h3>
              <p className="text-[#374151] group-hover:text-[#111827] transition-colors">
                Choose your plan and get started with our simple pricing structure. Click to see the full interface.
              </p>
            </div>

            {/* Branding Screenshot - Clickable with Example Button */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div
                className="bg-gradient-to-br from-[#2A2A72]/10 to-[#2A2A72]/20 rounded-xl p-4 mb-6 min-h-[250px] flex items-center justify-center relative overflow-hidden cursor-pointer"
                onClick={() => openUIDemo("branding")}
              >
                <img
                  src="/images/ui-branding-screenshot.png"
                  alt="Branding Interface"
                  className="w-full h-auto rounded-lg shadow-lg transform group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-[#2A2A72]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="bg-white/90 rounded-full p-3">
                    <Palette className="w-6 h-6 text-[#2A2A72]" />
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-3 group-hover:text-[#2A2A72] transition-colors">
                2. Brand Your Page
              </h3>
              <p className="text-[#374151] group-hover:text-[#111827] transition-colors mb-4">
                Upload your logo, customize colors, and add your branding elements. Click to explore the branding tools.
              </p>
              <Button
                onClick={() => setShowExamplePage(true)}
                variant="outline"
                className="w-full border-[#2A2A72] text-[#2A2A72] hover:bg-[#2A2A72] hover:text-white transition-all duration-200"
              >
                See Example Page
              </Button>
            </div>

            {/* Analytics Screenshot - Clickable */}
            <div
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer"
              onClick={() => openUIDemo("reporting")}
            >
              <div className="bg-gradient-to-br from-[#FFAF40]/10 to-[#FFAF40]/20 rounded-xl p-4 mb-6 min-h-[250px] flex items-center justify-center relative overflow-hidden">
                <img
                  src="/images/ui-reporting-screenshot.png"
                  alt="Reporting Interface"
                  className="w-full h-auto rounded-lg shadow-lg transform group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-[#FFAF40]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="bg-white/90 rounded-full p-3">
                    <BarChart3 className="w-6 h-6 text-[#FFAF40]" />
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-3 group-hover:text-[#FFAF40] transition-colors">
                3. Track & Export
              </h3>
              <p className="text-[#374151] group-hover:text-[#111827] transition-colors">
                Monitor your campaign performance and export leads for follow-up. Click to see detailed analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured In Section */}
      <section className="py-12 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold text-[#6B7280] mb-6">Loved by teams at</p>
            <div className="flex items-center justify-center space-x-8 opacity-60">
              <div className="text-2xl font-bold text-[#374151]">Finance Companies</div>
              <div className="text-2xl font-bold text-[#374151]">Online Stores</div>
              <div className="text-2xl font-bold text-[#374151]">Hotels and Leisure</div>
              <div className="text-2xl font-bold text-[#374151]">Inc.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Who's It For Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-black text-[#111827] mb-6">{"Who's Reward Labs For?"}</h2>
            <p className="text-xl text-[#374151] max-w-3xl mx-auto">
              Perfect for any business that wants to grow their customer base
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group hover:scale-105 transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-[#009FFD]/10 to-[#009FFD]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-shadow group-hover:scale-110">
                <ShoppingCart className="w-10 h-10 text-[#009FFD] group-hover:animate-bounce" />
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-3">E-commerce Stores</h3>
              <p className="text-[#374151] text-sm">
                Grow your email list and increase repeat purchases with monthly giveaways.
              </p>
            </div>

            <div className="text-center group hover:scale-105 transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-[#2A2A72]/10 to-[#2A2A72]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-shadow group-hover:scale-110">
                <Users className="w-10 h-10 text-[#2A2A72] group-hover:animate-bounce" />
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-3">Subscription Services</h3>
              <p className="text-[#374151] text-sm">
                Reduce churn and attract new subscribers with exciting prize campaigns.
              </p>
            </div>

            <div className="text-center group hover:scale-105 transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-[#FFAF40]/10 to-[#FFAF40]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-shadow group-hover:scale-110">
                <Briefcase className="w-10 h-10 text-[#FFAF40] group-hover:animate-bounce" />
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-3">Marketing Agencies</h3>
              <p className="text-[#374151] text-sm">
                Offer giveaway campaigns as a service to help clients grow their lists.
              </p>
            </div>

            <div className="text-center group hover:scale-105 transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-[#009FFD]/10 to-[#009FFD]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-shadow group-hover:scale-110">
                <Building className="w-10 h-10 text-[#009FFD] group-hover:animate-bounce" />
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-3">Local Businesses</h3>
              <p className="text-[#374151] text-sm">
                Build a loyal customer base and increase foot traffic with local giveaways.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-black text-[#111827] mb-6">How It Works</h2>
            <p className="text-xl text-[#374151] max-w-3xl mx-auto">
              Three simple steps to start collecting leads and growing your business
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="w-24 h-24 bg-gradient-to-br from-[#009FFD] to-[#007ACC] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300 group-hover:shadow-xl">
                <Gift className="w-12 h-12 text-white group-hover:animate-bounce" />
              </div>
              <div className="bg-[#009FFD] text-white rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-6 text-lg font-bold group-hover:scale-110 transition-transform duration-300">
                1
              </div>
              <h3 className="text-2xl font-bold text-[#111827] mb-4">We Provide the Prize</h3>
              <p className="text-lg text-[#374151] leading-relaxed">
                Each month, we supply high-value prizes worth up to £5,000. No inventory, no shipping, no hassle.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-24 h-24 bg-gradient-to-br from-[#2A2A72] to-[#1F1F5C] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300 group-hover:shadow-xl">
                <Palette className="w-12 h-12 text-white group-hover:animate-bounce" />
              </div>
              <div className="bg-[#2A2A72] text-white rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-6 text-lg font-bold group-hover:scale-110 transition-transform duration-300">
                2
              </div>
              <h3 className="text-2xl font-bold text-[#111827] mb-4">You Brand & Launch It</h3>
              <p className="text-lg text-[#374151] leading-relaxed">
                Add your logo, colors, and custom questions. Share the link or embed it on your website.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-24 h-24 bg-gradient-to-br from-[#FFAF40] to-[#FF9500] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300 group-hover:shadow-xl">
                <TrendingUp className="w-12 h-12 text-white group-hover:animate-bounce" />
              </div>
              <div className="bg-[#FFAF40] text-white rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-6 text-lg font-bold group-hover:scale-110 transition-transform duration-300">
                3
              </div>
              <h3 className="text-2xl font-bold text-[#111827] mb-4">You Collect Leads & Grow</h3>
              <p className="text-lg text-[#374151] leading-relaxed">
                Watch entries roll in, export your leads, and see your email list grow with qualified prospects.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Benefits Section */}
      <section id="benefits" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-black text-[#111827] mb-6">Why Businesses Use Reward Labs</h2>
            <p className="text-xl text-[#374151] max-w-3xl mx-auto">
              Everything you need to grow your customer base and boost engagement
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300 group bg-white">
              <CardContent className="p-0">
                <div className="w-20 h-20 bg-gradient-to-br from-[#009FFD] to-[#007ACC] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-lg">
                  <TrendingUp className="w-10 h-10 text-white group-hover:animate-bounce" />
                </div>
                <h3 className="text-2xl font-bold text-[#111827] mb-4">Grow Your List</h3>
                <ul className="space-y-3 text-[#374151]">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                    15% Email open rate increase
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                    Custom entry questions
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                    Qualified lead generation
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                    Export data anytime
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300 group bg-white">
              <CardContent className="p-0">
                <div className="w-20 h-20 bg-gradient-to-br from-[#2A2A72] to-[#1F1F5C] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-lg">
                  <Sparkles className="w-10 h-10 text-white group-hover:animate-bounce" />
                </div>
                <h3 className="text-2xl font-bold text-[#111827] mb-4">Boost Engagement</h3>
                <ul className="space-y-3 text-[#374151]">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                    3.2x traffic increase
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                    Social media sharing
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                    Brand awareness boost
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                    Customer insights
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300 group bg-white">
              <CardContent className="p-0">
                <div className="w-20 h-20 bg-gradient-to-br from-[#FFAF40] to-[#FF9500] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-lg">
                  <Clock className="w-10 h-10 text-white group-hover:animate-bounce" />
                </div>
                <h3 className="text-2xl font-bold text-[#111827] mb-4">Save Time</h3>
                <ul className="space-y-3 text-[#374151]">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                    5-minute setup
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                    No prize sourcing
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                    Automated draws
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-[#FFAF40] mr-3" />
                    GDPR compliance
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-black text-[#111827] mb-6">Success Stories</h2>
            <p className="text-xl text-[#374151] max-w-3xl mx-auto">See how businesses are growing with Reward Labs</p>
          </div>

          <TestimonialCarousel />
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-r from-[#2A2A72] to-[#009FFD] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-black mb-6">Ready to Grow Your Business?</h2>
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
              onClick={() => setShowVideoModal(true)}
              className="border-2 border-white text-white hover:bg-white hover:text-[#009FFD] text-xl px-10 py-6 h-auto shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Play className="mr-3 h-6 w-6" />
              Watch Demo (0:45)
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm opacity-75 mt-8">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span>No setup required</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span>GDPR-safe</span>
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
