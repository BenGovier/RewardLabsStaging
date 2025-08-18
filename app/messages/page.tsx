"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, MessageCircle, Plus, Clock } from "lucide-react"
import { WhosOnline } from "@/components/whos-online"

interface Conversation {
  _id: string
  otherParticipant: {
    _id: string
    firstName: string
    lastName: string
    email: string
    profilePictureUrl?: string
  }
  lastMessage?: string
  lastUpdated: string
}

export default function MessagesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/messages/conversations")
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredConversations = conversations.filter((conversation) => {
    if (!conversation.otherParticipant) return false

    const fullName =
      `${conversation.otherParticipant.firstName} ${conversation.otherParticipant.lastName}`.toLowerCase()
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      (conversation.otherParticipant.email &&
        conversation.otherParticipant.email.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffInHours < 168) {
      // 7 days
      return date.toLocaleDateString([], { weekday: "short" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  if (loading) {
    return (
      <div className="flex">
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="w-80 border-l bg-gray-50">
          <div className="animate-pulse p-4">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex">
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            <Button onClick={() => router.push("/directory")} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              New Message
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Conversations List */}
          <Card className="shadow-md border-gray-200">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="flex items-center text-lg">
                <MessageCircle className="h-5 w-5 mr-2 text-blue-600" />
                Conversations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm ? "No conversations found" : "No conversations yet"}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm
                      ? "Try adjusting your search terms"
                      : "Start a conversation with someone from the directory"}
                  </p>
                  <Button onClick={() => router.push("/directory")} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Start New Conversation
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredConversations.map((conversation) => {
                    const otherParticipant = conversation.otherParticipant

                    if (!otherParticipant) return null

                    return (
                      <div
                        key={conversation._id}
                        className="flex items-center p-4 hover:bg-blue-50 cursor-pointer transition-colors"
                        onClick={() => router.push(`/messages/${conversation._id}`)}
                      >
                        <Avatar className="h-12 w-12 mr-4 border border-gray-200">
                          <AvatarImage src={otherParticipant.profilePictureUrl || ""} />
                          <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                            {getInitials(otherParticipant.firstName, otherParticipant.lastName)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {otherParticipant.firstName} {otherParticipant.lastName}
                            </h3>
                            {conversation.lastUpdated && (
                              <span className="text-xs text-gray-500 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatTime(conversation.lastUpdated)}
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-gray-500 truncate">
                            {conversation.lastMessage || "No messages yet"}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Who's Online Sidebar */}
      <div className="w-80 border-l bg-gray-50">
        <WhosOnline />
      </div>
    </div>
  )
}
