"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type OnlineUser = {
  _id: string
  firstName: string
  lastName: string
  email: string
  profilePictureUrl?: string
  status: "online" | "away" | "offline"
  lastSeen: string
}

export function WhosOnline() {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOnlineUsers = async () => {
    try {
      const response = await fetch("/api/users/online")
      if (!response.ok) {
        throw new Error("Failed to fetch online users")
      }
      const data = await response.json()
      setOnlineUsers(data.users)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching online users:", err)
      setError("Could not load online users")
      setLoading(false)
    }
  }

  const updateActivity = async () => {
    try {
      await fetch("/api/users/activity", {
        method: "POST",
      })
    } catch (err) {
      console.error("Error updating activity:", err)
    }
  }

  useEffect(() => {
    fetchOnlineUsers()
    updateActivity()

    // Set up intervals for refreshing data and updating activity
    const fetchInterval = setInterval(fetchOnlineUsers, 30000) // Every 30 seconds
    const activityInterval = setInterval(updateActivity, 60000) // Every minute

    return () => {
      clearInterval(fetchInterval)
      clearInterval(activityInterval)
    }
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500 shadow-green-200"
      case "away":
        return "bg-yellow-500 shadow-yellow-200"
      default:
        return "bg-gray-400 shadow-gray-200"
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  if (loading) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Who's Online
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Who's Online
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Who's Online
        </CardTitle>
        <p className="text-sm text-gray-500 mt-1">{onlineUsers.length} users active</p>
      </CardHeader>
      <CardContent>
        {onlineUsers.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">😴</div>
            <p className="text-gray-500 text-sm">No one's online right now</p>
          </div>
        ) : (
          <div className="space-y-3">
            {onlineUsers.map((user) => (
              <div
                key={user._id}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="relative">
                  <Avatar className="ring-2 ring-gray-100">
                    {user.profilePictureUrl ? (
                      <AvatarImage
                        src={user.profilePictureUrl || "/placeholder.svg"}
                        alt={`${user.firstName} ${user.lastName}`}
                      />
                    ) : null}
                    <AvatarFallback className="bg-gradient-to-br from-gray-500 to-gray-600 text-white text-sm">
                      {getInitials(user.firstName, user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full ${getStatusColor(user.status)} ring-2 ring-white shadow-lg`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{`${user.firstName} ${user.lastName}`}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
