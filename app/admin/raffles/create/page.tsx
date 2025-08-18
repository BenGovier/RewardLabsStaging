"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Save, X, Upload, ImageIcon, Trash2, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"

export default function CreateRafflePage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [prizeImages, setPrizeImages] = useState<{ file: File; preview: string }[]>([])
  const [coverImage, setCoverImage] = useState<{ file: File; preview: string } | null>(null)
  const [mainImageIndex, setMainImageIndex] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const prizeFileInputRef = useRef<HTMLInputElement>(null)
  const coverFileInputRef = useRef<HTMLInputElement>(null)

  const handlePrizeImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const newFiles = Array.from(e.target.files)
    const newImages = newFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }))

    // Check if adding these would exceed 10 images
    if (prizeImages.length + newImages.length > 10) {
      setErrors({ ...errors, prizeImages: "Maximum of 10 prize images allowed" })
      return
    }

    setPrizeImages([...prizeImages, ...newImages])
    setErrors({ ...errors, prizeImages: "" })

    // Reset the input
    if (prizeFileInputRef.current) {
      prizeFileInputRef.current.value = ""
    }
  }

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]
    setCoverImage({
      file,
      preview: URL.createObjectURL(file),
    })
    setErrors({ ...errors, coverImage: "" })

    // Reset the input
    if (coverFileInputRef.current) {
      coverFileInputRef.current.value = ""
    }
  }

  const removePrizeImage = (index: number) => {
    const newImages = [...prizeImages]

    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(newImages[index].preview)

    newImages.splice(index, 1)
    setPrizeImages(newImages)

    // If we're removing the main image, reset the main image index
    if (index === mainImageIndex) {
      setMainImageIndex(0)
    } else if (index < mainImageIndex) {
      // If we're removing an image before the main image, adjust the index
      setMainImageIndex(mainImageIndex - 1)
    }
  }

  const removeCoverImage = () => {
    if (coverImage) {
      URL.revokeObjectURL(coverImage.preview)
      setCoverImage(null)
    }
  }

  const setAsMainImage = (index: number) => {
    setMainImageIndex(index)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!description.trim()) {
      newErrors.description = "Description is required"
    }

    if (!startDate) {
      newErrors.startDate = "Start date is required"
    }

    if (!endDate) {
      newErrors.endDate = "End date is required"
    }

    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      newErrors.endDate = "End date must be after start date"
    }

    if (prizeImages.length === 0) {
      newErrors.prizeImages = "At least one prize image is required"
    }

    if (!coverImage) {
      newErrors.coverImage = "Cover image is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const formData = new FormData()
      formData.append("title", title)
      formData.append("description", description)
      formData.append("startDate", startDate)
      formData.append("endDate", endDate)
      formData.append("mainImageIndex", mainImageIndex.toString())

      // Append prize images
      prizeImages.forEach((image, index) => {
        formData.append(`prizeImage${index}`, image.file)
      })

      // Append cover image
      if (coverImage) {
        formData.append("coverImage", coverImage.file)
      }

      const response = await fetch("/api/admin/raffles", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.errors?.join(", ") || "Failed to create raffle")
      }

      // Redirect to raffles list
      router.push("/admin/raffles")
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "An unknown error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Create New Raffle</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => router.push("/admin/raffles")}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Raffle
              </>
            )}
          </Button>
        </div>
      </div>

      {submitError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          <p>{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter raffle title"
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter raffle description"
                  rows={4}
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date & Time
                  </label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={errors.startDate ? "border-red-500" : ""}
                  />
                  {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    End Date & Time
                  </label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={errors.endDate ? "border-red-500" : ""}
                  />
                  {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prize Images (up to 10)</label>

                <div className="flex flex-wrap gap-4 mb-4">
                  {prizeImages.map((image, index) => (
                    <div
                      key={index}
                      className={`relative w-32 h-32 border rounded-md overflow-hidden ${
                        index === mainImageIndex ? "ring-2 ring-blue-500" : ""
                      }`}
                    >
                      <img
                        src={image.preview || "/placeholder.svg"}
                        alt={`Prize ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-opacity flex items-center justify-center opacity-0 hover:opacity-100">
                        <div className="flex space-x-2">
                          {index !== mainImageIndex && (
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-8 w-8 p-0"
                              onClick={() => setAsMainImage(index)}
                              title="Set as main image"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8 w-8 p-0"
                            onClick={() => removePrizeImage(index)}
                            title="Remove image"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {index === mainImageIndex && (
                        <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-1 rounded">Main</div>
                      )}
                    </div>
                  ))}

                  {prizeImages.length < 10 && (
                    <div
                      className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-gray-400"
                      onClick={() => prizeFileInputRef.current?.click()}
                    >
                      <Upload className="h-6 w-6 text-gray-400" />
                      <span className="mt-2 text-sm text-gray-500">Add Image</span>
                      <input
                        ref={prizeFileInputRef}
                        type="file"
                        accept="image/*,video/mp4"
                        onChange={handlePrizeImageChange}
                        className="hidden"
                        multiple
                      />
                    </div>
                  )}
                </div>

                {errors.prizeImages && <p className="mt-1 text-sm text-red-600">{errors.prizeImages}</p>}

                <p className="text-sm text-gray-500">
                  Upload up to 10 images or videos of the prize. Select one as the main image.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>

                {coverImage ? (
                  <div className="relative w-full h-48 border rounded-md overflow-hidden mb-2">
                    <img
                      src={coverImage.preview || "/placeholder.svg"}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-opacity flex items-center justify-center opacity-0 hover:opacity-100">
                      <Button size="sm" variant="destructive" onClick={removeCoverImage}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="w-full h-48 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 mb-2"
                    onClick={() => coverFileInputRef.current?.click()}
                  >
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                    <span className="mt-2 text-sm text-gray-500">Upload Cover Image</span>
                    <input
                      ref={coverFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageChange}
                      className="hidden"
                    />
                  </div>
                )}

                {errors.coverImage && <p className="mt-1 text-sm text-red-600">{errors.coverImage}</p>}

                <p className="text-sm text-gray-500">This image will be displayed as the cover image for the raffle.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => router.push("/admin/raffles")}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Raffle
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
