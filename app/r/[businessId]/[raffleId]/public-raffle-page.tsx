"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Checkbox } from "@/components/ui/checkbox"

interface CustomQuestion {
  id: string
  question: string
  type: "text" | "email" | "phone" | "select"
  options?: string[]
  required: boolean
}

interface RaffleData {
  businessRaffle: {
    _id: string
    businessId: string
    raffleId: string
    businessCustomizations?: {
      logo?: string
      primaryColor?: string
      redirectUrl?: string
      customQuestions?: CustomQuestion[]
      template?: string
      coverPhoto?: string
      backgroundVideo?: string
      customDescription?: string
      additionalMedia?: string[]
    }
  }
  raffle: {
    title: string
    description: string
    startDate: string
    endDate: string
    coverImage: string
    prizeImages: string[]
    mainImageIndex: number
  }
  business: {
    businessName: string
    firstName: string
    lastName: string
  }
}

// Countdown Timer Component
function CountdownTimer({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(endDate) - +new Date()

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [endDate])

  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center mb-4">
        <Clock className="h-5 w-5 text-green-400 mr-2" />
        <span className="text-green-400 font-medium">TIME REMAINING</span>
      </div>
      <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto">
        <div className="bg-green-400 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-black">{timeLeft.days.toString().padStart(2, "0")}</div>
          <div className="text-xs font-medium text-black">DAYS</div>
        </div>
        <div className="bg-green-400 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-black">{timeLeft.hours.toString().padStart(2, "0")}</div>
          <div className="text-xs font-medium text-black">HOURS</div>
        </div>
        <div className="bg-green-400 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-black">{timeLeft.minutes.toString().padStart(2, "0")}</div>
          <div className="text-xs font-medium text-black">MINS</div>
        </div>
        <div className="bg-green-400 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-black">{timeLeft.seconds.toString().padStart(2, "0")}</div>
          <div className="text-xs font-medium text-black">SECS</div>
        </div>
      </div>
    </div>
  )
}

// Confetti Animation Component
function ConfettiAnimation() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 50 }).map((_, i) => {
        const size = Math.random() * 10 + 5
        const color = ["#FFC700", "#FF0040", "#00CBFF", "#00FF90", "#A300FF", "#FF7E00"][Math.floor(Math.random() * 6)]
        const xStart = Math.random() * 100
        const yStart = -20
        const xEnd = xStart + (Math.random() * 20 - 10)
        const yEnd = 120
        const delay = Math.random() * 0.5
        const duration = Math.random() * 1 + 2

        return (
          <motion.div
            key={i}
            initial={{ x: `${xStart}%`, y: `${yStart}%`, opacity: 1, scale: 0 }}
            animate={{
              x: `${xEnd}%`,
              y: `${yEnd}%`,
              opacity: 0,
              scale: 1,
              rotate: Math.random() * 360,
            }}
            transition={{
              duration,
              delay,
              ease: "easeOut",
            }}
            style={{
              position: "absolute",
              width: size,
              height: size,
              borderRadius: Math.random() > 0.2 ? "50%" : "0",
              backgroundColor: color,
            }}
          />
        )
      })}
    </div>
  )
}

