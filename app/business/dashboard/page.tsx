"use client"

import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2, AlertCircle, Zap, Users, TrendingUp, Sparkles, Rocket, Palette } from "lucide-react"

export default function BusinessDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isSetupComplete = searchParams.get("setup") === "success"

  useEffect(() => {
    console.log("🔍 Business Dashboard Debug Info:", {
      sessionStatus: status,
      session: session,
      userRole: session?.user?.role,
      userEmail: session?.user?.email,
      isSetupComplete,
      searchParams: Object.fromEntries(searchParams.entries()),
    })

    if (status === "unauthenticated") {
      console.log("❌ User not authenticated, redirecting to signin")
      router.push("/auth/signin?callbackUrl=/business/dashboard")
    }
  }, [session, status, router, searchParams, isSetupComplete])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Authentication Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Please sign in to access your business dashboard.</p>
            <Button onClick={() => router.push("/auth/signin")} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (session?.user?.role !== "business") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              This dashboard is only available for business accounts. Your current role:{" "}
              {session?.user?.role || "unknown"}
            </p>
            <Button onClick={() => router.push("/feed")} className="w-full">
              Go to Main Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Setup Success Banner */}
        {isSetupComplete && (
          <Alert className="mb-6 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <Sparkles className="h-4 w-4 text-green-500 animate-pulse" />
            </div>
            <AlertDescription className="text-green-800 font-medium">
              🎉 Welcome to Raffily! Your business account is live and ready to generate leads!
            </AlertDescription>
          </Alert>
        )}

        {/* Dashboard Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome, {session.user.businessName || session.user.name}!
            </h1>
          </div>
          <p className="text-xl text-gray-600">Ready to supercharge your customer engagement? 🚀</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600"></div>
            <CardHeader className="relative pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-blue-100">Active Raffles</CardTitle>
                <Zap className="w-5 h-5 text-blue-200" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-white mb-1">0</div>
              <p className="text-xs text-blue-100">Ready to create your first one?</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600"></div>
            <CardHeader className="relative pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-purple-100">Total Entries</CardTitle>
                <Users className="w-5 h-5 text-purple-200" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-white mb-1">0</div>
              <p className="text-xs text-purple-100">Your audience awaits!</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600"></div>
            <CardHeader className="relative pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-green-100">Subscription</CardTitle>
                <TrendingUp className="w-5 h-5 text-green-200" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold text-white mb-1">Active ✨</div>
              <p className="text-xs text-green-100">All systems go!</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-red-50 opacity-50"></div>
            <CardHeader className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Create Your First Raffle</CardTitle>
              </div>
              <CardDescription className="text-gray-600">
                Launch your first campaign and start collecting leads in minutes! 🎯
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <Button
                onClick={() => router.push("/business/raffles")}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Create Your First Raffle
              </Button>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-50"></div>
            <CardHeader className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Customize Your Brand</CardTitle>
              </div>
              <CardDescription className="text-gray-600">
                Make your raffles uniquely yours with custom branding and colors! 🎨
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <Button
                onClick={() => router.push("/business/customize")}
                variant="outline"
                className="w-full border-2 border-purple-300 text-purple-600 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
              >
                <Palette className="w-4 h-4 mr-2" />
                Customize Branding
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Success Tips */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <TrendingUp className="w-5 h-5" />💡 Quick Success Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2 text-blue-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Create your first raffle within 5 minutes</span>
              </div>
              <div className="flex items-center gap-2 text-blue-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Customize branding to match your business</span>
              </div>
              <div className="flex items-center gap-2 text-blue-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Share your raffle link to start collecting leads</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
