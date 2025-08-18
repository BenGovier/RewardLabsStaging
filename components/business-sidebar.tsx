"use client"
import { LayoutDashboard, Download, User, Gift, LogOut, Trophy, Code } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { signOut } from "next-auth/react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: "Dashboard", href: "/business/dashboard", icon: LayoutDashboard },
  { name: "My Raffles", href: "/business/raffles", icon: Gift },
  { name: "Winners", href: "/business/winners", icon: Trophy },
  { name: "API Integration", href: "/business/api-integration", icon: Code },
  { name: "Entrants / Export Data", href: "/business/entrants", icon: Download },
  { name: "Account Settings", href: "/business/settings", icon: User },
]

interface SidebarProps {
  className?: string
}

export const BusinessSidebar = ({ className }: SidebarProps) => {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <div className={cn("w-64 space-y-4 py-4 flex flex-col h-full", className)}>
      <div className="px-3 py-2 flex-1">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Business</h2>
        <div className="space-y-1">
          {navigation.map((item) => (
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2 p-4",
                pathname === item.href ? "bg-secondary text-primary" : "hover:bg-secondary/50",
              )}
              key={item.href}
              onClick={() => router.push(item.href)}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Button>
          ))}
        </div>
      </div>
      {/* Logout Section */}
      <div className="px-3 py-2 mt-auto">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 p-4 text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => signOut({ callbackUrl: "/auth/signin" })}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
