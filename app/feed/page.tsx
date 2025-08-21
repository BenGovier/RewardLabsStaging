"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThumbsUp, MessageCircle, Trash2, Send, ImageIcon, Video, X, MoreHorizontal, Share, Edit } from "lucide-react"
import type { PostWithAuthor } from "@/models/post"
import type { CommentWithAuthor } from "@/models/comment"
import { WhosOnline } from "@/components/whos-online"

export default function FeedPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [posts, setPosts] = useState<PostWithAuthor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newPostContent, setNewPostContent] = useState("")
  const [isCreatingPost, setIsCreatingPost] = useState(false)
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())
  const [comments, setComments] = useState<Record<string, CommentWithAuthor[]>>({})
  const [newComments, setNewComments] = useState<Record<string, string>>({})
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ url: string; name: string; type: string }>>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMorePosts, setHasMorePosts] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [editFiles, setEditFiles] = useState<Array<{ url: string; name: string; type: string }>>([])
  const [isUpdatingPost, setIsUpdatingPost] = useState(false)

  useEffect(() => {
    if (status === "loading") return

    if (!session?.user) {
      router.push("/auth/signin")
      return
    }

    // Redirect business users to their dashboard
    if (session.user.role === "business") {
      console.log("Business user detected, redirecting to business dashboard")
      router.push("/business/dashboard")
      return
    }

    fetchPosts()

    // Update user activity every 30 seconds
    const activityInterval = setInterval(() => {
      fetch("/api/users/activity", { method: "POST" })
    }, 30000)

    // Initial activity update
    fetch("/api/users/activity", { method: "POST" })

    return () => clearInterval(activityInterval)
  }, [session, status, router])

  const fetchPosts = async (page = 1, append = false) => {
    try {
      console.log("🔄 Fetching posts...", { page, append })
      const response = await fetch(`/api/feed/posts?limit=10&page=${page}`)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("❌ Failed to fetch posts:", errorData)
        throw new Error(`Failed to fetch posts: ${errorData.error || response.statusText}`)
      }

      const data = await response.json()
      console.log("✅ Posts fetched:", data.posts?.length || 0)

      if (append) {
        setPosts((prev) => [...prev, ...data.posts])
      } else {
        setPosts(data.posts)
      }

      setHasMorePosts(data.meta.hasMore)
      setCurrentPage(page)
    } catch (error) {
      console.error("❌ Error fetching posts:", error)
      alert("Failed to load posts. Please check the console for details.")
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  const loadMorePosts = async () => {
    if (isLoadingMore || !hasMorePosts) return

    setIsLoadingMore(true)
    await fetchPosts(currentPage + 1, true)
  }

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return

    setIsUploading(true)
    const newFiles: Array<{ url: string; name: string; type: string }> = []

    try {
      for (const file of Array.from(files)) {
        console.log("📤 Uploading file:", file.name)

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert(`File ${file.name} is too large. Maximum size is 5MB.`)
          continue
        }

        // Validate file type
        const allowedTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/gif",
          "image/webp",
          "video/mp4",
          "video/webm",
          "video/quicktime",
        ]
        if (!allowedTypes.includes(file.type)) {
          alert(`File ${file.name} is not a supported format. Please use images or videos only.`)
          continue
        }

        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/feed/posts/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error("❌ Upload failed:", errorData)
          throw new Error(`Upload failed: ${errorData.error || response.statusText}`)
        }

        const result = await response.json()
        console.log("✅ File uploaded:", result)

        newFiles.push({
          url: result.url,
          name: result.fileName,
          type: result.type,
        })
      }

      setUploadedFiles((prev) => [...prev, ...newFiles])
    } catch (error) {
      console.error("❌ Error uploading files:", error)
      alert("Failed to upload files. Please check the console for details.")
    } finally {
      setIsUploading(false)
    }
  }

  const removeUploadedFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPostContent.trim() && uploadedFiles.length === 0) {
      alert("Please add some content or upload a file")
      return
    }

    setIsCreatingPost(true)
    try {
      console.log("📝 Creating post...")

      const mediaUrls = uploadedFiles.map((file) => file.url)

      const response = await fetch("/api/feed/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentText: newPostContent,
          mediaUrls,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("❌ Failed to create post:", errorData)
        throw new Error(`Failed to create post: ${errorData.error || response.statusText}`)
      }

      const result = await response.json()
      console.log("✅ Post created:", result)

      setNewPostContent("")
      setUploadedFiles([])
      fetchPosts() // Refresh posts
    } catch (error) {
      console.error("❌ Error creating post:", error)
      alert("Failed to create post. Please check the console for details.")
    } finally {
      setIsCreatingPost(false)
    }
  }

  const deletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return

    try {
      const response = await fetch(`/api/feed/posts/${postId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete post")

      setPosts((prev) => prev.filter((post) => post._id !== postId))
    } catch (error) {
      console.error("Error deleting post:", error)
    }
  }

  const toggleReaction = async (postId: string, reactionType: "like" = "like") => {
    try {
      console.log("👍 Toggling like for post:", postId)
      const response = await fetch(`/api/feed/posts/${postId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reactionType }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("❌ Failed to toggle reaction:", errorData)
        throw new Error("Failed to toggle reaction")
      }

      const result = await response.json()
      console.log("✅ Reaction toggled:", result)

      // Refresh posts to get updated reaction counts
      fetchPosts()
    } catch (error) {
      console.error("Error toggling reaction:", error)
    }
  }

  const fetchComments = async (postId: string) => {
    try {
      console.log("💬 Fetching comments for post:", postId)
      const response = await fetch(`/api/feed/posts/${postId}/comments`)
      if (!response.ok) {
        const errorData = await response.json()
        console.error("❌ Failed to fetch comments:", errorData)
        throw new Error("Failed to fetch comments")
      }

      const data = await response.json()
      console.log("✅ Comments fetched:", data.comments?.length || 0)
      setComments((prev) => ({ ...prev, [postId]: data.comments }))
    } catch (error) {
      console.error("Error fetching comments:", error)
    }
  }

  const toggleComments = async (postId: string) => {
    if (expandedComments.has(postId)) {
      setExpandedComments((prev) => {
        const newSet = new Set(prev)
        newSet.delete(postId)
        return newSet
      })
    } else {
      setExpandedComments((prev) => new Set(prev).add(postId))
      if (!comments[postId]) {
        await fetchComments(postId)
      }
    }
  }

  const addComment = async (postId: string) => {
    const content = newComments[postId]?.trim()
    if (!content) return

    try {
      console.log("💬 Adding comment to post:", postId)
      const response = await fetch(`/api/feed/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentText: content }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("❌ Failed to add comment:", errorData)
        throw new Error("Failed to add comment")
      }

      const result = await response.json()
      console.log("✅ Comment added:", result)

      setNewComments((prev) => ({ ...prev, [postId]: "" }))
      await fetchComments(postId) // Refresh comments
      fetchPosts() // Refresh posts to update comment count
    } catch (error) {
      console.error("Error adding comment:", error)
      alert("Failed to add comment. Please try again.")
    }
  }

  const startEditPost = (post: PostWithAuthor) => {
    setEditingPostId(post._id as string)
    setEditContent(post.contentText)
    setEditFiles(
      post.mediaUrls.map((url) => ({
        url,
        name: url.split("/").pop() || "file",
        type: url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? "image" : "file",
      })),
    )
  }

  const cancelEdit = () => {
    setEditingPostId(null)
    setEditContent("")
    setEditFiles([])
  }

  const savePostEdit = async (postId: string) => {
    if (!editContent.trim() && editFiles.length === 0) {
      alert("Please add some content or upload a file")
      return
    }

    setIsUpdatingPost(true)
    try {
      console.log("📝 Updating post:", postId)

      const mediaUrls = editFiles.map((file) => file.url)

      const response = await fetch(`/api/feed/posts/${postId}/edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentText: editContent,
          mediaUrls,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("❌ Failed to update post:", errorData)
        throw new Error(`Failed to update post: ${errorData.error || response.statusText}`)
      }

      const result = await response.json()
      console.log("✅ Post updated:", result)

      cancelEdit()
      fetchPosts() // Refresh posts
    } catch (error) {
      console.error("❌ Error updating post:", error)
      alert("Failed to update post. Please check the console for details.")
    } finally {
      setIsUpdatingPost(false)
    }
  }

  const removeEditFile = (index: number) => {
    setEditFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleEditFileUpload = async (files: FileList) => {
    if (!files.length) return

    setIsUploading(true)
    const newFiles: Array<{ url: string; name: string; type: string }> = []

    try {
      for (const file of Array.from(files)) {
        console.log("📤 Uploading file for edit:", file.name)

        if (file.size > 5 * 1024 * 1024) {
          alert(`File ${file.name} is too large. Maximum size is 5MB.`)
          continue
        }

        const allowedTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/gif",
          "image/webp",
          "video/mp4",
          "video/webm",
          "video/quicktime",
        ]
        if (!allowedTypes.includes(file.type)) {
          alert(`File ${file.name} is not a supported format.`)
          continue
        }

        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/feed/posts/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error("❌ Upload failed:", errorData)
          throw new Error(`Upload failed: ${errorData.error || response.statusText}`)
        }

        const result = await response.json()
        console.log("✅ File uploaded for edit:", result)

        newFiles.push({
          url: result.url,
          name: result.fileName,
          type: result.type,
        })
      }

      setEditFiles((prev) => [...prev, ...newFiles])
    } catch (error) {
      console.error("❌ Error uploading files for edit:", error)
      alert("Failed to upload files. Please check the console for details.")
    } finally {
      setIsUploading(false)
    }
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your feed...</p>
        </div>
      </div>
    )
  }

  const canCreatePost = session?.user?.role === "admin" || session?.user?.role === "rep"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="flex">
        {/* Main Feed Content */}
        <div className="flex-1 py-6">
          <div className="max-w-2xl mx-auto px-4 space-y-6">
            {/* Create Post Form - Enhanced Design */}
            {canCreatePost && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="ring-2 ring-blue-100">
                      <AvatarImage src={session?.user?.profilePictureUrl || "/placeholder.svg"} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {getInitials(session?.user?.firstName || "", session?.user?.lastName || "")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <textarea
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        placeholder="Share something today..."
                        rows={3}
                        className="w-full p-4 border-0 bg-gray-50 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 text-gray-800 placeholder-gray-500"
                      />

                      {/* File Upload Preview */}
                      {uploadedFiles.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 gap-3">
                          {uploadedFiles.map((file, index) => (
                            <div
                              key={index}
                              className="relative border-2 border-dashed border-gray-200 rounded-xl overflow-hidden group"
                            >
                              <button
                                onClick={() => removeUploadedFile(index)}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors z-10 opacity-0 group-hover:opacity-100"
                              >
                                <X className="h-3 w-3" />
                              </button>
                              {file.type.startsWith("image/") ? (
                                <img
                                  src={file.url || "/placeholder.svg"}
                                  alt={file.name}
                                  className="w-full h-32 object-cover"
                                />
                              ) : (
                                <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                  <Video className="h-8 w-8 text-gray-400" />
                                  <span className="ml-2 text-sm text-gray-600 truncate">{file.name}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-3">
                          <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*,video/*"
                            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors"
                          >
                            <ImageIcon className="h-4 w-4 mr-2" />
                            {isUploading ? "Uploading..." : "Photo/Video"}
                          </Button>
                        </div>

                        <Button
                          onClick={createPost}
                          disabled={isCreatingPost || (!newPostContent.trim() && uploadedFiles.length === 0)}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                          {isCreatingPost ? "Posting..." : "Post"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Posts Feed - Enhanced Design */}
            <div className="space-y-6">
              {posts.map((post) => (
                <Card
                  key={post._id as string}
                  className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="ring-2 ring-gray-100">
                          <AvatarImage src={post.author.profilePictureUrl || "/placeholder.svg"} />
                          <AvatarFallback className="bg-gradient-to-br from-gray-500 to-gray-600 text-white">
                            {getInitials(post.author.firstName, post.author.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {post.author.firstName} {post.author.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        {(post.authorId === session?.user?.id || session?.user?.role === "admin") && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditPost(post)}
                              className="text-blue-400 hover:text-blue-600 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deletePost(post._id as string)}
                              className="text-red-400 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {editingPostId === post._id ? (
                      // Edit Mode
                      <div className="space-y-4">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          placeholder="Edit your post..."
                          rows={3}
                          className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        />

                        {/* Edit File Preview */}
                        {editFiles.length > 0 && (
                          <div className="grid grid-cols-2 gap-3">
                            {editFiles.map((file, index) => (
                              <div
                                key={index}
                                className="relative border-2 border-dashed border-gray-200 rounded-xl overflow-hidden group"
                              >
                                <button
                                  onClick={() => removeEditFile(index)}
                                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors z-10 opacity-0 group-hover:opacity-100"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                                {file.type === "image" ? (
                                  <img
                                    src={file.url || "/placeholder.svg"}
                                    alt={file.name}
                                    className="w-full h-32 object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                    <Video className="h-8 w-8 text-gray-400" />
                                    <span className="ml-2 text-sm text-gray-600 truncate">{file.name}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Edit Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center space-x-3">
                            <input
                              type="file"
                              multiple
                              accept="image/*,video/*"
                              onChange={(e) => e.target.files && handleEditFileUpload(e.target.files)}
                              className="hidden"
                              id={`edit-file-${post._id}`}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => document.getElementById(`edit-file-${post._id}`)?.click()}
                              disabled={isUploading}
                              className="text-green-600 hover:bg-green-50 hover:text-green-700"
                            >
                              <ImageIcon className="h-4 w-4 mr-2" />
                              {isUploading ? "Uploading..." : "Add Files"}
                            </Button>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" onClick={cancelEdit} disabled={isUpdatingPost}>
                              Cancel
                            </Button>
                            <Button
                              onClick={() => savePostEdit(post._id as string)}
                              disabled={isUpdatingPost || (!editContent.trim() && editFiles.length === 0)}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              {isUpdatingPost ? "Saving..." : "Save"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // View Mode (existing content)
                      <>
                        {post.contentText && <p className="text-gray-800 leading-relaxed">{post.contentText}</p>}

                        {/* Media Preview - Enhanced */}
                        {post.mediaUrls.length > 0 && (
                          <div className="space-y-3">
                            {post.mediaUrls.map((url, index) => (
                              <div key={index} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                  <img
                                    src={url || "/placeholder.svg"}
                                    alt="Post media"
                                    className="w-full h-auto max-h-96 object-cover"
                                  />
                                ) : url.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                                  <video controls className="w-full h-auto max-h-96">
                                    <source src={url} />
                                    Your browser does not support the video tag.
                                  </video>
                                ) : (
                                  <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100">
                                    <a
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                      {url}
                                    </a>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    {/* Reactions and Comments - Enhanced */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-6">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleReaction(post._id as string)}
                          className={`flex items-center space-x-2 transition-all duration-200 ${
                            post.userReaction === "like"
                              ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
                              : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                          }`}
                        >
                          <ThumbsUp className="h-4 w-4" />
                          <span className="font-medium">{post.reactionCounts.like || 0}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleComments(post._id as string)}
                          className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all duration-200"
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span className="font-medium">{post.commentCount || 0}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all duration-200"
                        >
                          <Share className="h-4 w-4" />
                          <span className="font-medium">Share</span>
                        </Button>
                      </div>
                    </div>

                    {/* Comments Section - Enhanced */}
                    {expandedComments.has(post._id as string) && (
                      <div className="space-y-4 pt-4 border-t border-gray-100">
                        {/* Add Comment */}
                        <div className="flex space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={session?.user?.profilePictureUrl || "/placeholder.svg"} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                              {getInitials(session?.user?.firstName || "", session?.user?.lastName || "")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 flex space-x-2">
                            <Input
                              value={newComments[post._id as string] || ""}
                              onChange={(e) =>
                                setNewComments((prev) => ({ ...prev, [post._id as string]: e.target.value }))
                              }
                              placeholder="Write a comment..."
                              className="flex-1 border-gray-200 focus:border-blue-500 rounded-full bg-gray-50 focus:bg-white transition-all duration-200"
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  addComment(post._id as string)
                                }
                              }}
                            />
                            <Button
                              size="sm"
                              onClick={() => addComment(post._id as string)}
                              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Comments List */}
                        <div className="space-y-3 ml-11">
                          {comments[post._id as string]?.map((comment) => (
                            <div key={comment._id as string} className="flex space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={comment.author.profilePictureUrl || "/placeholder.svg"} />
                                <AvatarFallback className="bg-gradient-to-br from-gray-500 to-gray-600 text-white text-xs">
                                  {getInitials(comment.author.firstName, comment.author.lastName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="bg-gray-50 rounded-2xl px-4 py-2">
                                  <p className="font-semibold text-sm text-gray-900">
                                    {comment.author.firstName} {comment.author.lastName}
                                  </p>
                                  <p className="text-sm text-gray-700">{comment.contentText}</p>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 ml-4">{formatDate(comment.createdAt)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More Button */}
            {hasMorePosts && posts.length > 0 && (
              <div className="text-center">
                <Button
                  onClick={loadMorePosts}
                  disabled={isLoadingMore}
                  variant="outline"
                  className="bg-white/80 backdrop-blur-sm hover:bg-white border-gray-200 hover:border-gray-300 transition-all duration-200"
                >
                  {isLoadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Loading more posts...
                    </>
                  ) : (
                    "Load More Posts"
                  )}
                </Button>
              </div>
            )}

            {posts.length === 0 && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="text-center py-12">
                  <div className="text-6xl mb-4">🌟</div>
                  <p className="text-gray-600 text-lg mb-2">No posts yet!</p>
                  {canCreatePost && (
                    <p className="text-gray-500">Share something today to get the conversation started.</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Who's Online Sidebar - Enhanced */}
        <div className="w-80 border-l border-gray-200/50 bg-white/30 backdrop-blur-sm">
          <div className="sticky top-6 p-6">
            <WhosOnline />
          </div>
        </div>
      </div>
    </div>
  )
}
