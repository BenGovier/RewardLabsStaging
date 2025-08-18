"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Search, Filter } from "lucide-react"

interface Entrant {
  _id: string
  firstName: string
  lastName: string
  email: string
  submittedAt: string
  answers: Record<string, any>
  raffle: {
    title: string
    startDate: string
    endDate: string
  }
  business: {
    businessName: string
    email: string
  }
}

interface Business {
  _id: string
  businessName: string
}

interface Raffle {
  _id: string
  title: string
}

export default function AdminEntrants() {
  const { data: session } = useSession()
  const [entrants, setEntrants] = useState<Entrant[]>([])
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  // Filter states
  const [businessFilter, setBusinessFilter] = useState("all")
  const [raffleFilter, setRaffleFilter] = useState("all")
  const [entryDateFrom, setEntryDateFrom] = useState("")
  const [entryDateTo, setEntryDateTo] = useState("")
  const [raffleStartFrom, setRaffleStartFrom] = useState("")
  const [raffleStartTo, setRaffleStartTo] = useState("")
  const [raffleEndFrom, setRaffleEndFrom] = useState("")
  const [raffleEndTo, setRaffleEndTo] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  // FEATURE FLAG: ADMIN_ENTRANTS_VIEW (default: true)
  const ADMIN_ENTRANTS_VIEW = true

  useEffect(() => {
    if (session?.user?.role !== "admin" || !ADMIN_ENTRANTS_VIEW) {
      return
    }
    fetchData()
  }, [session])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch entrants with filters
      const params = new URLSearchParams()
      if (businessFilter && businessFilter !== "all") params.append("businessId", businessFilter)
      if (raffleFilter && raffleFilter !== "all") params.append("raffleId", raffleFilter)
      if (entryDateFrom) params.append("entryDateFrom", entryDateFrom)
      if (entryDateTo) params.append("entryDateTo", entryDateTo)
      if (raffleStartFrom) params.append("raffleStartFrom", raffleStartFrom)
      if (raffleStartTo) params.append("raffleStartTo", raffleStartTo)
      if (raffleEndFrom) params.append("raffleEndFrom", raffleEndFrom)
      if (raffleEndTo) params.append("raffleEndTo", raffleEndTo)
      if (searchTerm) params.append("search", searchTerm)

      const [entrantsRes, businessesRes, rafflesRes] = await Promise.all([
        fetch(`/api/admin/entrants?${params.toString()}`),
        fetch("/api/admin/entrants?type=businesses"),
        fetch("/api/admin/entrants?type=raffles"),
      ])

      if (entrantsRes.ok) {
        const entrantsData = await entrantsRes.json()
        setEntrants(entrantsData.entrants || [])
      }

      if (businessesRes.ok) {
        const businessesData = await businessesRes.json()
        setBusinesses(businessesData.businesses || [])
      }

      if (rafflesRes.ok) {
        const rafflesData = await rafflesRes.json()
        setRaffles(rafflesData.raffles || [])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      setExporting(true)

      const params = new URLSearchParams()
      if (businessFilter && businessFilter !== "all") params.append("businessId", businessFilter)
      if (raffleFilter && raffleFilter !== "all") params.append("raffleId", raffleFilter)
      if (entryDateFrom) params.append("entryDateFrom", entryDateFrom)
      if (entryDateTo) params.append("entryDateTo", entryDateTo)
      if (raffleStartFrom) params.append("raffleStartFrom", raffleStartFrom)
      if (raffleStartTo) params.append("raffleStartTo", raffleStartTo)
      if (raffleEndFrom) params.append("raffleEndFrom", raffleEndFrom)
      if (raffleEndTo) params.append("raffleEndTo", raffleEndTo)
      if (searchTerm) params.append("search", searchTerm)

      const response = await fetch(`/api/admin/entrants/export?${params.toString()}`)

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `entrants-export-${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Export error:", error)
    } finally {
      setExporting(false)
    }
  }

  const clearFilters = () => {
    setBusinessFilter("all")
    setRaffleFilter("all")
    setEntryDateFrom("")
    setEntryDateTo("")
    setRaffleStartFrom("")
    setRaffleStartTo("")
    setRaffleEndFrom("")
    setRaffleEndTo("")
    setSearchTerm("")
  }

  if (session?.user?.role !== "admin" || !ADMIN_ENTRANTS_VIEW) {
    return <div>Access denied</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">All Entrants</h1>
        <Button onClick={handleExport} disabled={exporting}>
          <Download className="mr-2 h-4 w-4" />
          {exporting ? "Exporting..." : "Export CSV"}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Business Filter */}
            <div>
              <Label>Business</Label>
              <Select value={businessFilter} onValueChange={setBusinessFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All businesses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All businesses</SelectItem>
                  {businesses.map((business) => (
                    <SelectItem key={business._id} value={business._id}>
                      {business.businessName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Raffle Filter */}
            <div>
              <Label>Raffle</Label>
              <Select value={raffleFilter} onValueChange={setRaffleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All raffles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All raffles</SelectItem>
                  {raffles.map((raffle) => (
                    <SelectItem key={raffle._id} value={raffle._id}>
                      {raffle.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div>
              <Label>Search (Name/Email)</Label>
              <Input
                placeholder="Search entrants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Date Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Entry Date Range</Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={entryDateFrom}
                  onChange={(e) => setEntryDateFrom(e.target.value)}
                  placeholder="From"
                />
                <Input
                  type="date"
                  value={entryDateTo}
                  onChange={(e) => setEntryDateTo(e.target.value)}
                  placeholder="To"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Raffle Start Date Range</Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={raffleStartFrom}
                  onChange={(e) => setRaffleStartFrom(e.target.value)}
                  placeholder="From"
                />
                <Input
                  type="date"
                  value={raffleStartTo}
                  onChange={(e) => setRaffleStartTo(e.target.value)}
                  placeholder="To"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Raffle End Date Range</Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={raffleEndFrom}
                  onChange={(e) => setRaffleEndFrom(e.target.value)}
                  placeholder="From"
                />
                <Input
                  type="date"
                  value={raffleEndTo}
                  onChange={(e) => setRaffleEndTo(e.target.value)}
                  placeholder="To"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={fetchData}>
              <Search className="mr-2 h-4 w-4" />
              Apply Filters
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>Entrants ({entrants.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead>Raffle</TableHead>
                  <TableHead>Entry Date</TableHead>
                  <TableHead>Raffle Start</TableHead>
                  <TableHead>Raffle End</TableHead>
                  <TableHead>Custom Answers</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entrants.map((entrant) => (
                  <TableRow key={entrant._id}>
                    <TableCell>
                      {entrant.firstName} {entrant.lastName}
                    </TableCell>
                    <TableCell>{entrant.email}</TableCell>
                    <TableCell>{entrant.business?.businessName || "N/A"}</TableCell>
                    <TableCell>{entrant.raffle?.title || "N/A"}</TableCell>
                    <TableCell>{new Date(entrant.submittedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {entrant.raffle?.startDate ? new Date(entrant.raffle.startDate).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell>
                      {entrant.raffle?.endDate ? new Date(entrant.raffle.endDate).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell>
                      {Object.keys(entrant.answers || {}).length > 0 ? (
                        <details>
                          <summary className="cursor-pointer text-blue-600">View Answers</summary>
                          <div className="mt-2 text-sm">
                            {Object.entries(entrant.answers || {}).map(([key, value]) => (
                              <div key={key}>
                                <strong>{key}:</strong> {String(value)}
                              </div>
                            ))}
                          </div>
                        </details>
                      ) : (
                        "None"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
