"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Facebook, Linkedin, Settings, FileIcon as FilePresentation } from "lucide-react"
import type { SalesTool } from "@/models/salesTool"

interface SalesToolsResponse {
  tools: SalesTool[]
}

export default function SalesToolsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tools, setTools] = useState<SalesTool[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return

    if (!session?.user) {
      router.push("/auth/signin")
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "facebookPost":
        return <Facebook className="h-6 w-6 text-blue-600" />
      case "linkedinPost":
        return <Linkedin className="h-6 w-6 text-blue-700" />
      case "pdf":
        return <FileText className="h-6 w-6 text-red-500" />
      case "ppt":
        return <FilePresentation className="h-6 w-6 text-orange-500" />
      default:
        return <FileText className="h-6 w-6 text-gray-500" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "facebookPost":
        return "Facebook Post"
      case "linkedinPost":
        return "LinkedIn Post"
      case "pdf":
        return "PDF Document"
      case "ppt":
        return "PowerPoint Presentation"
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

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  const isAdmin = session?.user?.role === "admin"

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sales Tools</h1>
              <p className="text-gray-600">Access sales resources and marketing materials</p>
            </div>
            {isAdmin && (
              <Button onClick={() => router.push("/sales-tools/manage")}>
                <Settings className="h-4 w-4 mr-2" />
                Manage Sales Tools
              </Button>
            )}
          </div>
        </div>

        {/* Sales Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Card key={tool._id as string} className="h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(tool.type)}
                    <div>
                      <CardTitle className="text-lg">{tool.title}</CardTitle>
                      <CardDescription className="text-sm text-gray-500">
                        {getTypeLabel(tool.type)} • {formatDate(tool.createdAt)}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{tool.description}</p>
                <Button asChild variant="outline" className="w-full">
                  <a href={tool.url} target="_blank" rel="noopener noreferrer">
                    {tool.type === "facebookPost" && <Facebook className="h-4 w-4 mr-2" />}
                    {tool.type === "linkedinPost" && <Linkedin className="h-4 w-4 mr-2" />}
                    {tool.type === "pdf" && <FileText className="h-4 w-4 mr-2" />}
                    {tool.type === "ppt" && <FilePresentation className="h-4 w-4 mr-2" />}
                    Open {getTypeLabel(tool.type)}
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {tools.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Sales Tools</h3>
              <p className="text-gray-500">
                {isAdmin
                  ? "Get started by adding your first sales tool."
                  : "Sales tools will appear here when they become available."}
              </p>
              {isAdmin && (
                <Button className="mt-4" onClick={() => router.push("/sales-tools/manage")}>
                  Add Sales Tool
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