// Media Gallery Component
function MediaGallery({ media }: { media: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto-advance functionality - advances every 2 seconds continuously
  useEffect(() => {
    if (media.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % media.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [media.length])

  if (!media || media.length === 0) return null

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length)
  }

  return (
    <div className="relative mb-8 rounded-xl overflow-hidden">
      <div className="relative h-48">
        {media[currentIndex].includes(".mp4") || media[currentIndex].includes("video") ? (
          <video src={media[currentIndex]} className="w-full h-full object-cover" autoPlay muted loop />
        ) : (
          <img
            src={media[currentIndex] || "/placeholder.svg"}
            alt={`Gallery image ${currentIndex + 1}`}
            className="w-full h-full object-cover"
          />
        )}

        {media.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {media.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {media.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function PublicRafflePage({ data }: { data: RaffleData }) {
  const { businessRaffle, raffle, business } = data
  const customizations = businessRaffle.businessCustomizations
  const primaryColor = customizations?.primaryColor || "#00FF88"
  const redirectUrl = customizations?.redirectUrl

  const [formData, setFormData] = useState<Record<string, string>>({
    firstName: "",
    lastName: "",
    email: "",
  })
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [agreedToMarketing, setAgreedToMarketing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [countdown, setCountdown] = useState(5)
  const [entryData, setEntryData] = useState<any>(null)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Countdown and redirect logic
  useEffect(() => {
    if (submitted && redirectUrl && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (submitted && redirectUrl && countdown === 0) {
      window.location.href = redirectUrl
    }
  }, [submitted, redirectUrl, countdown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    // Validate required checkboxes
    if (!agreedToTerms) {
      setError("You must agree to the terms and conditions to enter this raffle")
      setSubmitting(false)
      return
    }

    try {
      // Prepare answers object for custom questions
      const answers: Record<string, string> = {}

      // Add custom question answers
      customizations?.customQuestions?.forEach((question) => {
        if (formData[question.id]) {
          answers[question.id] = formData[question.id]
        }
      })

      // Submit entry
      const response = await fetch("/api/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessId: businessRaffle.businessId,
          raffleId: businessRaffle.raffleId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          answers,
          agreedToTerms: agreedToTerms,
          agreedToMarketing: agreedToMarketing,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || result.details || "Failed to submit entry")
      }

      setEntryData(result)
      setSubmitted(true)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to submit entry")
    } finally {
      setSubmitting(false)
    }
  }

  // Determine background media
  const backgroundMedia = customizations?.backgroundVideo || customizations?.coverPhoto

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Media */}
      {backgroundMedia && (
        <div className="absolute inset-0 z-0">
          {customizations?.backgroundVideo ? (
            <video
              src={customizations.backgroundVideo}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={customizations.coverPhoto || "/placeholder.svg"}
              alt="Background"
              className="w-full h-full object-cover"
            />
          )}
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/30" />
        </div>
      )}

      {/* Fallback background if no media */}
      {!backgroundMedia && (
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900" />
      )}

      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div
            key="entry-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 min-h-screen flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md">
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", damping: 12, stiffness: 100 }}
                className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700"
              >
                {/* FREE ENTRY Badge */}
                <div className="text-center mb-6">
                  <span
                    className="inline-block px-4 py-2 rounded-full text-sm font-bold text-black"
                    style={{ backgroundColor: primaryColor }}
                  >
                    FREE ENTRY
                  </span>
                </div>

                {/* Main Headline */}
                <div className="text-center mb-8">
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">{raffle.title}</h1>
                  <p className="text-gray-300 text-sm">Enter your details below for a chance to win</p>
                </div>

                {/* Media Gallery or Single Image with Logo Overlay */}
                {customizations?.additionalMedia && customizations.additionalMedia.length > 0 ? (
                  <MediaGallery media={customizations.additionalMedia} />
                ) : raffle.coverImage ? (
                  <div className="relative mb-8 rounded-xl overflow-hidden">
                    <img
                      src={raffle.coverImage || "/placeholder.svg"}
                      alt={raffle.title}
                      className="w-full h-48 object-cover"
                    />

                    {/* Logo Overlay */}
                    {customizations?.logo && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className="w-20 h-20 rounded-xl flex items-center justify-center shadow-lg"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <img
                            src={customizations.logo || "/placeholder.svg"}
                            alt={business.businessName}
                            className="w-12 h-12 object-contain"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}

                {/* Prize Description */}
                <div className="text-center mb-8">
                  <h2 className="text-xl font-bold text-white mb-2">
                    <span style={{ color: primaryColor }}>Celebrate With Us!!</span>
                    <span className="ml-2 text-xs px-2 py-1 bg-orange-500 text-white rounded">FREE</span>
                  </h2>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {customizations?.customDescription ||
                      `Enter our exclusive prize draw for a chance to win. The winner will be announced on ${formatDate(raffle.endDate)}. No purchase necessary.`}
                  </p>
                </div>

                {/* Countdown Timer */}
                <CountdownTimer endDate={raffle.endDate} />

                {/* Urgency Message */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-lg">
                    <span className="text-orange-400 text-sm">🔥 Free entry! Don't miss your chance to win!</span>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Entry Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-white text-sm font-medium mb-2 block">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        type="text"
                        required
                        value={formData.firstName || ""}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        placeholder="First name"
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-green-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-white text-sm font-medium mb-2 block">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        type="text"
                        required
                        value={formData.lastName || ""}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        placeholder="Last name"
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-green-400"
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div>
                    <Label htmlFor="email" className="text-white text-sm font-medium mb-2 block">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email || ""}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="your@email.com"
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-green-400"
                    />
                  </div>

                  {/* Custom Questions */}
                  {customizations?.customQuestions?.map((question) => (
                    <div key={question.id}>
                      <Label htmlFor={question.id} className="text-white text-sm font-medium mb-2 block">
                        {question.question}
                        {question.required && " *"}
                      </Label>
                      {question.type === "text" && (
                        <Input
                          id={question.id}
                          type="text"
                          required={question.required}
                          value={formData[question.id] || ""}
                          onChange={(e) => handleInputChange(question.id, e.target.value)}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-green-400"
                        />
                      )}
                      {question.type === "email" && (
                        <Input
                          id={question.id}
                          type="email"
                          required={question.required}
                          value={formData[question.id] || ""}
                          onChange={(e) => handleInputChange(question.id, e.target.value)}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-green-400"
                        />
                      )}
                      {question.type === "phone" && (
                        <Input
                          id={question.id}
                          type="tel"
                          required={question.required}
                          value={formData[question.id] || ""}
                          onChange={(e) => handleInputChange(question.id, e.target.value)}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-green-400"
                        />
                      )}
                      {question.type === "select" && (
                        <Select
                          value={formData[question.id] || ""}
                          onValueChange={(value) => handleInputChange(question.id, value)}
                          required={question.required}
                        >
                          <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-green-400">
                            <SelectValue placeholder="Select an option..." />
                          </SelectTrigger>
                          <SelectContent>
                            {question.options?.map((option, index) => (
                              <SelectItem key={index} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  ))}

                  {/* Terms and Conditions Checkboxes */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="terms"
                        checked={agreedToTerms}
                        onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                        required
                        className="border-white/30 data-[state=checked]:bg-green-400 data-[state=checked]:border-green-400"
                      />
                      <div className="text-sm">
                        <Label htmlFor="terms" className="text-white font-medium">
                          I accept the Terms and Conditions
                        </Label>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="marketing"
                        checked={agreedToMarketing}
                        onCheckedChange={(checked) => setAgreedToMarketing(checked === true)}
                        className="border-white/30 data-[state=checked]:bg-green-400 data-[state=checked]:border-green-400"
                      />
                      <div className="text-sm">
                        <Label htmlFor="marketing" className="text-white font-medium">
                          I agree to partners sending more information about services and offers
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <p className="text-center text-xs text-gray-400">
                    No purchase necessary. Enter for your chance to win!
                  </p>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full py-4 text-lg font-bold text-black hover:opacity-90 transition-opacity"
                    disabled={submitting || !agreedToTerms}
                    style={{ backgroundColor: primaryColor }}
                  >
                    {submitting ? "Submitting..." : "Enter Now →"}
                  </Button>
                </form>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="confirmation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12"
          >
            <div className="max-w-md w-full">
              {/* Confetti animation */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <ConfettiAnimation />
              </motion.div>

              {/* Confirmation card with animation */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", damping: 12, stiffness: 100, delay: 0.2 }}
              >
                <Card className="text-center overflow-hidden bg-gray-800/90 backdrop-blur-sm border-gray-700">
                  <CardContent className="pt-6 pb-8 px-6">
                    {/* Business logo */}
                    {customizations?.logo && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex justify-center mb-6"
                      >
                        <img
                          src={customizations.logo || "/placeholder.svg"}
                          alt={business.businessName}
                          className="h-16 object-contain"
                        />
                      </motion.div>
                    )}

                    {/* Success message */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
                      <h2 className="text-2xl font-bold mb-4 text-white">
                        🎉 You're in! Your entry has been received.
                      </h2>
                      <p className="text-gray-300 mb-6">
                        Thank you for entering {raffle.title}. Winners will be announced after{" "}
                        {formatDate(raffle.endDate)}.
                      </p>

                      {/* Redirect countdown */}
                      {redirectUrl && (
                        <div className="mb-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                          <p className="text-blue-300 text-sm mb-2">
                            Redirecting you to {business.businessName} in {countdown} seconds...
                          </p>
                          <div className="flex items-center justify-center space-x-2">
                            <ExternalLink className="h-4 w-4 text-blue-400" />
                            <a
                              href={redirectUrl}
                              className="text-blue-400 hover:text-blue-300 underline text-sm"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Visit now
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Email confirmation notice */}
                      <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                        <p className="text-green-300 text-sm">
                          📧 A confirmation email has been sent to {formData.email}
                        </p>
                      </div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
