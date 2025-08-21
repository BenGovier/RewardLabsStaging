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
import { Plus, Edit, Trash2, FileText, ExternalLink, Play, Upload, File } from "lucide-react"
import type { TrainingMaterial } from "@/models/trainingMaterial"

interface TrainingResponse {
  materials: TrainingMaterial[]
}

export default function ManageTrainingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [materials, setMaterials] = useState<TrainingMaterial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<TrainingMaterial | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "video" as "video" | "pdf" | "ppt" | "link" | "file",
    url: "",
    filePath: "",
    fileName: "",
    fileSize: 0,
  })

  useEffect(() => {
    if (status === "loading") return

    if (!session?.user) {
      router.push("/auth/signin")
      return
    }

    if (session.user.role !== "admin") {
      router.push("/training")
      return
    }

    fetchMaterials()
  }, [session, status, router])

  const fetchMaterials = async () => {
    try {
      const response = await fetch("/api/training")
      if (!response.ok) throw new Error("Failed to fetch training materials")

      const data: TrainingResponse = await response.json()
      setMaterials(data.materials)
    } catch (error) {
      console.error("Error fetching training materials:", error)
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

      const response = await fetch("/api/training/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to upload file")
      }

      const data = await response.json()

      // Determine file type based on MIME type
      let fileType = "file"
      if (file.type.includes("pdf")) {
        fileType = "pdf"
      } else if (file.type.includes("powerpoint") || file.type.includes("presentation")) {
        fileType = "ppt"
      }

      setFormData((prev) => ({
        ...prev,
        type: fileType as any,
        filePath: data.filePath,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingMaterial ? `/api/training/${editingMaterial._id}` : "/api/training"
      const method = editingMaterial ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error(`Failed to ${editingMaterial ? "update" : "create"} training material`)

      setIsDialogOpen(false)
      setEditingMaterial(null)
      resetForm()
      fetchMaterials()
    } catch (error) {
      console.error("Error saving training material:", error)
    }
  }

  const handleEdit = (material: TrainingMaterial) => {
    setEditingMaterial(material)
    setFormData({
      title: material.title,
      description: material.description,
      type: material.type,
      url: material.url || "",
      filePath: material.filePath || "",
      fileName: material.fileName || "",
      fileSize: material.fileSize || 0,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (materialId: string) => {
    if (!confirm("Are you sure you want to delete this training material?")) return

    try {
      const response = await fetch(`/api/training/${materialId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete training material")

      fetchMaterials()
    } catch (error) {
      console.error("Error deleting training material:", error)
    }
  }

  const resetForm = () => {
    setEditingMaterial(null)
    setFormData({
      title: "",
      description: "",
      type: "video",
      url: "",
      filePath: "",
      fileName: "",
      fileSize: 0,
    })
    setUploadError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Play className="h-4 w-4 text-blue-500" />
      case "pdf":
        return <FileText className="h-4 w-4 text-red-500" />
      case "ppt":
        return <FileText className="h-4 w-4 text-orange-500" />
      case "link":
        return <ExternalLink className="h-4 w-4 text-green-500" />
      case "file":
        return <File className="h-4 w-4 text-gray-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
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
              <h1 className="text-3xl font-bold text-gray-900">Manage Training Materials</h1>
              <p className="text-gray-600">Add, edit, and organize training content</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => router.push("/training")}>
                Back to Training
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
                    Add Material
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{editingMaterial ? "Edit Training Material" : "Add Training Material"}</DialogTitle>
                    <DialogDescription>
                      {editingMaterial ? "Update the training material details." : "Create a new training material."}
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
                        onChange={(e) => {
                          const newType = e.target.value as any
                          setFormData((prev) => ({
                            ...prev,
                            type: newType,
                            // Reset the other field when switching types
                            url: newType === "video" || newType === "link" ? prev.url : "",
                            filePath: newType === "pdf" || newType === "ppt" || newType === "file" ? prev.filePath : "",
                            fileName: newType === "pdf" || newType === "ppt" || newType === "file" ? prev.fileName : "",
                            fileSize: newType === "pdf" || newType === "ppt" || newType === "file" ? prev.fileSize : 0,
                          }))
                        }}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="video">Video</option>
                        <option value="pdf">PDF Document</option>
                        <option value="ppt">PowerPoint</option>
                        <option value="link">External Link</option>
                        <option value="file">Other File</option>
                      </select>
                    </div>

                    {/* Show URL input for video and link types */}
                    {(formData.type === "video" || formData.type === "link") && (
                      <div>
                        <label className="block text-sm font-medium mb-1">URL</label>
                        <Input
                          type="url"
                          value={formData.url}
                          onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
                          required
                          placeholder="https://example.com/resource"
                        />
                      </div>
                    )}

                    {/* Show file upload for PDF, PPT, and file types */}
                    {(formData.type === "pdf" || formData.type === "ppt" || formData.type === "file") && (
                      <div>
                        <label className="block text-sm font-medium mb-1">File</label>
                        <div className="space-y-2">
                          <Input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.ppt,.pptx"
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

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={
                        isUploading ||
                        ((formData.type === "pdf" || formData.type === "ppt" || formData.type === "file") &&
                          !formData.filePath)
                      }
                    >
                      {editingMaterial ? "Update Material" : "Create Material"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Training Materials Table */}
        <Card>
          <CardHeader>
            <CardTitle>Training Materials</CardTitle>
            <CardDescription>Manage all training content and resources</CardDescription>
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
                {materials.map((material) => (
                  <TableRow key={material._id as string}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(material.type)}
                        <span className="capitalize">{material.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {material.type === "link" || material.type === "video" ? (
                        <a
                          href={material.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline flex items-center"
                        >
                          {material.title}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      ) : material.filePath ? (
                        <a
                          href={material.filePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline flex items-center"
                        >
                          {material.title}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      ) : (
                        material.title
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{material.description}</TableCell>
                    <TableCell>{formatDate(material.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(material)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(material._id as string)}
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
            {materials.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No training materials yet. Create your first training material!
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
