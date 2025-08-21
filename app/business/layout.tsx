"use client"

import type React from "react"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { LayoutDashboard, Download, User, Gift, LogOut, Trophy, Code } from "lucide-react"

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (!session?.user) {
      router.push("/auth/signin")
      return
    }

    if (session.user.role !== "business") {
      // Redirect based on role
      if (session.user.role === "admin") {
        router.push("/admin/dashboard")
      } else {
        router.push("/feed")
      }
      return
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== "business") {
    return null // Will redirect
  }

  return (
    <div className="flex h-screen">
      {/* Business Sidebar - Fixed Width */}
      <div className="w-64 h-screen bg-gray-50/40 border-r flex flex-col">
        {/* Sidebar Header */}
        <div className="px-3 py-4">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Business</h2>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-3">
          <div className="space-y-1">
            <button
              onClick={() => router.push("/business/dashboard")}
              className="w-full flex items-center gap-2 px-4 py-2 text-left rounded-md hover:bg-gray-100"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </button>
            <button
              onClick={() => router.push("/business/raffles")}
              className="w-full flex items-center gap-2 px-4 py-2 text-left rounded-md hover:bg-gray-100"
            >
              <Gift className="h-4 w-4" />
              My Raffles
            </button>
            <button
              onClick={() => router.push("/business/api-integration")}
              className="w-full flex items-center gap-2 px-4 py-2 text-left rounded-md hover:bg-gray-100"
            >
              <Code className="h-4 w-4" />
              API Integration
            </button>
            <button
              onClick={() => router.push("/business/entrants")}
              className="w-full flex items-center gap-2 px-4 py-2 text-left rounded-md hover:bg-gray-100"
            >
              <Download className="h-4 w-4" />
              Entrants / Export Data
            </button>
            <button
              onClick={() => router.push("/business/winners")}
              className="w-full flex items-center gap-2 px-4 py-2 text-left rounded-md hover:bg-gray-100"
            >
              <Trophy className="h-4 w-4" />
              Winners
            </button>
            <button
              onClick={() => router.push("/business/settings")}
              className="w-full flex items-center gap-2 px-4 py-2 text-left rounded-md hover:bg-gray-100"
            >
              <User className="h-4 w-4" />
              Account Settings
            </button>
          </div>
        </div>

        {/* Logout Button at Bottom */}
        <div className="px-3 py-4 mt-auto">
          <button
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            className="w-full flex items-center gap-2 px-4 py-2 text-left rounded-md hover:bg-red-50 text-red-600 hover:text-red-700"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto p-8">{children}</div>
      </main>
    </div>
  )
}
