"use client"

import type React from "react"

import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
import { RepSidebar } from "@/components/rep-sidebar"
import { BusinessSidebar } from "@/components/business-sidebar"

const SIDEBAR_ROUTES = [
  "/messages",
  "/sales",
  "/directory",
  "/training",
  "/sales-tools",
  "/settings",
  "/admin",
  "/feed",
  // DO NOT add "/business" here — those routes use their own layout
]

interface ConditionalSidebarProps {
  children: React.ReactNode
}

export function ConditionalSidebar({ children }: ConditionalSidebarProps) {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  // Check if current route should show sidebar
  const shouldShowSidebar = SIDEBAR_ROUTES.some((route) => pathname.startsWith(route))

  // Only show sidebar for authenticated users on specific routes, but exclude business routes
  const showSidebar = session?.user && shouldShowSidebar && !pathname.startsWith("/business")

  if (showSidebar) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        {/* Show different sidebar based on user role */}
        {session?.user?.role === "admin" && <AdminSidebar />}
        {session?.user?.role === "business" && <BusinessSidebar />}
        {session?.user?.role !== "admin" && session?.user?.role !== "business" && <RepSidebar />}
        <div className="flex-1 ml-64">{children}</div>
      </div>
    )
  }

  // For routes that don't need sidebar, render children normally
  return <>{children}</>
}
