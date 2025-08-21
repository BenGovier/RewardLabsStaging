"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RefreshCw, Copy, CheckCircle } from "lucide-react"

interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: string
  profilePictureUrl?: string
  referralSlug?: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [referralUrl, setReferralUrl] = useState("")

  useEffect(() => {
    if (status === "loading") return

    if (!session?.user) {
      router.push("/auth/signin")
      return
    }

    fetchUserProfile()
  }, [session, status, router])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/users/me")
      if (!response.ok) throw new Error("Failed to fetch user profile")

      const data = await response.json()
      setUser(data.user)

      if (data.user.referralSlug) {
        setReferralUrl(`https://www.businessraffily.co.uk/${data.user.referralSlug}`)
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateReferralSlug = async () => {
    if (isGenerating) return

    setIsGenerating(true)
    try {
      const response = await fetch("/api/referral/generate", {
        method: "POST",
      })

      if (!response.ok) throw new Error("Failed to generate referral slug")

      const data = await response.json()
      setReferralUrl(data.referralUrl)

      // Update local user state
      setUser((prev) => (prev ? { ...prev, referralSlug: data.referralSlug } : null))
    } catch (error) {
      console.error("Error generating referral slug:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  const isRep = user?.role === "rep"

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Manage your account settings and referral link</p>
        </div>

        {/* Profile Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.profilePictureUrl || "/placeholder.svg"} />
                <AvatarFallback className="text-lg">
                  {user ? getInitials(user.firstName, user.lastName) : "??"}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">
                  {user?.firstName} {user?.lastName}
                </CardTitle>
                <CardDescription>{user?.role === "rep" ? "Representative" : "Administrator"}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input value={user?.email || ""} readOnly />
            </div>
          </CardContent>
        </Card>

        {/* Referral Link Card (Only for Reps) */}
        {isRep && (
          <Card>
            <CardHeader>
              <CardTitle>Your Referral Link</CardTitle>
              <CardDescription>
                Share this link with potential customers. You'll receive credit for any sign-ups through this link.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input value={referralUrl} readOnly className="flex-1" />
                <Button variant="outline" size="icon" onClick={copyToClipboard} disabled={!referralUrl}>
                  {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <Button onClick={generateReferralSlug} disabled={isGenerating}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
                {user?.referralSlug ? "Regenerate Link" : "Generate Link"}
              </Button>
              {referralUrl && (
                <p className="text-sm text-gray-500">
                  Note: Regenerating your link will invalidate your previous referral link.
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
