"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

/* ---------- ui / icons ---------- */
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ArrowLeft,
  Plus,
  Trash2,
  Upload,
  Palette,
  CheckCircle,
  AlertCircle,
  Loader2,
  Layout,
  ImageIcon,
  Settings,
  MessageSquare,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"

/* ---------- types ---------- */
type QuestionType = "text" | "email" | "phone" | "select"

interface CustomQuestion {
  id: string
  question: string
  type: QuestionType
  options?: string[]
  required: boolean
}

interface BusinessRaffle {
  _id: string
  raffleId: string
  businessCustomizations?: {
    logo?: string
    primaryColor?: string
    customQuestions?: CustomQuestion[]
    redirectUrl?: string
    template?: "classic" | "hero" | "split"
    coverPhoto?: string
    backgroundVideo?: string
    customDescription?: string
    additionalMedia?: string[]
  }
}

/* ---------- page component ---------- */
export default function CustomizeRaffle({
  params,
}: {
  params: { raffleId: string }
}) {
  /* ----- auth / routing ----- */
  const { data: session, status } = useSession()
  const router = useRouter()

  /* ----- remote data ----- */
  const [businessRaffle, setBusinessRaffle] = useState<BusinessRaffle | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  /* ----- form state ----- */
  const [logo, setLogo] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState("")
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null)
  const [coverPhotoPreview, setCoverPhotoPreview] = useState("")
  const [backgroundVideo, setBackgroundVideo] = useState<File | null>(null)
  const [backgroundVideoPreview, setBackgroundVideoPreview] = useState("")
  const [customDescription, setCustomDescription] = useState("")
  const [additionalMedia, setAdditionalMedia] = useState<File[]>([])
  const [additionalMediaPreviews, setAdditionalMediaPreviews] = useState<string[]>([])
  const [primaryColor, setPrimaryColor] = useState("#3B82F6")
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([])
  const [redirectUrl, setRedirectUrl] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<"classic" | "hero" | "split">("classic")

  /* ---------- helpers ---------- */
  const handleFile =
    (
      setter: React.Dispatch<React.SetStateAction<File | null>>,
      previewSetter: React.Dispatch<React.SetStateAction<string>>,
      accept: "image" | "video",
      maxSizeMb: number,
    ) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      if (!file.type.startsWith(accept)) {
        setError(`Please select a ${accept} file`)
        return
      }
      if (file.size > maxSizeMb * 1024 * 1024) {
        setError(`File is too large. Max ${maxSizeMb} MB for ${accept} uploads.`)
        return
      }

      setter(file)
      const reader = new FileReader()
      reader.onload = (evt) => previewSetter(evt.target?.result as string)
      reader.readAsDataURL(file)
      setError("")
    }

  const handleAdditionalMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (additionalMedia.length + files.length > 10) {
      setError("Maximum 10 additional media files allowed")
      return
    }

    for (const file of files) {
      if (file.size > 25 * 1024 * 1024) {
        setError(`File ${file.name} is too large. Maximum 25MB per file.`)
        return
      }
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        setError(`File ${file.name} must be an image or video`)
        return
      }
    }

    setAdditionalMedia((prev) => [...prev, ...files])
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (evt) => setAdditionalMediaPreviews((prev) => [...prev, evt.target?.result as string])
      reader.readAsDataURL(file)
    })
    setError("")
  }

  const removeAdditionalMedia = (index: number) => {
    setAdditionalMedia((prev) => prev.filter((_, i) => i !== index))
    setAdditionalMediaPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const addCustomQuestion = () => {
    if (customQuestions.length >= 5) {
      setError("Maximum of 5 custom questions allowed")
      return
    }
    setCustomQuestions((prev) => [...prev, { id: `q_${Date.now()}`, question: "", type: "text", required: false }])
  }

  const updateQuestion = (idx: number, field: keyof CustomQuestion, value: any) => {
    setCustomQuestions((prev) => {
      const clone = [...prev]
      const q = { ...clone[idx], [field]: value }
      if (field === "type" && value !== "select") q.options = undefined
      clone[idx] = q
      return clone
    })
  }

  const removeQuestion = (idx: number) => setCustomQuestions((prev) => prev.filter((_, i) => i !== idx))

  /* ---------- remote fetch ---------- */
  useEffect(() => {
    if (status !== "authenticated") return
    ;(async () => {
      try {
        const res = await fetch(`/api/business/raffles/${params.raffleId}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Fetch failed")
        setBusinessRaffle(data.businessRaffle)

        const c = data.businessRaffle.businessCustomizations ?? {}
        if (c.logo) setLogoPreview(c.logo)
        if (c.coverPhoto) setCoverPhotoPreview(c.coverPhoto)
        if (c.backgroundVideo) setBackgroundVideoPreview(c.backgroundVideo)
        if (c.customDescription) setCustomDescription(c.customDescription)
        if (c.additionalMedia) setAdditionalMediaPreviews(c.additionalMedia)
        if (c.primaryColor) setPrimaryColor(c.primaryColor)
        if (c.redirectUrl) setRedirectUrl(c.redirectUrl)
        if (c.customQuestions) setCustomQuestions(c.customQuestions)
        if (c.template) setSelectedTemplate(c.template)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    })()
  }, [status, params.raffleId])

  /* ---------- validation ---------- */
  const validate = (): string | null => {
    if (primaryColor && !/^#[0-9A-F]{6}$/i.test(primaryColor)) return "Primary color must be a 6-digit hex"
    if (redirectUrl)
      try {
        // eslint-disable-next-line no-new
        new URL(redirectUrl)
      } catch {
        return "Redirect URL is invalid"
      }
    for (const [i, q] of customQuestions.entries()) {
      if (!q.question.trim()) return `Question ${i + 1} is empty`
      if (q.type === "select" && (!q.options || q.options.length === 0)) return `Question ${i + 1} needs options`
    }
    return null
  }

  /* ---------- submit ---------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const vErr = validate()
    if (vErr) {
      setError(vErr)
      return
    }

    try {
      setSaving(true)
      const fd = new FormData()
      if (logo) fd.append("logo", logo)
      if (coverPhoto) fd.append("coverPhoto", coverPhoto)
      if (backgroundVideo) fd.append("backgroundVideo", backgroundVideo)
      additionalMedia.forEach((file, index) => {
        fd.append(`additionalMedia_${index}`, file)
      })
      fd.append("primaryColor", primaryColor)
      fd.append("redirectUrl", redirectUrl)
      fd.append("customDescription", customDescription)
      fd.append("customQuestions", JSON.stringify(customQuestions))
      fd.append("template", selectedTemplate)

      const res = await fetch(`/api/business/raffles/${params.raffleId}/customize`, { method: "PUT", body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Save failed")

      setSuccessMessage("Raffle customizations saved!")
      setTimeout(() => router.push("/business/raffles"), 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  /* ---------- render ---------- */
  if (status === "loading" || loading)
    return (
      <div className="flex h-80 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )

  if (error && !businessRaffle)
    return (
      <div className="py-12 text-center">
        <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-500" />
        <p className="mb-6 text-red-600">{error}</p>
        <Button onClick={() => router.refresh()} variant="outline">
          Retry
        </Button>
      </div>
    )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ----- header ----- */}
      <div className="border-b bg-white px-6 py-8">
        <Link
          href="/business/raffles"
          className="mb-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to My Raffles
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customize Your Raffle</h1>
            <p className="text-gray-600">Personalize the page with your branding</p>
          </div>
          <div className="hidden items-center gap-1 text-sm text-gray-500 md:flex">
            <Settings className="h-4 w-4" />
            Customization Settings
          </div>
        </div>
      </div>

      {/* ----- alert banners ----- */}
      {successMessage && (
        <div className="mx-auto mt-6 max-w-4xl rounded-lg border border-green-200 bg-green-50 p-4 text-center text-green-700">
          <CheckCircle className="mx-auto mb-2 h-5 w-5" />
          {successMessage}
        </div>
      )}
      {error && (
        <div className="mx-auto mt-6 max-w-4xl rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-700">
          <AlertCircle className="mx-auto mb-2 h-5 w-5" />
          {error}
        </div>
      )}

      {/* ----- form ----- */}
      <form onSubmit={handleSubmit} className="mx-auto grid max-w-5xl gap-8 px-6 py-10 lg:grid-cols-3">
        {/* ----- left column ----- */}
        <div className="lg:col-span-2 space-y-8">
          {/* visual branding card */}
          <section className="rounded-lg border bg-white shadow-sm">
            <header className="flex items-center gap-3 border-b px-6 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">1</div>
              <h2 className="text-lg font-semibold text-gray-900">Visual Branding</h2>
            </header>

            <div className="space-y-8 p-6">
              {/* logo upload */}
              <div>
                <Label className="mb-1 flex items-center gap-2">
                  <Upload className="h-5 w-5 text-gray-400" />
                  Business Logo
                </Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFile(setLogo, setLogoPreview, "image", 5 /* MB */)}
                />
                {logoPreview && (
                  <div className="mt-4 rounded-lg border-2 border-dashed p-4 text-center">
                    <img
                      src={logoPreview || "/placeholder.svg"}
                      alt="Logo preview"
                      className="mx-auto h-16 object-contain"
                    />
                    <p className="mt-2 text-xs text-gray-500">Logo Preview</p>
                  </div>
                )}
              </div>

              {/* cover photo upload */}
              <div>
                <Label className="mb-1 flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-gray-400" />
                  Cover Photo
                </Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFile(setCoverPhoto, setCoverPhotoPreview, "image", 5)}
                />
                {coverPhotoPreview && (
                  <div className="mt-4 overflow-hidden rounded-lg border-2 border-dashed">
                    <img
                      src={coverPhotoPreview || "/placeholder.svg"}
                      alt="Cover preview"
                      className="h-40 w-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* background video upload */}
              <div>
                <Label className="mb-1 flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-gray-400" />
                  Background Video
                </Label>
                <Input
                  type="file"
                  accept="video/*"
                  onChange={handleFile(setBackgroundVideo, setBackgroundVideoPreview, "video", 50)}
                />
                {backgroundVideoPreview && (
                  <div className="mt-4 overflow-hidden rounded-lg border-2 border-dashed">
                    <video src={backgroundVideoPreview} className="h-40 w-full object-cover" autoPlay muted loop />
                  </div>
                )}
              </div>

              {/* custom description */}
              <div>
                <Label className="mb-1 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-gray-400" />
                  Custom Description
                </Label>
                <Textarea
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Enter a custom description for this raffle..."
                  rows={4}
                  className="mt-1"
                />
                <p className="mt-1 text-xs text-gray-500">
                  This will replace the default raffle description on the public page
                </p>
              </div>
            </div>
          </section>

          {/* design & layout */}
          <section className="rounded-lg border bg-white shadow-sm">
            <header className="flex items-center gap-3 border-b px-6 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">2</div>
              <h2 className="text-lg font-semibold text-gray-900">Design &amp; Layout</h2>
            </header>

            <div className="space-y-6 p-6">
              {/* brand color */}
              <div>
                <Label className="mb-1 flex items-center gap-2">
                  <Palette className="h-5 w-5 text-gray-400" />
                  Primary Brand Color
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-12 w-16 cursor-pointer p-0"
                  />
                  <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="font-mono" />
                </div>
              </div>

              {/* template selection */}
              <div>
                <Label className="mb-1 flex items-center gap-2">
                  <Layout className="h-5 w-5 text-gray-400" />
                  Page Template
                </Label>
                <div className="grid gap-4 md:grid-cols-3">
                  {(["classic", "hero", "split"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedTemplate(t)}
                      className={`rounded-lg border-2 p-4 text-left transition hover:border-gray-400 ${
                        selectedTemplate === t ? "border-blue-500 bg-blue-50" : "border-gray-200"
                      }`}
                    >
                      <div className="mb-2 h-24 rounded bg-gray-100" />
                      <h3 className="font-medium capitalize">{t}</h3>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* additional media */}
          <section className="rounded-lg border bg-white shadow-sm">
            <header className="flex items-center gap-3 border-b px-6 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">3</div>
              <h2 className="text-lg font-semibold text-gray-900">Additional Media Gallery</h2>
            </header>

            <div className="space-y-6 p-6">
              <div>
                <Label className="mb-1 flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-gray-400" />
                  Additional Images/Videos ({additionalMedia.length}/10)
                </Label>
                <Input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleAdditionalMediaUpload}
                  disabled={additionalMedia.length >= 10}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Upload up to 10 images or videos (25MB max each). These will display as a gallery on the public page.
                </p>
                {additionalMediaPreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    {additionalMediaPreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        {preview.startsWith("data:video") ? (
                          <video src={preview} className="h-24 w-full rounded object-cover" />
                        ) : (
                          <img
                            src={preview || "/placeholder.svg"}
                            alt={`Preview ${index + 1}`}
                            className="h-24 w-full rounded object-cover"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => removeAdditionalMedia(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* custom questions */}
          <section className="rounded-lg border bg-white shadow-sm">
            <header className="flex items-center justify-between gap-3 border-b px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">4</div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Custom Questions</h2>
                  <p className="text-sm text-gray-600">{customQuestions.length}/5 added</p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCustomQuestion}
                disabled={customQuestions.length >= 5}
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Question
              </Button>
            </header>

            <div className="space-y-6 p-6">
              {customQuestions.length === 0 && (
                <div className="rounded-lg border-2 border-dashed py-12 text-center">
                  <MessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <p className="text-gray-600">Click &quot;Add Question&quot; to start collecting extra data.</p>
                </div>
              )}

              {customQuestions.map((q, i) => (
                <div key={q.id} className="rounded-lg border bg-gray-50 p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Question {i + 1}</h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(i)}
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <Label>Question Text</Label>
                      <Textarea
                        value={q.question}
                        onChange={(e) => updateQuestion(i, "question", e.target.value)}
                        rows={2}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Question Type</Label>
                      <Select value={q.type} onValueChange={(val) => updateQuestion(i, "type", val)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text Input</SelectItem>
                          <SelectItem value="email">Email Address</SelectItem>
                          <SelectItem value="phone">Phone Number</SelectItem>
                          <SelectItem value="select">Multiple Choice</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-2 pt-6">
                      <Checkbox
                        checked={q.required}
                        id={`${q.id}-required`}
                        onCheckedChange={(v) => updateQuestion(i, "required", v)}
                      />
                      <Label htmlFor={`${q.id}-required`}>Required</Label>
                    </div>

                    {q.type === "select" && (
                      <div className="md:col-span-2">
                        <Label>Answer Options (one per line)</Label>
                        <Textarea
                          value={q.options?.join("\n") || ""}
                          onChange={(e) =>
                            updateQuestion(
                              i,
                              "options",
                              e.target.value
                                .split("\n")
                                .map((t) => t.trim())
                                .filter(Boolean),
                            )
                          }
                          rows={4}
                          className="mt-1"
                          placeholder="Option 1&#10;Option 2&#10;Option 3"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ----- right column ----- */}
        <aside className="space-y-6">
          {/* redirect card */}
          <section className="rounded-lg border bg-white shadow-sm">
            <header className="flex items-center gap-3 border-b px-6 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">5</div>
              <h2 className="text-lg font-semibold text-gray-900">After Entry</h2>
            </header>
            <div className="space-y-4 p-6">
              <Label className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-gray-400" />
                Redirect URL
              </Label>
              <Input
                type="url"
                placeholder="https://your-site.com/thank-you"
                value={redirectUrl}
                onChange={(e) => setRedirectUrl(e.target.value)}
              />
              {redirectUrl && (
                <p className="break-all rounded bg-blue-50 p-3 text-xs text-blue-800">
                  Users will be redirected to: <span className="font-mono">{redirectUrl}</span>
                </p>
              )}
            </div>
          </section>

          {/* save / cancel */}
          <section className="rounded-lg border bg-white p-6 shadow-sm">
            <Button type="submit" disabled={saving} className="w-full gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              {saving ? "Saving…" : "Save Customizations"}
            </Button>
            <Button asChild variant="outline" className="mt-3 w-full bg-transparent" type="button">
              <Link href="/business/raffles">Cancel</Link>
            </Button>
          </section>

          {/* help tips */}
          <section className="rounded-lg border border-blue-200 bg-blue-50 p-6">
            <h3 className="mb-2 font-medium text-blue-900">💡 Tips</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-blue-800">
              <li>Use high-quality images or video for better engagement.</li>
              <li>Keep custom questions concise and relevant.</li>
              <li>Preview on mobile to ensure responsiveness.</li>
            </ul>
          </section>
        </aside>
      </form>
    </div>
  )
}
