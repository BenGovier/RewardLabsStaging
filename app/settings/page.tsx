"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, Camera, User } from "lucide-react"

interface UserType {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: string
  profilePictureUrl?: string
}

export default function SettingsPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [user, setUser] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")

  useEffect(() => {
    if (status === "loading") return

    if (!session?.user) {
      router.push("/auth/signin")
      return
    }

    fetchUserProfile()
  }, [session, status, router])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/users/me")
      if (!response.ok) throw new Error("Failed to fetch user profile")

      const data = await response.json()
      setUser(data.user)
    } catch (error) {
      console.error("Error fetching user profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    setIsUploading(true)
    setUploadError("")

    try {
      const formData = new FormData()
      formData.append("profilePicture", file)

      const response = await fetch(`/api/users/${user._id}/upload-picture`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to upload profile picture")
      }

      const data = await response.json()

      // Update local user state
      setUser((prev) => (prev ? { ...prev, profilePictureUrl: data.profilePictureUrl } : null))

      // Update session data
      await update({
        ...session,
        user: {
          ...session?.user,
          image: data.profilePictureUrl,
        },
      })
    } catch (error) {
      console.error("Error uploading profile picture:", error)
      setUploadError(error instanceof Error ? error.message : "Failed to upload image")
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your account settings and profile</p>
        </div>

        {/* Profile Picture Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>Upload a profile picture to personalize your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-6">
              {/* Current Profile Picture */}
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.profilePictureUrl || "/placeholder.svg"} alt="Profile picture" />
                  <AvatarFallback className="text-lg">
                    {user ? getInitials(user.firstName, user.lastName) : <User className="h-8 w-8" />}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-2">
                  <Camera className="h-4 w-4 text-white" />
                </div>
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-4">
                <div>
                  <Button onClick={handleFileSelect} disabled={isUploading} className="w-full sm:w-auto">
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploading ? "Uploading..." : "Upload New Picture"}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                <div className="text-sm text-gray-500">
                  <p>Recommended: Square image, at least 200x200 pixels</p>
                  <p>Supported formats: JPEG, PNG, WebP (max 5MB)</p>
                </div>

                {uploadError && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{uploadError}</div>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <Input value={user?.firstName || ""} readOnly />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <Input value={user?.lastName || ""} readOnly />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input value={user?.email || ""} readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <Input value={user?.role === "rep" ? "Representative" : "Administrator"} readOnly />
            </div>
            <p className="text-sm text-gray-500">Contact your administrator to update your profile information.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
