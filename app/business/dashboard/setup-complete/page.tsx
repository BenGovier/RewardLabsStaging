"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

export default function SetupComplete() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const handleAutoSignin = async () => {
      try {
        console.log("🔄 Starting auto-signin process...")

        // Get session ID from Stripe redirect
        const sessionId = searchParams.get("session_id")

        if (!sessionId) {
          console.log("❌ No session ID found in URL")
          setStatus("error")
          setMessage("No session ID found. Please try signing in manually.")
          return
        }

        console.log("📋 Session ID found:", sessionId)

        // Look for auth token in our database
        const response = await fetch("/api/auth/auto-signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        })

        if (!response.ok) {
          throw new Error("Auto-signin failed")
        }

        const data = await response.json()
        console.log("✅ Auto-signin response:", data)

        if (data.success && data.user) {
          // Sign in the user
          const result = await signIn("credentials", {
            email: data.user.email,
            password: "auto-signin", // Special flag for auto-signin
            redirect: false,
          })

          if (result?.ok) {
            console.log("✅ User signed in successfully")
            setStatus("success")
            setMessage("Account created and signed in successfully!")

            // Redirect to dashboard after a brief delay
            setTimeout(() => {
              router.push("/business/dashboard?setup=success")
            }, 2000)
          } else {
            throw new Error("Sign-in failed")
          }
        } else {
          throw new Error("Invalid auto-signin response")
        }
      } catch (error) {
        console.error("❌ Auto-signin error:", error)
        setStatus("error")
        setMessage("Auto-signin failed. Redirecting to sign-in page...")

        // Redirect to sign-in after delay
        setTimeout(() => {
          router.push("/auth/signin?message=Please sign in with your new account")
        }, 3000)
      }
    }

    handleAutoSignin()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center">
          {status === "loading" && (
            <>
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <h2 className="text-xl font-semibold mb-2">Setting up your account...</h2>
              <p className="text-gray-600">Please wait while we complete your setup.</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="w-8 h-8 mx-auto mb-4 text-green-600" />
              <h2 className="text-xl font-semibold mb-2 text-green-800">Setup Complete!</h2>
              <p className="text-gray-600">{message}</p>
              <p className="text-sm text-gray-500 mt-2">Redirecting to your dashboard...</p>
            </>
          )}

          {status === "error" && (
            <>
              <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-600" />
              <h2 className="text-xl font-semibold mb-2 text-red-800">Setup Issue</h2>
              <p className="text-gray-600">{message}</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
