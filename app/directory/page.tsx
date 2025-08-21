"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Users } from "lucide-react"
import { generateConversationId } from "@/models/conversation"

interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: string
  profilePictureUrl?: string
}

interface UsersResponse {
  users: User[]
}

export default function DirectoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("reps")

  useEffect(() => {
    if (status === "loading") return

    if (!session?.user) {
      router.push("/auth/signin")
      return
    }

    fetchUsers()
  }, [session, status, router, activeTab])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const role = activeTab === "reps" ? "rep" : "admin"
      const response = await fetch(`/api/users?role=${role}`)
      if (!response.ok) throw new Error("Failed to fetch users")

      const data: UsersResponse = await response.json()
      setUsers(data.users)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const startConversation = (userId: string) => {
    const conversationId = generateConversationId(session!.user.id, userId)
    router.push(`/messages/${conversationId}`)
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

  const isAdmin = session?.user?.role === "admin"

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Users className="h-8 w-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-gray-900">Directory</h1>
          </div>
          <p className="text-gray-600">Connect with team members and start conversations</p>
        </div>

        {/* Tabs for Admin */}
        {isAdmin && (
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("reps")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "reps"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Representatives
                </button>
                <button
                  onClick={() => setActiveTab("admins")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "admins"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Administrators
                </button>
              </nav>
            </div>
          </div>
        )}

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <Card key={user._id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.profilePictureUrl || "/placeholder.svg"} />
                    <AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {user.firstName} {user.lastName}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {user.role === "rep" ? "Representative" : "Administrator"}
                    </CardDescription>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full" title="Offline" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 mb-3">{user.email}</p>
                <Button onClick={() => startConversation(user._id)} className="w-full" size="sm">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {users.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
              <p className="text-gray-500">
                {activeTab === "reps"
                  ? "No representatives are available to contact."
                  : "No administrators are available to contact."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
