"use client"

import React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  BarChart3,
  Gift,
  Mail,
  Palette,
  Eye,
  Share2,
  TrendingUp,
  Copy,
  Facebook,
  Twitter,
  Instagram,
  Plus,
  Check,
  ArrowLeft,
  ArrowRight,
  X,
  Upload,
  ImageIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"

// Confetti Animation Component
function Confetti({ show, color }: { show: boolean; color: string }) {
  useEffect(() => {
    if (!show) return

    const confettiContainer = document.createElement("div")
    confettiContainer.className = "fixed inset-0 pointer-events-none z-50"
    document.body.appendChild(confettiContainer)

    // Create confetti pieces
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement("div")
      confetti.className = "absolute w-2 h-2 opacity-80"
      confetti.style.backgroundColor = i % 2 === 0 ? color : "#FACC15"
      confetti.style.left = Math.random() * 100 + "%"
      confetti.style.animationDuration = Math.random() * 2 + 1 + "s"
      confetti.style.animationDelay = Math.random() * 0.5 + "s"
      confetti.style.transform = `rotate(${Math.random() * 360}deg)`

      // Animate falling
      confetti.animate(
        [
          { transform: `translateY(-100vh) rotate(0deg)`, opacity: 1 },
          { transform: `translateY(100vh) rotate(720deg)`, opacity: 0 },
        ],
        {
          duration: 3000,
          easing: "ease-out",
        },
      )

      confettiContainer.appendChild(confetti)
    }

    // Cleanup
    const cleanup = setTimeout(() => {
      document.body.removeChild(confettiContainer)
    }, 3000)

    return () => {
      clearTimeout(cleanup)
      if (document.body.contains(confettiContainer)) {
        document.body.removeChild(confettiContainer)
      }
    }
  }, [show, color])

  return null
}

