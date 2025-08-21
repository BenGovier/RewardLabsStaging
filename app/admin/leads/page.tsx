"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, TrendingUp, DollarSign, Target, Eye, Download } from "lucide-react"

interface LeadOverview {
  totalLeads: number
  repPerformance: Array<{
    repId: string
    repName: string
    email: string
    totalLeads: number
    newLeads: number
    qualifiedLeads: number
    wonDeals: number
    totalValue: number
    avgValue: number
  }>
  statusBreakdown: Array<{
    _id: string
    count: number
  }>
  sourceBreakdown: Array<{
    _id: string
    count: number
  }>
}

export default function AdminLeadsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [overview, setOverview] = useState<LeadOverview | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return

    if (!session?.user || session.user.role !== "admin") {
      router.push("/auth/signin")
      return
    }

    fetchOverview()
  }, [session, status, router])

  const fetchOverview = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/admin/leads/overview")
      if (!response.ok) throw new Error("Failed to fetch overview")

      const data = await response.json()
      setOverview(data)
    } catch (error) {
      console.error("Error fetching overview:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  if (!overview) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Failed to load lead overview</div>
      </div>
    )
  }

  const totalValue = overview.repPerformance.reduce((sum, rep) => sum + rep.totalValue, 0)
  const totalWon = overview.repPerformance.reduce((sum, rep) => sum + rep.wonDeals, 0)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Lead Management Overview</h1>
          <p className="text-gray-600">Monitor rep performance and lead pipeline across the organization</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.totalLeads}</div>
              <p className="text-xs text-muted-foreground">Across all reps</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
              <p className="text-xs text-muted-foreground">Total estimated value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Won Deals</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalWon}</div>
              <p className="text-xs text-muted-foreground">Closed successfully</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overview.totalLeads > 0 ? ((totalWon / overview.totalLeads) * 100).toFixed(1) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Leads to wins</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Rep</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  onChange={(e) => {
                    // Add filter logic here - you can implement this based on your needs
                    console.log("Filter by rep:", e.target.value)
                  }}
                >
                  <option value="">All Reps</option>
                  {overview.repPerformance.map((rep) => (
                    <option key={rep.repId} value={rep.repId}>
                      {rep.repName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  onChange={(e) => {
                    console.log("Filter by status:", e.target.value)
                  }}
                >
                  <option value="">All Statuses</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="proposal">Proposal</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                  <option value="nurturing">Nurturing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  onChange={(e) => {
                    console.log("Filter by priority:", e.target.value)
                  }}
                >
                  <option value="">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date Range</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  onChange={(e) => {
                    console.log("Filter by date:", e.target.value)
                  }}
                >
                  <option value="">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rep Performance Table */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Rep Performance</CardTitle>
                <CardDescription>Lead management performance by representative</CardDescription>
              </div>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rep Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Total Leads</TableHead>
                  <TableHead>New</TableHead>
                  <TableHead>Qualified</TableHead>
                  <TableHead>Won</TableHead>
                  <TableHead>Pipeline Value</TableHead>
                  <TableHead>Avg Deal Size</TableHead>
                  <TableHead>Win Rate</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overview.repPerformance.map((rep) => (
                  <TableRow key={rep.repId}>
                    <TableCell className="font-medium">{rep.repName}</TableCell>
                    <TableCell>{rep.email}</TableCell>
                    <TableCell>{rep.totalLeads}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{rep.newLeads}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">{rep.qualifiedLeads}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-100 text-emerald-800">{rep.wonDeals}</Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(rep.totalValue)}</TableCell>
                    <TableCell>{formatCurrency(rep.avgValue)}</TableCell>
                    <TableCell>
                      {rep.totalLeads > 0 ? ((rep.wonDeals / rep.totalLeads) * 100).toFixed(1) : 0}%
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // For now, show an alert with rep info - you can enhance this later
                          alert(
                            `Rep Details:\nName: ${rep.repName}\nEmail: ${rep.email}\nTotal Leads: ${rep.totalLeads}\nWon Deals: ${rep.wonDeals}`,
                          )
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {overview.repPerformance.length === 0 && (
              <div className="text-center py-8 text-gray-500">No lead data available yet</div>
            )}
          </CardContent>
        </Card>

        {/* Status and Source Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Lead Status Breakdown</CardTitle>
              <CardDescription>Distribution of leads by status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {overview.statusBreakdown.map((status) => (
                  <div key={status._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium capitalize">{status._id}</div>
                    <div className="text-right">
                      <div className="font-bold">{status.count}</div>
                      <div className="text-sm text-gray-500">
                        {((status.count / overview.totalLeads) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lead Source Breakdown</CardTitle>
              <CardDescription>Where leads are coming from</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {overview.sourceBreakdown.map((source) => (
                  <div key={source._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium capitalize">{source._id.replace("-", " ")}</div>
                    <div className="text-right">
                      <div className="font-bold">{source.count}</div>
                      <div className="text-sm text-gray-500">
                        {((source.count / overview.totalLeads) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
