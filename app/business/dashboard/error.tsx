"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error details
    console.error("=== BUSINESS DASHBOARD ERROR ===")
    console.error("Error:", error)
    console.error("Message:", error.message)
    console.error("Stack:", error.stack)
    console.error("Digest:", error.digest)
    console.error("Time:", new Date().toISOString())
    console.error("URL:", window.location.href)
    console.error("User Agent:", navigator.userAgent)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-red-900">Dashboard Error</CardTitle>
          <CardDescription>Something went wrong loading your business dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <p className="text-sm text-red-800 font-mono">{error.message || "Unknown error occurred"}</p>
            {error.digest && <p className="text-xs text-red-600 mt-1">Error ID: {error.digest}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={reset} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>

            <Button variant="outline" onClick={() => (window.location.href = "/auth/signin")} className="w-full">
              Go to Sign In
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">If this problem persists, please contact support.</div>
        </CardContent>
      </Card>
    </div>
  )
}