// Email Collection Popup Component
function EmailPopup({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/website-leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          source: "demo-popup",
        }),
      })

      if (response.ok) {
        onClose()
        localStorage.setItem("demo-email-collected", "true")
      } else {
        const data = await response.json()
        setError(data.error || "Something went wrong")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 relative">
        <CardContent className="p-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#009FFD] to-[#007ACC] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-[#111827] mb-2">Get Early Access</h3>
            <p className="text-[#374151]">
              Enter your email to unlock the full demo experience and get notified when we launch.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
                disabled={isSubmitting}
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#2A2A72] to-[#009FFD] hover:from-[#1F1F5C] hover:to-[#007ACC] text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Unlock Demo"}
            </Button>
          </form>

          <p className="text-xs text-[#374151] text-center mt-4">We respect your privacy. Unsubscribe at any time.</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function DemoPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [animatingEntries, setAnimatingEntries] = useState(false)
  const [showEmailPopup, setShowEmailPopup] = useState(false)
  const [businessName, setBusinessName] = useState("")
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null)
  const [uploadedCoverImage, setUploadedCoverImage] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState("#009FFD")
  const [uploadErrors, setUploadErrors] = useState<{ logo?: string; cover?: string }>({})
  const [customQuestions, setCustomQuestions] = useState([
    "What's your favorite product category?",
    "How did you hear about us?",
    "What's your email preference?",
  ])
  const [redirectUrl, setRedirectUrl] = useState("https://yourbrand.com")
  const [aboutText, setAboutText] = useState(
    "We're celebrating our amazing customers! Enter our monthly giveaway for a chance to win incredible prizes. It's our way of saying thank you for your continued support and loyalty.",
  )
  const [urlError, setUrlError] = useState("")
  const [previewFormData, setPreviewFormData] = useState({
    name: "",
    email: "",
    customAnswers: [] as string[],
  })
  const [isDrawing, setIsDrawing] = useState(false)
  const [showWinner, setShowWinner] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const router = useRouter()

  // Check if email was already collected
  useEffect(() => {
    const emailCollected = localStorage.getItem("demo-email-collected")
    if (!emailCollected) {
      const timer = setTimeout(() => {
        setShowEmailPopup(true)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [])

  const steps = [
    {
      title: "Choose a Prize",
      description: "Each month, we provide ready-to-go giveaways. Just pick the one that fits your brand.",
      icon: Gift,
      color: "blue",
    },
    {
      title: "Brand Your Giveaway",
      description: "Add your logo, colours, and up to 3 custom questions to collect insights.",
      icon: Palette,
      color: "purple",
    },
    {
      title: "Preview the Page",
      description: "See your giveaway on desktop and mobile — fully branded and ready to go.",
      icon: Eye,
      color: "green",
    },
    {
      title: "Share or Embed",
      description: "Copy your link, share it on social, or embed it in your site or email.",
      icon: Share2,
      color: "orange",
    },
    {
      title: "Watch the Entries Roll In",
      description: "Customers enter for free — you get leads, data, and higher email open rates.",
      icon: TrendingUp,
      color: "indigo",
    },
    {
      title: "Track Your Results",
      description: "See total entries, export leads, and measure performance in your dashboard.",
      icon: BarChart3,
      color: "red",
    },
  ]

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex)
  }

  const getColorClasses = (color: string, isActive = false) => {
    const colors = {
      blue: isActive ? "bg-[#009FFD] text-white" : "bg-[#009FFD]/10 text-[#009FFD]",
      purple: isActive ? "bg-[#2A2A72] text-white" : "bg-[#2A2A72]/10 text-[#2A2A72]",
      green: isActive ? "bg-green-600 text-white" : "bg-green-100 text-green-600",
      orange: isActive ? "bg-[#FFAF40] text-white" : "bg-[#FFAF40]/10 text-[#FFAF40]",
      indigo: isActive ? "bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-600",
      red: isActive ? "bg-red-600 text-white" : "bg-red-100 text-red-600",
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  const handleFileUpload = (file: File, type: "logo" | "cover") => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/svg+xml"]
    if (!validTypes.includes(file.type)) {
      setUploadErrors((prev) => ({
        ...prev,
        [type]: "Please upload a JPG, PNG, or SVG file",
      }))
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadErrors((prev) => ({
        ...prev,
        [type]: "File size must be less than 5MB",
      }))
      return
    }

    setUploadErrors((prev) => ({
      ...prev,
      [type]: undefined,
    }))

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (type === "logo") {
        setUploadedLogo(result)
      } else {
        setUploadedCoverImage(result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, type: "logo" | "cover") => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files[0], type)
    }
  }

  useEffect(() => {
    if (currentStep === 4) {
      setAnimatingEntries(true)
      const timer = setTimeout(() => setAnimatingEntries(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [currentStep])

  const handleDrawingAnimation = async () => {
    if (!previewFormData.name || !previewFormData.email) {
      return
    }

    setIsDrawing(true)

    setTimeout(() => {
      const ticketNumber = `TKT-${new Date().getFullYear()}-${Math.floor(Math.random() * 900000) + 100000}`

      setTimeout(() => {
        setIsDrawing(false)
        setShowWinner(true)
        setShowConfetti(true)

        const winnerElement = document.querySelector(".winner-message")
        if (winnerElement) {
          winnerElement.innerHTML = `🎉 Congratulations! 🎉<br/>Your ticket: <strong>${ticketNumber}</strong><br/>You're entered to win!`
        }

        setTimeout(() => {
          setShowWinner(false)
          setShowConfetti(false)
          setPreviewFormData({
            name: "",
            email: "",
            customAnswers: [],
          })
        }, 5000)
      }, 1000)
    }, 2000)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">Choose Your Monthly Prize</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: "£5000 Cash", image: "💰", popular: true },
                { name: "Tech Bundle! MacBook Pro & VR Goggles!", image: "💻", popular: false },
                { name: "Family Holiday to Thailand!", image: "✈️", popular: false },
              ].map((prize, index) => (
                <div
                  key={index}
                  className={`relative bg-white rounded-xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl cursor-pointer ${
                    prize.popular
                      ? "border-[#009FFD] ring-2 ring-[#009FFD]/20"
                      : "border-gray-200 hover:border-[#009FFD]/30"
                  }`}
                >
                  {prize.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-[#009FFD] text-white px-3 py-1 rounded-full text-xs font-bold">POPULAR</span>
                    </div>
                  )}
                  <div className="p-6 text-center">
                    <div className="text-4xl mb-4">{prize.image}</div>
                    <h4 className="font-bold text-gray-800 mb-2">{prize.name}</h4>
                    <p className="text-sm text-gray-600 mb-4">Ready to launch</p>
                    <Button
                      size="sm"
                      className={`w-full ${
                        prize.popular
                          ? "bg-[#009FFD] hover:bg-[#007ACC]"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Select Prize
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 1:
        return (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Customize Your Giveaway</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Logo</label>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#009FFD] transition-colors cursor-pointer relative"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, "logo")}
                    onClick={() => document.getElementById("logo-upload")?.click()}
                  >
                    {uploadedLogo ? (
                      <div className="space-y-3">
                        <img
                          src={uploadedLogo || "/placeholder.svg"}
                          alt="Uploaded logo"
                          className="w-16 h-16 object-contain mx-auto"
                        />
                        <p className="text-sm text-green-600">Logo uploaded successfully!</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setUploadedLogo(null)
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <div className="w-full h-16 bg-[#009FFD]/10 rounded-lg mx-auto mb-3 flex items-center justify-center">
                          <Upload className="w-8 h-8 text-[#009FFD]" />
                        </div>
                        <p className="text-sm text-gray-600">Click to upload or drag & drop your logo</p>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG, SVG (max 5MB)</p>
                      </div>
                    )}
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload(file, "logo")
                      }}
                    />
                  </div>
                  {uploadErrors.logo && <p className="text-red-500 text-sm mt-2">{uploadErrors.logo}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Image</label>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#009FFD] transition-colors cursor-pointer relative"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, "cover")}
                    onClick={() => document.getElementById("cover-upload")?.click()}
                  >
                    {uploadedCoverImage ? (
                      <div className="space-y-3">
                        <img
                          src={uploadedCoverImage || "/placeholder.svg"}
                          alt="Cover image"
                          className="w-full h-24 object-cover rounded-lg mx-auto"
                        />
                        <p className="text-sm text-green-600">Cover image uploaded!</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setUploadedCoverImage(null)
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <div className="w-full h-16 bg-[#009FFD]/10 rounded-lg mx-auto mb-3 flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-[#009FFD]" />
                        </div>
                        <p className="text-sm text-gray-600">Click to upload or drag & drop cover image</p>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG, SVG (max 5MB)</p>
                      </div>
                    )}
                    <input
                      id="cover-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload(file, "cover")
                      }}
                    />
                  </div>
                  {uploadErrors.cover && <p className="text-red-500 text-sm mt-2">{uploadErrors.cover}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Brand Colors</label>
                  <div className="flex space-x-3">
                    {["#009FFD", "#2A2A72", "#FFAF40", "#10B981", "#EF4444", "#8B5CF6"].map((color, index) => (
                      <div
                        key={index}
                        className={`w-12 h-12 rounded-lg border-2 cursor-pointer hover:scale-110 transition-transform ${
                          selectedColor === color ? "border-gray-800 ring-2 ring-gray-400" : "border-gray-200"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setSelectedColor(color)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Redirect URL</label>
                  <Input
                    type="url"
                    placeholder="https://yourbrand.com"
                    value={redirectUrl}
                    onChange={(e) => {
                      setRedirectUrl(e.target.value)
                      const urlPattern = /^(https?:\/\/)|(www\.)/
                      if (e.target.value && !urlPattern.test(e.target.value)) {
                        setUrlError("Please enter a valid URL (e.g., https://yourbrand.com)")
                      } else {
                        setUrlError("")
                      }
                    }}
                    className="w-full"
                  />
                  {urlError && <p className="text-red-500 text-sm mt-2">{urlError}</p>}
                  <p className="text-xs text-gray-500 mt-1">Where users will be directed after entering</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">About Our Giveaway</label>
                  <textarea
                    value={aboutText}
                    onChange={(e) => setAboutText(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-[#009FFD] focus:border-transparent"
                    rows={4}
                    placeholder="Tell your customers why they're being rewarded..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Explain why you're running this giveaway</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Custom Questions</h4>
                  <div className="space-y-3">
                    {customQuestions.map((question, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg group">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <Input
                          value={question}
                          onChange={(e) => {
                            const newQuestions = [...customQuestions]
                            newQuestions[index] = e.target.value
                            setCustomQuestions(newQuestions)
                          }}
                          className="flex-1 text-sm border-none bg-transparent focus:ring-0 focus:border-transparent p-0"
                        />
                        {customQuestions.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newQuestions = customQuestions.filter((_, i) => i !== index)
                              setCustomQuestions(newQuestions)
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 p-1 h-auto"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}

                    {customQuestions.length < 5 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setCustomQuestions([...customQuestions, "New custom question"])
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Question
                      </Button>
                    )}

                    {customQuestions.length >= 5 && (
                      <p className="text-xs text-gray-500 text-center">Maximum 5 questions allowed</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">Preview Your Branded Giveaway</h3>

            <div className="max-w-md mx-auto mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Your Business Name (for preview)</label>
              <Input
                placeholder="Enter your business name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="text-center"
              />
            </div>

            {/* Real Public Raffle Page Preview */}
            <div className="max-w-md mx-auto">
              <div className="min-h-screen relative overflow-hidden rounded-2xl shadow-2xl">
                {/* Background Media */}
                {uploadedCoverImage ? (
                  <div className="absolute inset-0 z-0">
                    <img
                      src={uploadedCoverImage || "/placeholder.svg"}
                      alt="Background"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30" />
                  </div>
                ) : (
                  <div className="absolute inset-0 z-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900" />
                )}

                {/* Entry Form Modal */}
                <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                  <div className="w-full max-w-md">
                    <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700">
                      {/* FREE ENTRY Badge */}
                      <div className="text-center mb-6">
                        <span
                          className="inline-block px-4 py-2 rounded-full text-sm font-bold text-black"
                          style={{ backgroundColor: selectedColor }}
                        >
                          FREE ENTRY
                        </span>
                      </div>

                      {/* Main Headline */}
                      <div className="text-center mb-8">
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">WIN £5,000 CASH!</h1>
                        <p className="text-gray-300 text-sm">Enter your details below for a chance to win</p>
                      </div>

                      {/* Prize Image with Logo Overlay */}
                      <div className="relative mb-8 rounded-xl overflow-hidden">
                        <img
                          src="/placeholder.svg?height=200&width=400"
                          alt="Prize"
                          className="w-full h-48 object-cover"
                        />

                        {/* Logo Overlay - Fixed positioning and visibility */}
                        {uploadedLogo && (
                          <div className="absolute inset-0 flex items-center justify-center z-10">
                            <div
                              className="w-20 h-20 rounded-xl flex items-center justify-center shadow-lg border-2 border-white/20"
                              style={{ backgroundColor: selectedColor }}
                            >
                              <img
                                src={uploadedLogo || "/placeholder.svg"}
                                alt={businessName || "Business"}
                                className="w-12 h-12 object-contain"
                                style={{
                                  filter:
                                    selectedColor === "#FFAF40" || selectedColor === "#10B981"
                                      ? "none"
                                      : "brightness(0) invert(1)",
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Prize Description */}
                      <div className="text-center mb-8">
                        <h2 className="text-xl font-bold text-white mb-2">
                          <span style={{ color: selectedColor }}>Win £5,000 Cash!</span>
                          <span className="ml-2 text-xs px-2 py-1 bg-orange-500 text-white rounded">FREE</span>
                        </h2>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          Enter our exclusive prize draw for a chance to win. The winner will be announced on June 30,
                          2025. No purchase necessary.
                        </p>
                      </div>

                      {/* Business Branding Section */}
                      {uploadedLogo && (
                        <div className="text-center mb-6">
                          <div className="inline-flex items-center space-x-3 px-4 py-2 bg-white/10 rounded-full border border-white/20">
                            <img
                              src={uploadedLogo || "/placeholder.svg"}
                              alt={businessName || "Business"}
                              className="w-6 h-6 object-contain"
                              style={{
                                filter: "brightness(0) invert(1)",
                              }}
                            />
                            <span className="text-white font-medium text-sm">{businessName || "Your Business"}</span>
                          </div>
                        </div>
                      )}

                      {/* Countdown Timer */}
                      <div className="text-center mb-8">
                        <div className="flex items-center justify-center mb-4">
                          <span className="text-green-400 font-medium">⏰ TIME REMAINING</span>
                        </div>
                        <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto">
                          <div className="bg-green-400 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-black">03</div>
                            <div className="text-xs font-medium text-black">DAYS</div>
                          </div>
                          <div className="bg-green-400 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-black">14</div>
                            <div className="text-xs font-medium text-black">HOURS</div>
                          </div>
                          <div className="bg-green-400 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-black">27</div>
                            <div className="text-xs font-medium text-black">MINS</div>
                          </div>
                          <div className="bg-green-400 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-black">45</div>
                            <div className="text-xs font-medium text-black">SECS</div>
                          </div>
                        </div>
                      </div>

                      {/* Urgency Message */}
                      <div className="text-center mb-8">
                        <div className="inline-flex items-center px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-lg">
                          <span className="text-orange-400 text-sm">🔥 Free entry! Don't miss your chance to win!</span>
                        </div>
                      </div>

                      {/* Entry Form */}
                      <div className="space-y-6">
                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Input
                              placeholder="First name"
                              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-green-400"
                            />
                          </div>
                          <div>
                            <Input
                              placeholder="Last name"
                              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-green-400"
                            />
                          </div>
                        </div>

                        {/* Email Field */}
                        <div>
                          <Input
                            placeholder="your@email.com"
                            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-green-400"
                          />
                        </div>

                        {/* Custom Question */}
                        {customQuestions.length > 0 && (
                          <div>
                            <Input
                              placeholder={customQuestions[0]}
                              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-green-400"
                            />
                          </div>
                        )}

                        {/* Terms Checkboxes */}
                        <div className="space-y-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-4 h-4 border border-white/30 rounded mt-0.5"></div>
                            <div className="text-sm">
                              <span className="text-white font-medium">I accept the Terms and Conditions</span>
                            </div>
                          </div>

                          <div className="flex items-start space-x-3">
                            <div className="w-4 h-4 border border-white/30 rounded mt-0.5"></div>
                            <div className="text-sm">
                              <span className="text-white font-medium">
                                I agree to partners sending more information about services and offers
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Disclaimer */}
                        <p className="text-center text-xs text-gray-400">
                          No purchase necessary. Enter for your chance to win!
                        </p>

                        {/* Submit Button */}
                        <Button
                          className="w-full py-4 text-lg font-bold text-black hover:opacity-90 transition-opacity"
                          style={{ backgroundColor: selectedColor }}
                        >
                          Enter Now →
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Share Your Giveaway</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Giveaway Link</label>
                <div className="flex space-x-2">
                  <Input value="https://yourbrand.com/giveaway/gift-card-500" readOnly className="flex-1 bg-gray-50" />
                  <Button variant="outline" size="sm">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Share on Social</label>
                <div className="flex space-x-4">
                  {[
                    { icon: Facebook, name: "Facebook", color: "bg-blue-600" },
                    { icon: Twitter, name: "Twitter", color: "bg-sky-500" },
                    { icon: Instagram, name: "Instagram", color: "bg-pink-600" },
                  ].map((social, index) => (
                    <Button key={index} className={`${social.color} hover:opacity-90 flex-1`} size="sm">
                      <social.icon className="w-4 h-4 mr-2" />
                      {social.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Embed Code</label>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono">
                  {'<iframe src="https://yourbrand.com/embed/giveaway"'}
                  <br />
                  {'  width="100%" height="400px">'}
                  <br />
                  {"</iframe>"}
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Entries Rolling In!</h3>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-hidden">
                <h4 className="font-semibold text-gray-700 mb-3">Live Entry Feed</h4>
                <div className="space-y-2">
                  {[
                    { name: "Sarah M.", email: "sarah@email.com", time: "2 seconds ago" },
                    { name: "Mike J.", email: "mike@email.com", time: "15 seconds ago" },
                    { name: "Lisa K.", email: "lisa@email.com", time: "32 seconds ago" },
                    { name: "David R.", email: "david@email.com", time: "1 minute ago" },
                    { name: "Emma S.", email: "emma@email.com", time: "2 minutes ago" },
                  ].map((entry, index) => (
                    <div
                      key={index}
                      className={`flex justify-between items-center p-3 bg-white rounded-lg shadow-sm transition-all duration-500 ${
                        animatingEntries && index < 2 ? "animate-pulse bg-green-50 border-l-4 border-green-500" : ""
                      }`}
                    >
                      <div>
                        <p className="font-medium text-gray-800">{entry.name}</p>
                        <p className="text-sm text-gray-600">{entry.email}</p>
                      </div>
                      <span className="text-xs text-gray-500">{entry.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#009FFD]/10 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-[#009FFD]">247</div>
                  <div className="text-sm text-gray-600">Total Entries</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">89%</div>
                  <div className="text-sm text-gray-600">Email Open Rate</div>
                </div>
                <div className="bg-[#2A2A72]/10 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-[#2A2A72]">156</div>
                  <div className="text-sm text-gray-600">New Leads</div>
                </div>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Analytics Dashboard</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Entries", value: "1,247", change: "+23%", color: "blue" },
                  { label: "Conversion Rate", value: "12.4%", change: "+5.2%", color: "green" },
                  { label: "Email Signups", value: "1,089", change: "+18%", color: "purple" },
                  { label: "Social Shares", value: "342", change: "+45%", color: "orange" },
                ].map((metric, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">{metric.label}</div>
                    <div className="text-xl font-bold text-gray-800">{metric.value}</div>
                    <div className={`text-sm text-${metric.color}-600`}>{metric.change}</div>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 rounded-lg p-6 h-48">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-gray-700">Entries Over Time</h4>
                  <Button variant="outline" size="sm">
                    Export Data
                  </Button>
                </div>
                <div className="h-32 bg-gradient-to-r from-[#009FFD] to-[#2A2A72] rounded-lg opacity-20 flex items-end justify-center">
                  <div className="text-gray-600 text-sm">📈 Entry growth trending upward</div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button className="flex-1 bg-[#009FFD] hover:bg-[#007ACC]">
                  <Mail className="w-4 h-4 mr-2" />
                  Email All Leads
                </Button>
                <Button variant="outline" className="flex-1">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Full Report
                </Button>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-30"
          onError={(e) => {
            e.currentTarget.style.display = "none"
            const fallback = e.currentTarget.nextElementSibling
            if (fallback) fallback.style.display = "block"
          }}
        >
          <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3188988-hd_1920_1080_25fps-vdv0CsC2Ikcc3AdkzD3AZTjWohTvts.mp4" type="video/mp4" />
        </video>
        <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50" style={{ display: "none" }}></div>
        <div className="absolute inset-0 bg-white/20"></div>
      </div>

      <Confetti show={showConfetti} color={selectedColor} />
      <EmailPopup isOpen={showEmailPopup} onClose={() => setShowEmailPopup(false)} />

      <div className="relative z-10 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-[#111827] mb-4">Experience Reward Labs in Action</h1>
            <p className="text-xl text-[#374151] max-w-3xl mx-auto">
              Walk through the full 6-step journey from prize selection to results tracking
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 lg:p-12 border border-gray-100">
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <span className="text-lg font-semibold text-[#111827]">
                  Step {currentStep + 1} of {steps.length}
                </span>
                <span className="text-lg font-semibold text-[#009FFD]">
                  {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
                </span>
              </div>

              <div className="w-full bg-gray-100 rounded-full h-3 mb-8">
                <div
                  className="bg-gradient-to-r from-[#2A2A72] to-[#009FFD] h-3 rounded-full transition-all duration-700 ease-out shadow-sm"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
              </div>

              <div className="flex justify-between">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToStep(index)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      index <= currentStep
                        ? "bg-gradient-to-r from-[#2A2A72] to-[#009FFD] text-white shadow-lg scale-110"
                        : "bg-gray-200 text-gray-400 hover:bg-gray-300 hover:scale-105"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center mb-8">
              <div
                className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 mx-auto ${getColorClasses(steps[currentStep].color, true)} shadow-lg`}
              >
                {React.createElement(steps[currentStep].icon, { className: "w-10 h-10" })}
              </div>
              <h3 className="text-4xl font-bold text-[#111827] mb-6">{steps[currentStep].title}</h3>
              <p className="text-xl text-[#374151] leading-relaxed max-w-2xl mx-auto">
                {steps[currentStep].description}
              </p>
            </div>

            <div className="min-h-[500px] flex items-center justify-center mb-8">
              <div className="w-full max-w-4xl">{renderStepContent()}</div>
            </div>

            <div className="flex justify-between items-center">
              <Button
                onClick={prevStep}
                disabled={currentStep === 0}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </Button>

              <div className="flex space-x-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentStep ? "bg-[#009FFD] w-8" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>

              {currentStep === steps.length - 1 ? (
                <Button
                  className="bg-gradient-to-r from-[#2A2A72] to-[#009FFD] hover:from-[#1F1F5C] hover:to-[#007ACC] text-white px-8"
                  onClick={() => router.push("/register-interest")}
                >
                  Launch Your First Giveaway Free
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  className="flex items-center space-x-2 bg-gradient-to-r from-[#2A2A72] to-[#009FFD] hover:from-[#1F1F5C] hover:to-[#007ACC]"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="text-center mt-12">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-3xl font-bold text-[#111827] mb-4">Ready to Grow Your Customer Base?</h2>
              <p className="text-lg text-[#374151] mb-6">
                Join thousands of businesses using Reward Labs to generate leads and grow their email lists
              </p>
              <Button
                className="bg-gradient-to-r from-[#2A2A72] to-[#009FFD] hover:from-[#1F1F5C] hover:to-[#007ACC] text-white px-8 py-3 text-lg"
                onClick={() => router.push("/register-interest")}
              >
                Get Started Free
              </Button>
              <p className="text-sm text-[#374151] mt-4">No setup required • GDPR safe • We provide the prize</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
