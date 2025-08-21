"use client"

export const dynamic = "force-dynamic"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, ArrowLeft, Smile, Paperclip, Download } from "lucide-react"
import type { MessageWithSender, MessageAttachment } from "@/models/message"

interface MessagesResponse {
  messages: MessageWithSender[]
}

export default function ConversationPage({ params }: { params: { conversationId: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [messages, setMessages] = useState<MessageWithSender[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [otherUser, setOtherUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [pendingAttachments, setPendingAttachments] = useState<MessageAttachment[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (status === "loading") return

    if (!session?.user) {
      router.push("/auth/signin")
      return
    }

    // Verify user is participant in this conversation
    const participantIds = params.conversationId.split("_")
    if (!participantIds.includes(session.user.id)) {
      router.push("/directory")
      return
    }

    fetchMessages()
  }, [session, status, router, params.conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchOtherUserInfo = async (otherUserId: string) => {
    try {
      const response = await fetch(`/api/users/${otherUserId}`)
      if (response.ok) {
        const data = await response.json()
        console.log("Fetched other user info:", data.user)
        setOtherUser(data.user)
      } else {
        console.error("Failed to fetch other user info:", response.status)
      }
    } catch (error) {
      console.error("Error fetching other user info:", error)
    }
  }

  const fetchMessages = async () => {
    try {
      const apiUrl = `/api/messages/${params.conversationId}?limit=50`
      console.log("Fetching messages from:", apiUrl)

      const response = await fetch(apiUrl)
      console.log("Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response:", errorText)
        throw new Error(`Failed to fetch messages: ${response.status} ${errorText}`)
      }

      const contentType = response.headers.get("content-type")
      console.log("Response content type:", contentType)

      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error("Non-JSON response:", text.substring(0, 200) + "...")
        throw new Error("Invalid response format")
      }

      const data: MessagesResponse = await response.json()

      // After fetching messages:
      console.log("Raw messages response:", data)
      console.log(
        "Messages with attachments:",
        data.messages.filter((m) => m.attachments && m.attachments.length > 0),
      )
      console.log(
        "First message attachments:",
        data.messages.length > 0 && data.messages[0].attachments ? data.messages[0].attachments : "No attachments",
      )

      console.log("Messages received:", data.messages.length)
      console.log(
        "Sample message with attachments:",
        data.messages.find((m) => m.attachments && m.attachments.length > 0),
      )
      setMessages(data.messages)

      // Try to update other user info from messages if available
      const participantIds = params.conversationId.split("_")
      const otherUserId = participantIds.find((id) => id !== session?.user.id)

      if (otherUserId) {
        console.log("Looking for other user ID:", otherUserId)

        // First try to find the other user's info from messages
        const otherUserMessage = data.messages.find((msg) => msg.senderId === otherUserId)

        if (otherUserMessage && otherUserMessage.sender) {
          console.log("Found other user message with sender:", otherUserMessage.sender)
          setOtherUser(otherUserMessage.sender)
        } else {
          console.log("No messages from other user, fetching user info directly")
          // If no messages from other user, fetch their info directly
          await fetchOtherUserInfo(otherUserId)
        }
      }

      setError(null)
    } catch (error) {
      console.error("Error fetching messages:", error)
      setError(error instanceof Error ? error.message : "Failed to load messages")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/messages/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to upload file")
      }

      const data = await response.json()
      console.log("File uploaded successfully:", data.attachment)
      setPendingAttachments((prev) => [...prev, data.attachment])
    } catch (error) {
      console.error("Error uploading file:", error)
      alert("Failed to upload file. Please try again.")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const removePendingAttachment = (index: number) => {
    setPendingAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!newMessage.trim() && pendingAttachments.length === 0) || isSending) return

    console.log("Send message triggered")
    console.log("Pending attachments:", pendingAttachments)
    setIsSending(true)

    try {
      const participantIds = params.conversationId.split("_")
      const recipientId = participantIds.find((id) => id !== session?.user.id)

      const messageData = {
        recipientId: recipientId || participantIds[0],
        contentText: newMessage.trim(),
        attachments: pendingAttachments,
      }

      console.log("Sending message data:", messageData)

      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("API Error:", errorData)
        throw new Error("Failed to send message")
      }

      const result = await response.json()
      console.log("Message sent successfully:", result)

      // Clear the form immediately
      setNewMessage("")
      setPendingAttachments([])

      // Refresh messages to get the updated list from server
      setTimeout(() => {
        fetchMessages()
      }, 500)
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Failed to send message. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      console.log("Adding reaction:", emoji, "to message:", messageId)
      const response = await fetch(`/api/message-reactions/${messageId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log("Reaction result:", result)
        // Refresh messages to get updated reactions
        fetchMessages()
      } else {
        const errorData = await response.json()
        console.error("Reaction error:", errorData)
      }
    } catch (error) {
      console.error("Error adding reaction:", error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const formatTime = (timestamp: Date | string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDate = (timestamp: Date | string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const shouldShowAvatar = (message: MessageWithSender, index: number) => {
    if (index === 0) return true
    const prevMessage = messages[index - 1]
    return prevMessage.senderId !== message.senderId
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("image")) return "🖼️"
    if (fileType.includes("pdf")) return "📄"
    if (fileType.includes("powerpoint") || fileType.includes("presentation")) return "📊"
    if (fileType.includes("word") || fileType.includes("document")) return "📝"
    if (fileType.includes("zip")) return "🗜️"
    return "📎"
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded w-64"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="rounded-none border-x-0 border-t-0 shadow-md">
          <CardHeader className="py-4 bg-white border-b">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => router.push("/messages")} className="hover:bg-gray-100">
                <ArrowLeft className="h-4 w-4 text-gray-600" />
              </Button>
              {otherUser ? (
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                    <AvatarImage src={otherUser.profilePictureUrl || ""} />
                    <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                      {getInitials(otherUser.firstName || "U", otherUser.lastName || "U")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {otherUser.firstName} {otherUser.lastName}
                    </CardTitle>
                    <p className="text-sm text-green-500 font-medium">Online</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                    <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">UR</AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <CardTitle className="text-lg font-semibold text-gray-900">Loading...</CardTitle>
                    <p className="text-sm text-gray-500 font-medium">...</p>
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Messages */}
        <div className="h-[calc(100vh-200px)] overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white">
          {error ? (
            <div className="text-center text-red-500 p-4">
              <p>Error: {error}</p>
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => {
                  setError(null)
                  setIsLoading(true)
                  fetchMessages()
                }}
              >
                Retry
              </Button>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 p-4">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message, index) => {
              const isCurrentUser = message.senderId === session?.user.id
              const showAvatar = shouldShowAvatar(message, index)
              const showTimestamp =
                index === messages.length - 1 ||
                (index < messages.length - 1 && messages[index + 1].senderId !== message.senderId)

              return (
                <div
                  key={message._id as string}
                  className={`flex mb-4 ${isCurrentUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex max-w-xs lg:max-w-md ${isCurrentUser ? "flex-row-reverse" : "flex-row"} items-end`}
                  >
                    {/* Avatar */}
                    <div className={`flex-shrink-0 ${isCurrentUser ? "ml-3" : "mr-3"}`}>
                      {showAvatar && !isCurrentUser ? (
                        <Avatar className="h-8 w-8 border border-gray-200">
                          <AvatarImage src={message.sender?.profilePictureUrl || ""} />
                          <AvatarFallback className="bg-gray-100 text-gray-600 font-medium text-xs">
                            {message.sender
                              ? getInitials(message.sender.firstName || "U", message.sender.lastName || "U")
                              : "U"}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="h-8 w-8" />
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div className="flex flex-col">
                      {showAvatar && !isCurrentUser && message.sender && (
                        <div className="text-xs text-gray-500 mb-1 px-3">
                          {message.sender.firstName || "User"} {message.sender.lastName || ""}
                        </div>
                      )}
                      <div
                        className={`rounded-2xl px-4 py-2 group relative max-w-full break-words ${
                          isCurrentUser
                            ? "bg-blue-600 text-white rounded-br-md"
                            : "bg-gray-100 text-gray-900 rounded-bl-md border border-gray-200"
                        }`}
                      >
                        {message.contentText && <p className="text-sm leading-relaxed mb-2">{message.contentText}</p>}

                        {/* File Attachments */}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="space-y-2">
                            {message.attachments.map((attachment, idx) => (
                              <div
                                key={idx}
                                className={`flex items-center space-x-2 p-2 rounded-lg ${
                                  isCurrentUser ? "bg-blue-500" : "bg-gray-200"
                                }`}
                              >
                                <span className="text-lg">{getFileIcon(attachment.fileType)}</span>
                                <div className="flex-1 min-w-0">
                                  <p
                                    className={`text-sm font-medium truncate ${isCurrentUser ? "text-white" : "text-gray-900"}`}
                                  >
                                    {attachment.fileName}
                                  </p>
                                  <p className={`text-xs ${isCurrentUser ? "text-blue-100" : "text-gray-500"}`}>
                                    {formatFileSize(attachment.fileSize)}
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className={`h-8 w-8 p-0 ${isCurrentUser ? "hover:bg-blue-400 text-white" : "hover:bg-gray-300"}`}
                                  onClick={() => window.open(attachment.fileUrl, "_blank")}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Reaction buttons - show on hover */}
                        <div
                          className={`absolute -bottom-8 ${isCurrentUser ? "right-0" : "left-0"} bg-white rounded-full shadow-lg border border-gray-200 px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1 z-10`}
                        >
                          {["👍", "❤️", "😂", "😮", "👏"].map((emoji) => (
                            <button
                              key={emoji}
                              className="hover:bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center text-xs transition-colors"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleReaction(message._id as string, emoji)
                              }}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Show existing reactions */}
                      {message.reactions && message.reactions.length > 0 && (
                        <div className={`flex flex-wrap gap-1 mt-1 ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                          {Object.entries(
                            message.reactions.reduce((acc: any, reaction: any) => {
                              acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1
                              return acc
                            }, {}),
                          ).map(([emoji, count]) => (
                            <span key={emoji} className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                              {emoji} {count}
                            </span>
                          ))}
                        </div>
                      )}

                      {showTimestamp && (
                        <div
                          className={`text-xs text-gray-500 mt-1 ${isCurrentUser ? "text-right" : "text-left"} px-3`}
                        >
                          {formatDate(message.timestamp)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <Card className="rounded-none border-x-0 border-b-0 shadow-md">
          <CardContent className="p-4 bg-white">
            {/* Pending Attachments */}
            {pendingAttachments.length > 0 && (
              <div className="mb-3 space-y-2">
                {pendingAttachments.map((attachment, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-gray-100 rounded-lg">
                    <span className="text-lg">{getFileIcon(attachment.fileType)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{attachment.fileName}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(attachment.fileSize)}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removePendingAttachment(index)}
                      className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={sendMessage} className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                disabled={isSending}
                className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.zip,.txt,.doc,.docx"
                className="hidden"
              />
              <Button
                type="button"
                variant="ghost"
                className="hover:bg-gray-100"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Paperclip className="h-5 w-5 text-gray-500" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="hover:bg-gray-100"
                onClick={() => {
                  /* Emoji picker would open here */
                }}
              >
                <Smile className="h-5 w-5 text-gray-500" />
              </Button>
              <Button
                type="submit"
                disabled={isSending || (!newMessage.trim() && pendingAttachments.length === 0)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
