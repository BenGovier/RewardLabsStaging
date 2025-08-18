"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Home, Users, TrendingUp, BookOpen, Briefcase, Settings, LogOut, BarChart3 } from "lucide-react"
import Link from "next/link"

export function Navigation() {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  if (!session?.user) return null

  const isAdmin = session.user.role === "admin"
  const isRep = session.user.role === "rep"

  const getInitials = (name: string) => {
    return (
      name
        ?.split(" ")
        .map((n) => n.charAt(0))
        .join("")
        .toUpperCase() || "U"
    )
  }

  const navItems = [
    { href: "/feed", label: "Feed", icon: Home, show: true },
    { href: "/directory", label: "Directory", icon: Users, show: true },
    { href: "/sales", label: "Sales", icon: TrendingUp, show: true },
    { href: "/training", label: "Training", icon: BookOpen, show: true },
    { href: "/sales-tools", label: "Sales Tools", icon: Briefcase, show: true },
    { href: "/admin/dashboard", label: "Dashboard", icon: BarChart3, show: isAdmin },
    { href: "/admin/reps", label: "Manage Reps", icon: Users, show: isAdmin },
  ]

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/feed" className="text-xl font-bold text-blue-600">
            Reward Labs
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {navItems
              .filter((item) => item.show)
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src={session.user.image || "/placeholder.svg"} />
                <AvatarFallback>{getInitials(session.user.name || "")}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-1 leading-none">
                <p className="font-medium">{session.user.name}</p>
                <p className="w-[200px] truncate text-sm text-muted-foreground">{session.user.email}</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={() => signOut({ callbackUrl: "/" })}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}
