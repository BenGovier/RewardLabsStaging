"use client"

import { usePathname, useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import {
  BookOpen,
  TrendingUp,
  GraduationCap,
  Briefcase,
  Settings,
  LogOut,
  User,
  MessageCircle,
  Rss,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const repNavigation = [
  { name: "Feed", href: "/feed", icon: Rss },
  { name: "Leads", href: "/leads", icon: Users },
  { name: "Messages", href: "/messages", icon: MessageCircle },
  { name: "Directory", href: "/directory", icon: BookOpen },
  { name: "Sales", href: "/sales", icon: TrendingUp },
  { name: "Training", href: "/training", icon: GraduationCap },
  { name: "Sales Tools", href: "/sales-tools", icon: Briefcase },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function RepSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push("/")
  }

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-gray-200">
      <div className="flex flex-col h-full">
        {/* Logo/Header */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Reward Labs Portal</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {repNavigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = item.icon

            return (
              <Button
                key={item.name}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start ${
                  isActive ? "bg-blue-600 text-white hover:bg-blue-700" : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => router.push(item.href)}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Button>
            )
          })}
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={session?.user?.profilePictureUrl || "/placeholder.svg"} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {session?.user?.firstName} {session?.user?.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
            </div>
          </div>

          <Button
            variant="ghost"
            className="w-full justify-start text-gray-700 hover:bg-gray-100"
            onClick={handleSignOut}
          >
            <LogOut className="mr-3 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  )
}
