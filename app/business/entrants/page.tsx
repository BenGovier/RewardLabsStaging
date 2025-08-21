"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Users, Search, ChevronLeft, ChevronRight, Filter, AlertCircle } from "lucide-react"
import { useSession } from "next-auth/react"

interface Entry {
  _id: string
  firstName: string
  lastName: string
  email: string
  answers: Record<string, any>
  createdAt: string
  agreedToTerms: boolean
  agreedToMarketing: boolean
}

interface BusinessRaffle {
  _id: string
  raffleId: string
  raffle?: {
    _id: string
    title: string
  }
  businessCustomizations?: {
    customQuestions?: Array<{
      id: string
      question: string
      type: string
      required: boolean
    }>
  }
}

interface Raffle {
  _id: string
  title: string
}

interface Stats {
  totalEntries: number
  uniqueEmailCount: number
  entriesByDate: Array<{
    date: string
    count: number
  }>
}

export default function EntrantsExport() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState<Entry[]>([])
  const [raffles, setRaffles] = useState<BusinessRaffle[]>([])
  const [businessRaffles, setBusinessRaffles] = useState<BusinessRaffle[]>([])
  const [selectedRaffleId, setSelectedRaffleId] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState<Stats | null>(null)
  const [exportLoading, setExportLoading] = useState(false)
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log("Session data:", session)
    fetchRaffles()
  }, [session])

  useEffect(() => {
    if (selectedRaffleId) {
      console.log("Selected raffle changed to:", selectedRaffleId)
      fetchEntries()
      fetchStats()
    }
  }, [selectedRaffleId, page, sortBy, sortOrder, searchTerm])

  const fetchRaffles = async () => {
    try {
      console.log("Fetching raffles...")
      const response = await fetch("/api/business/raffles")
      const data = await response.json()
      console.log("Raffles response:", data)

      if (response.ok) {
        setRaffles(data.raffles)
        setBusinessRaffles(data.raffles) // They're the same data

        // Select the first raffle by default if available
        // Use raffleId (the actual raffle ID that entries use)
        if (data.raffles.length > 0) {
          const firstRaffleId = data.raffles[0].raffleId
          console.log("Setting default raffle:", firstRaffleId)
          setSelectedRaffleId(firstRaffleId)
        } else {
          console.log("No raffles available")
        }
      } else {
        setError(`Error fetching raffles: ${data.error || response.statusText}`)
      }
    } catch (error) {
      console.error("Error fetching raffles:", error)
      setError(`Error fetching raffles: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchEntries = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("Fetching entries for raffle:", selectedRaffleId)

      const url = `/api/business/entries?raffleId=${selectedRaffleId}&page=${page}&sortBy=${sortBy}&sortOrder=${sortOrder}&search=${encodeURIComponent(
        searchTerm,
      )}`
      console.log("Fetch URL:", url)

      const response = await fetch(url)

      // Check if response is JSON
      const contentType = response.headers.get("content-type")
      console.log("Response content type:", contentType)

      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error("Non-JSON response:", text.substring(0, 500))
        setError("API returned non-JSON response")
        return
      }

      const data = await response.json()
      console.log("Entries response:", data)

      if (response.ok) {
        setEntries(data.entries || [])
        setTotalPages(data.pagination?.totalPages || 1)
        console.log(`Found ${data.entries?.length || 0} entries`)
      } else {
        setError(`Error fetching entries: ${data.error || response.statusText}`)
        console.error("API error:", data)
      }
    } catch (error) {
      console.error("Error fetching entries:", error)
      setError(`Error fetching entries: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      console.log("Fetching stats for raffle:", selectedRaffleId)
      const response = await fetch(`/api/business/entries/stats?raffleId=${selectedRaffleId}`)
      const data = await response.json()
      console.log("Stats response:", data)

      if (response.ok) {
        setStats(data)
      } else {
        console.error("Stats API error:", data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const handleExport = async () => {
    try {
      setExportLoading(true)
      window.location.href = `/api/business/entries/export?raffleId=${selectedRaffleId}`
      setTimeout(() => {
        setExportLoading(false)
      }, 2000)
    } catch (error) {
      console.error("Error exporting entries:", error)
      setExportLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1) // Reset to first page on new search
    fetchEntries()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getSelectedRaffle = () => {
    return raffles.find((businessRaffle) => businessRaffle.raffleId === selectedRaffleId)
  }

  const getSelectedBusinessRaffle = () => {
    return businessRaffles.find((br) => br.raffleId === selectedRaffleId)
  }

  const getCustomQuestions = () => {
    const businessRaffle = getSelectedBusinessRaffle()
    return businessRaffle?.businessCustomizations?.customQuestions || []
  }

  const handleSort = (column: string) => {
    if (sortBy === column) {
      // Toggle sort order if clicking the same column
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      // Default to descending for new column
      setSortBy(column)
      setSortOrder("desc")
    }
  }

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return null
    return sortOrder === "asc" ? "↑" : "↓"
  }

  if (loading && !entries.length) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Entrants / Export Data</h1>
        <p className="mt-2 text-gray-600">
          View, manage, and export your competition entrant data for marketing and follow-up.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Raffle Selection */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Select Raffle</CardTitle>
          <CardDescription>Choose a raffle to view its entrants</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedRaffleId} onValueChange={setSelectedRaffleId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a raffle" />
            </SelectTrigger>
            <SelectContent>
              {raffles.map((businessRaffle) => (
                <SelectItem key={businessRaffle._id} value={businessRaffle.raffleId}>
                  {businessRaffle.raffle?.title || "Unknown Raffle"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {raffles.length === 0 && (
            <p className="text-amber-600 mt-2">No raffles found. Please create a raffle first.</p>
          )}
        </CardContent>
      </Card>

      {selectedRaffleId && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Entries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.totalEntries || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Unique Participants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.uniqueEmailCount || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Marketing Opt-ins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {entries.filter((entry) => entry.agreedToMarketing).length}
                  <span className="text-sm text-gray-500 ml-2">
                    (
                    {entries.length > 0
                      ? Math.round((entries.filter((entry) => entry.agreedToMarketing).length / entries.length) * 100)
                      : 0}
                    %)
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Export Options */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Export Options</CardTitle>
                <Button
                  onClick={handleExport}
                  disabled={exportLoading || entries.length === 0}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>{exportLoading ? "Exporting..." : "Export to CSV"}</span>
                </Button>
              </div>
              <CardDescription>Download entrant data in CSV format for your marketing needs.</CardDescription>
            </CardHeader>
          </Card>

          {/* Search and Filter */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Search and Filter</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name or email..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button type="submit" variant="secondary">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Entries Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                {getSelectedRaffle()?.raffle?.title || "Selected Raffle"} - {entries.length} entries
              </CardTitle>
              <CardDescription>
                Showing page {page} of {totalPages}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {entries.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No entries yet</p>
                  <p className="text-sm text-gray-400">Entries will appear here once people enter your raffle</p>
                </div>
              ) : (
                <>
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="cursor-pointer" onClick={() => handleSort("firstName")}>
                            Name {getSortIcon("firstName")}
                          </TableHead>
                          <TableHead className="cursor-pointer" onClick={() => handleSort("email")}>
                            Email {getSortIcon("email")}
                          </TableHead>
                          {getCustomQuestions().map((question) => (
                            <TableHead key={question.id}>{question.question}</TableHead>
                          ))}
                          <TableHead className="cursor-pointer" onClick={() => handleSort("createdAt")}>
                            Date {getSortIcon("createdAt")}
                          </TableHead>
                          <TableHead>Marketing</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {entries.map((entry) => (
                          <TableRow key={entry._id}>
                            <TableCell>
                              {entry.firstName} {entry.lastName}
                            </TableCell>
                            <TableCell>{entry.email}</TableCell>
                            {getCustomQuestions().map((question) => (
                              <TableCell key={question.id}>{entry.answers[question.id] || "-"}</TableCell>
                            ))}
                            <TableCell>{formatDate(entry.createdAt)}</TableCell>
                            <TableCell>
                              {entry.agreedToMarketing ? (
                                <span className="text-green-600">Opted In</span>
                              ) : (
                                <span className="text-gray-400">No</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-gray-500">
                        Page {page} of {totalPages}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
