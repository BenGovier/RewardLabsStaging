"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, ExternalLink, Play, Search, File } from "lucide-react"
import type { TrainingMaterial } from "@/models/trainingMaterial"

interface TrainingResponse {
  materials: TrainingMaterial[]
}

export default function TrainingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [materials, setMaterials] = useState<TrainingMaterial[]>([])
  const [filteredMaterials, setFilteredMaterials] = useState<TrainingMaterial[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return

    if (!session?.user) {
      router.push("/auth/signin")
      return
    }

    fetchMaterials()
  }, [session, status, router])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredMaterials(materials)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = materials.filter(
      (material) => material.title.toLowerCase().includes(query) || material.description.toLowerCase().includes(query),
    )
    setFilteredMaterials(filtered)
  }, [searchQuery, materials])

  const fetchMaterials = async () => {
    try {
      const response = await fetch("/api/training")
      if (!response.ok) throw new Error("Failed to fetch training materials")

      const data: TrainingResponse = await response.json()
      setMaterials(data.materials)
      setFilteredMaterials(data.materials)
    } catch (error) {
      console.error("Error fetching training materials:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTypeIcon = (type: string, className = "h-5 w-5") => {
    switch (type) {
      case "video":
        return <Play className={`${className} text-blue-500`} />
      case "pdf":
        return <FileText className={`${className} text-red-500`} />
      case "ppt":
        return <FileText className={`${className} text-orange-500`} />
      case "link":
        return <ExternalLink className={`${className} text-green-500`} />
      case "file":
        return <File className={`${className} text-gray-500`} />
      default:
        return <FileText className={`${className} text-gray-500`} />
    }
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
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
              <h1 className="text-3xl font-bold text-gray-900">Training Materials</h1>
              <p className="text-gray-600">Access training resources and educational content</p>
            </div>
            <div className="flex space-x-2">
              {session.user.role === "admin" && (
                <Button onClick={() => router.push("/training/manage")}>Manage Training</Button>
              )}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search training materials..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Training Materials Grid */}
        {filteredMaterials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((material) => (
              <Card key={material._id as string} className="overflow-hidden">
                <CardHeader className="bg-gray-50 border-b">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(material.type)}
                    <CardTitle className="text-lg">{material.title}</CardTitle>
                  </div>
                  <CardDescription className="text-xs">Added on {formatDate(material.createdAt)}</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-gray-600">{material.description}</p>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t flex justify-between">
                  <div className="text-xs text-gray-500 capitalize flex items-center">
                    {material.type}
                    {material.fileName && <span className="ml-1">• {material.fileName}</span>}
                  </div>
                  {(material.url || material.filePath) && (
                    <Button size="sm" variant="outline" asChild>
                      <a
                        href={material.url || material.filePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center"
                      >
                        {material.type === "video" ? "Watch" : "View"}
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-2">No training materials found</div>
            {searchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
