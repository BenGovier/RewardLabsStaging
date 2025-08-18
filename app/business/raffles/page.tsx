"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, ExternalLink, Calendar, Gift, Copy, Share2 } from "lucide-react"
import Link from "next/link"

interface BusinessRaffle {
  _id: string
  raffleId: string
  businessCustomizations?: {
    logo?: string
    primaryColor?: string
    customQuestions?: Array<{
      id: string
      question: string
      type: string
      required: boolean
    }>
  }
  raffle: {
    _id: string
    title: string
    description: string
    startDate: string
    endDate: string
    coverImage: string
    prizeImages: string[]
  }
}

export default function BusinessRaffles() {
  const { data: session } = useSession()
  const [raffles, setRaffles] = useState<BusinessRaffle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  useEffect(() => {
    fetchRaffles()
  }, [])

  const fetchRaffles = async () => {
    try {
      const response = await fetch("/api/business/raffles")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch raffles")
      }

      setRaffles(data.raffles || [])
    } catch (error) {
      console.error("Error fetching raffles:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch raffles")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const isCustomized = (raffle: BusinessRaffle) => {
    const customizations = raffle.businessCustomizations
    return !!(customizations?.logo || customizations?.primaryColor || customizations?.customQuestions?.length)
  }

  const generatePublicUrl = (raffle: BusinessRaffle) => {
    return `${window.location.origin}/r/${session?.user?.id}/${raffle.raffleId}`
  }

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedUrl(url)
      setTimeout(() => setCopiedUrl(null), 2000)
    } catch (err) {
      console.error("Failed to copy URL:", err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchRaffles}>Try Again</Button>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Raffles</h1>
        <p className="mt-2 text-gray-600">
          Customize your assigned raffles with your branding and collect customer data.
        </p>
      </div>

      {/* Raffles Grid */}
      {raffles.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Raffles Assigned</h3>
            <p className="text-gray-600">
              You don't have any raffles assigned yet. Contact your administrator to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {raffles.map((businessRaffle) => {
            const publicUrl = generatePublicUrl(businessRaffle)
            return (
              <Card key={businessRaffle._id} className="overflow-hidden">
                {/* Cover Image */}
                {businessRaffle.raffle.coverImage && (
                  <div className="h-48 bg-gray-200 overflow-hidden">
                    <img
                      src={businessRaffle.raffle.coverImage || "/placeholder.svg"}
                      alt={businessRaffle.raffle.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{businessRaffle.raffle.title}</CardTitle>
                      <CardDescription className="mt-2 line-clamp-2">
                        {businessRaffle.raffle.description}
                      </CardDescription>
                    </div>
                    <div className="ml-4">
                      {isCustomized(businessRaffle) ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Customized
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Not Customized</Badge>
                      )}
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="flex items-center text-sm text-gray-600 mt-4">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      {formatDate(businessRaffle.raffle.startDate)} - {formatDate(businessRaffle.raffle.endDate)}
                    </span>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Customization Status */}
                  {isCustomized(businessRaffle) && (
                    <div className="mb-4 p-3 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">Current Customizations:</h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        {businessRaffle.businessCustomizations?.logo && <li>• Custom logo uploaded</li>}
                        {businessRaffle.businessCustomizations?.primaryColor && <li>• Brand color set</li>}
                        {businessRaffle.businessCustomizations?.customQuestions?.length && (
                          <li>• {businessRaffle.businessCustomizations.customQuestions.length} custom questions</li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Public URL Display */}
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-blue-800 flex items-center">
                        <Share2 className="h-4 w-4 mr-2" />
                        Public Entry URL
                      </h4>
                    </div>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 text-xs text-blue-700 bg-blue-100 p-2 rounded break-all">
                        {publicUrl}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(publicUrl)}
                        className={
                          copiedUrl === publicUrl
                            ? "bg-green-100 text-green-700 border-green-300"
                            : "bg-blue-100 text-blue-700 border-blue-300"
                        }
                      >
                        {copiedUrl === publicUrl ? "Copied!" : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button asChild className="flex-1">
                      <Link href={`/business/raffles/${businessRaffle.raffleId}/customize`}>
                        <Settings className="h-4 w-4 mr-2" />
                        Customize
                      </Link>
                    </Button>

                    <Button variant="outline" asChild className="flex-1">
                      <Link href={publicUrl} target="_blank">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Preview Entry Page
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
