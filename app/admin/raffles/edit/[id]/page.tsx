"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Raffle {
  _id: string
  title: string
  description: string
  startDate: string
  endDate: string
  prizeImages: string[]
  mainImageIndex: number
  coverImage: string
  createdAt: string
  updatedAt: string
}

export default function EditRafflePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { id } = params

  const [raffle, setRaffle] = useState<Raffle | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [prizeImages, setPrizeImages] = useState<string[]>([])
  const [newPrizeImages, setNewPrizeImages] = useState<{ file: File; preview: string }[]>([])
  const [coverImage, setCoverImage] = useState<string>("")
  const [newCoverImage, setNewCoverImage] = useState<{ file: File; preview: string } | null>(null)
  const [mainImageIndex, setMainImageIndex] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [deleteImageIndexes, setDeleteImageIndexes] = useState<number[]>([])

  const prizeFileInputRef = useRef<HTMLInputElement>(null)
  const coverFileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchRaffle()
  }, [id])

  const fetchRaffle = async () => {
    try {
      setIsLoading(true)
      setLoadError(null)

      console.log("Fetching raffle with ID:", id)
      const response = await fetch(`/api/admin/raffles/${id}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `Error: ${response.status} ${response.statusText}`
        console.error("API error:", errorMessage, errorData)
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log("Raffle data received:", data)

      const raffleData = data.raffle
      setRaffle(raffleData)

      // Set form values
      setTitle(raffleData.title)
      setDescription(raffleData.description)
      setStartDate(formatDateForInput(new Date(raffleData.startDate)))
      setEndDate(formatDateForInput(new Date(raffleData.endDate)))
      setPrizeImages(raffleData.prizeImages)
      setCoverImage(raffleData.coverImage)
      setMainImageIndex(raffleData.mainImageIndex)
    } catch (err) {
      console.error("Error fetching raffle:", err)
      setLoadError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const formatDateForInput = (date: Date) => {
    return date.toISOString().slice(0, 16)
  }

  const handlePrizeImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const newFiles = Array.from(e.target.files)
    const newImages = newFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }))

    // Check if adding these would exceed 10 images
    if (prizeImages.length - deleteImageIndexes.length + newPrizeImages.length + newImages.length > 10) {
      setErrors({ ...errors, prizeImages: "Maximum of 10 prize images allowed" })
      return
    }

    setNewPrizeImages([...newPrizeImages, ...newImages])
    setErrors({ ...errors, prizeImages: "" })

    // Reset the input
    if (prizeFileInputRef.current) {
      prizeFileInputRef.current.value = ""
    }
  }

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]
    setNewCoverImage({
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
    setDeleteImageIndexes([...deleteImageIndexes, index])

    // If we're removing the main image, reset the main image index
    if (index === mainImageIndex) {
      setMainImageIndex(0)
    } else if (index < mainImageIndex) {
      // If we're removing an image before the main image, adjust the index
      setMainImageIndex(mainImageIndex - 1)
    }
  }

  const removeNewPrizeImage = (index: number) => {
    const newImages = [...newPrizeImages]

    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(newImages[index].preview)

    newImages.splice(index, 1)
    setNewPrizeImages(newImages)
  }

  const removeCoverImage = () => {
    if (newCoverImage) {
      URL.revokeObjectURL(newCoverImage.preview)
      setNewCoverImage(null)
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

    const remainingPrizeImages = prizeImages.length - deleteImageIndexes.length
    if (remainingPrizeImages === 0 && newPrizeImages.length === 0) {
      newErrors.prizeImages = "At least one prize image is required"
    }

    if (!coverImage && !newCoverImage) {
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
      formData.append("deleteImageIndexes", deleteImageIndexes.join(","))

      // Append new prize images
      newPrizeImages.forEach((image) => {
        formData.append("newPrizeImages", image.file)
      })

      // Append cover image
      if (newCoverImage) {
        formData.append("coverImage", newCoverImage.file)
      }

      console.log("Submitting form data:", {
        title,
        description,
        startDate,
        endDate,
        mainImageIndex,
        deleteImageIndexes,
        newPrizeImagesCount: newPrizeImages.length,
        hasCoverImage: !!newCoverImage,
      })

      const response = await fetch(`/api/admin/raffles/${id}`, {
        method: "PUT",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("API error response:", data)
        throw new Error(data.error || data.errors?.join(", ") || "Failed to update raffle")
      }

      console.log("Update successful:", data)
      // Redirect to raffles list
      router.push("/admin/raffles")
    } catch (err) {
      console.error("Error submitting form:", err)
      setSubmitError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Raffle</h2>
              <p className="text-gray-600 mb-4">{loadError}</p>
              <Button onClick={() => router.push("/admin/raffles")}>Back to Raffles</Button>
              <Button onClick={() => fetchRaffle()} className="ml-2">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Raffle</h1>
        <p className="text-gray-600">Update raffle details and settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Raffle Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{submitError}</div>
            )}

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={errors.title ? "border-red-500" : ""}
                placeholder="Enter raffle title"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
                rows={4}
                placeholder="Enter raffle description"
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date & Time *
                </label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={errors.startDate ? "border-red-500" : ""}
                />
                {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date & Time *
                </label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={errors.endDate ? "border-red-500" : ""}
                />
                {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
              </div>
            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image *</label>

              {(coverImage || newCoverImage) && (
                <div className="mb-4">
                  <div className="relative inline-block">
                    <img
                      src={newCoverImage ? newCoverImage.preview : coverImage}
                      alt="Cover"
                      className="w-48 h-32 object-cover rounded-lg border"
                    />
                    {newCoverImage && (
                      <button
                        type="button"
                        onClick={removeCoverImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              )}

              <input
                ref={coverFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {errors.coverImage && <p className="text-red-500 text-sm mt-1">{errors.coverImage}</p>}
            </div>

            {/* Prize Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prize Images * (Max 10)</label>

              {/* Existing Images */}
              {prizeImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {prizeImages.map((imageUrl, index) => {
                    // Skip deleted images
                    if (deleteImageIndexes.includes(index)) return null

                    return (
                      <div key={index} className="relative">
                        <img
                          src={imageUrl || "/placeholder.svg"}
                          alt={`Prize ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removePrizeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                        >
                          ×
                        </button>
                        <button
                          type="button"
                          onClick={() => setAsMainImage(index)}
                          className={`absolute bottom-2 left-2 px-2 py-1 text-xs rounded ${
                            mainImageIndex === index
                              ? "bg-blue-500 text-white"
                              : "bg-white text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {mainImageIndex === index ? "Main" : "Set Main"}
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* New Images */}
              {newPrizeImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {newPrizeImages.map((image, index) => (
                    <div key={`new-${index}`} className="relative">
                      <img
                        src={image.preview || "/placeholder.svg"}
                        alt={`New Prize ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewPrizeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        ×
                      </button>
                      <div className="absolute bottom-2 left-2 px-2 py-1 text-xs rounded bg-green-500 text-white">
                        New
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <input
                ref={prizeFileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handlePrizeImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-sm text-gray-500 mt-1">
                Current: {prizeImages.length - deleteImageIndexes.length + newPrizeImages.length}/10 images
              </p>
              {errors.prizeImages && <p className="text-red-500 text-sm mt-1">{errors.prizeImages}</p>}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                {isSubmitting ? "Updating..." : "Update Raffle"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/raffles")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
