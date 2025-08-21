"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Plus,
  Edit,
  Trash2,
  FileText,
  Facebook,
  Linkedin,
  Instagram,
  Twitter,
  Mail,
  Video,
  File,
  Upload,
  ImageIcon,
  ExternalLink,
} from "lucide-react"
import type { SalesTool } from "@/models/salesTool"

interface SalesToolsResponse {
  tools: SalesTool[]
}

export default function ManageSalesToolsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tools, setTools] = useState<SalesTool[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTool, setEditingTool] = useState<SalesTool | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isThumbnailUploading, setIsThumbnailUploading] = useState(false)
  const [thumbnailError, setThumbnailError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "facebookPost" as
      | "facebookPost"
      | "linkedinPost"
      | "instagramPost"
      | "twitterPost"
      | "emailCopy"
      | "video"
      | "pdf"
      | "ppt"
      | "doc"
      | "other",
    url: "",
    filePath: "",
    fileName: "",
    fileSize: 0,
    thumbnailUrl: "",
  })

  useEffect(() => {
    if (status === "loading") return

    if (!session?.user) {
      router.push("/auth/signin")
      return
    }

    if (session.user.role !== "admin") {
      router.push("/sales-tools")
      return
    }

    fetchTools()
  }, [session, status, router])

  const fetchTools = async () => {
    try {
      const response = await fetch("/api/sales-tools")
      if (!response.ok) throw new Error("Failed to fetch sales tools")

      const data: SalesToolsResponse = await response.json()
      setTools(data.tools)
    } catch (error) {
      console.error("Error fetching sales tools:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/sales-tools/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to upload file")
      }

      const data = await response.json()

      setFormData((prev) => ({
        ...prev,
        filePath: data.fileUrl,
        fileName: data.fileName,
        fileSize: data.fileSize,
      }))
    } catch (error) {
      console.error("Error uploading file:", error)
      setUploadError(error instanceof Error ? error.message : "Failed to upload file")
    } finally {
      setIsUploading(false)
    }
  }

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsThumbnailUploading(true)
    setThumbnailError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/sales-tools/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to upload thumbnail")
      }

      const data = await response.json()

      setFormData((prev) => ({
        ...prev,
        thumbnailUrl: data.fileUrl,
      }))
    } catch (error) {
      console.error("Error uploading thumbnail:", error)
      setThumbnailError(error instanceof Error ? error.message : "Failed to upload thumbnail")
    } finally {
      setIsThumbnailUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingTool ? `/api/sales-tools/${editingTool._id}` : "/api/sales-tools"
      const method = editingTool ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error(`Failed to ${editingTool ? "update" : "create"} sales tool`)

      setIsDialogOpen(false)
      setEditingTool(null)
      resetForm()
      fetchTools()
    } catch (error) {
      console.error("Error saving sales tool:", error)
    }
  }

  const handleEdit = (tool: SalesTool) => {
    setEditingTool(tool)
    setFormData({
      title: tool.title,
      description: tool.description,
      type: tool.type,
      url: tool.url || "",
      filePath: tool.filePath || "",
      fileName: tool.fileName || "",
      fileSize: tool.fileSize || 0,
      thumbnailUrl: tool.thumbnailUrl || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (toolId: string) => {
    if (!confirm("Are you sure you want to delete this sales tool?")) return

    try {
      const response = await fetch(`/api/sales-tools/${toolId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete sales tool")

      fetchTools()
    } catch (error) {
      console.error("Error deleting sales tool:", error)
    }
  }

  const resetForm = () => {
    setEditingTool(null)
    setFormData({
      title: "",
      description: "",
      type: "facebookPost",
      url: "",
      filePath: "",
      fileName: "",
      fileSize: 0,
      thumbnailUrl: "",
    })
    setUploadError(null)
    setThumbnailError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = ""
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "facebookPost":
        return <Facebook className="h-4 w-4 text-blue-600" />
      case "linkedinPost":
        return <Linkedin className="h-4 w-4 text-blue-700" />
      case "instagramPost":
        return <Instagram className="h-4 w-4 text-pink-500" />
      case "twitterPost":
        return <Twitter className="h-4 w-4 text-blue-400" />
      case "emailCopy":
        return <Mail className="h-4 w-4 text-green-500" />
      case "video":
        return <Video className="h-4 w-4 text-purple-500" />
      case "pdf":
        return <FileText className="h-4 w-4 text-red-500" />
      case "ppt":
        return <FileText className="h-4 w-4 text-orange-500" />
      case "doc":
        return <FileText className="h-4 w-4 text-blue-500" />
      case "other":
      default:
        return <File className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "facebookPost":
        return "Facebook Post"
      case "linkedinPost":
        return "LinkedIn Post"
      case "instagramPost":
        return "Instagram Post"
      case "twitterPost":
        return "Twitter Post"
      case "emailCopy":
        return "Email Copy"
      case "video":
        return "Video"
      case "pdf":
        return "PDF Document"
      case "ppt":
        return "PowerPoint"
      case "doc":
        return "Document"
      case "other":
        return "Other"
      default:
        return "Unknown"
    }
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const isFileType = (type: string) => {
    return ["pdf", "ppt", "doc", "other"].includes(type)
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
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Sales Tools</h1>
              <p className="text-gray-600">Add, edit, and organize sales resources</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => router.push("/sales-tools")}>
                Back to Sales Tools
              </Button>
              <Dialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                  setIsDialogOpen(open)
                  if (!open) resetForm()
                }}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Tool
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{editingTool ? "Edit Sales Tool" : "Add Sales Tool"}</DialogTitle>
                    <DialogDescription>
                      {editingTool ? "Update the sales tool details." : "Create a new sales tool."}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Title</label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                        required
                        placeholder="Enter title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                        required
                        placeholder="Enter description"
                        rows={3}
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value as any }))}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="facebookPost">Facebook Post</option>
                        <option value="linkedinPost">LinkedIn Post</option>
                        <option value="instagramPost">Instagram Post</option>
                        <option value="twitterPost">Twitter Post</option>
                        <option value="emailCopy">Email Copy</option>
                        <option value="video">Video</option>
                        <option value="pdf">PDF Document</option>
                        <option value="ppt">PowerPoint</option>
                        <option value="doc">Document</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* URL input for all types */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        URL {isFileType(formData.type) && "(Optional if uploading a file)"}
                      </label>
                      <Input
                        type="url"
                        value={formData.url}
                        onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
                        required={!isFileType(formData.type) && !formData.filePath}
                        placeholder="https://example.com/resource"
                      />
                    </div>

                    {/* File upload for file types */}
                    {isFileType(formData.type) && (
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          File {formData.url ? "(Optional)" : ""}
                        </label>
                        <div className="space-y-2">
                          <Input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.ppt,.pptx,.doc,.docx"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="file-upload"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="w-full"
                          >
                            {isUploading ? (
                              "Uploading..."
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-2" />
                                {formData.fileName ? "Change File" : "Upload File"}
                              </>
                            )}
                          </Button>

                          {formData.fileName && (
                            <div className="text-sm bg-gray-50 p-2 rounded flex items-center">
                              <FileText className="h-4 w-4 mr-2 text-blue-500" />
                              <div className="overflow-hidden">
                                <div className="truncate">{formData.fileName}</div>
                                <div className="text-xs text-gray-500">{formatFileSize(formData.fileSize)}</div>
                              </div>
                            </div>
                          )}

                          {uploadError && <div className="text-sm text-red-500">{uploadError}</div>}
                        </div>
                      </div>
                    )}

                    {/* Thumbnail upload (optional for all types) */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Thumbnail (Optional)</label>
                      <div className="space-y-2">
                        <Input
                          ref={thumbnailInputRef}
                          type="file"
                          accept="image/jpeg,image/png"
                          onChange={handleThumbnailUpload}
                          className="hidden"
                          id="thumbnail-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => thumbnailInputRef.current?.click()}
                          disabled={isThumbnailUploading}
                          className="w-full"
                        >
                          {isThumbnailUploading ? (
                            "Uploading..."
                          ) : (
                            <>
                              <ImageIcon className="h-4 w-4 mr-2" />
                              {formData.thumbnailUrl ? "Change Thumbnail" : "Upload Thumbnail"}
                            </>
                          )}
                        </Button>

                        {formData.thumbnailUrl && (
                          <div className="text-sm bg-gray-50 p-2 rounded">
                            <img
                              src={formData.thumbnailUrl || "/placeholder.svg"}
                              alt="Thumbnail preview"
                              className="w-full h-32 object-cover rounded"
                            />
                          </div>
                        )}

                        {thumbnailError && <div className="text-sm text-red-500">{thumbnailError}</div>}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={
                        isUploading ||
                        isThumbnailUploading ||
                        (isFileType(formData.type) && !formData.url && !formData.filePath)
                      }
                    >
                      {editingTool ? "Update Tool" : "Create Tool"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Sales Tools Table */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Tools</CardTitle>
            <CardDescription>Manage all sales resources and materials</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tools.map((tool) => (
                  <TableRow key={tool._id as string}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(tool.type)}
                        <span>{getTypeLabel(tool.type)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {tool.thumbnailUrl && (
                        <div className="w-10 h-10 rounded overflow-hidden mr-2 inline-block align-middle">
                          <img
                            src={tool.thumbnailUrl || "/placeholder.svg"}
                            alt={tool.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <span className="align-middle">{tool.title}</span>
                      {(tool.url || tool.filePath) && (
                        <a
                          href={tool.filePath || tool.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center ml-2 text-blue-500 hover:text-blue-700"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{tool.description}</TableCell>
                    <TableCell>{formatDate(tool.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(tool)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(tool._id as string)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {tools.length === 0 && (
              <div className="text-center py-8 text-gray-500">No sales tools yet. Create your first sales tool!</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
