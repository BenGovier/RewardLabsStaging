"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, TrendingUp, DollarSign, Calendar, Mail, Globe, MousePointer, Building2, Trophy } from "lucide-react"
import type { DashboardData as AdminDashboardData } from "@/app/api/admin/dashboard/route"

interface ReferralPerformance {
  totalLinks: number
  totalClicks: number
  totalSignups: number
  totalCommission: number
  repPerformance: Array<{
    repId: string
    repName: string
    email: string
    activeLinks: number
    totalClicks: number
    totalSignups: number
    conversionRate: number
    revenueGenerated: number
    commissionEarned: number
  }>
  topLinks: Array<{
    linkId: string
    name: string
    repName: string
    clicks: number
    signups: number
    revenue: number
    createdAt: string
  }>
}

export default function AdminDashboardPage() {
  const { data: session } = useSession()
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<
    "overview" | "reps" | "sales" | "website-leads" | "business-signups" | "customers" | "referral-performance"
  >("overview")
  const [websiteLeads, setWebsiteLeads] = useState<any[]>([])
  const [websiteLeadsLoading, setWebsiteLeadsLoading] = useState(false)
  const [referralPerformance, setReferralPerformance] = useState<ReferralPerformance | null>(null)
  const [referralLoading, setReferralLoading] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    if (activeTab === "referral-performance") {
      fetchReferralPerformance()
    }
  }, [activeTab])

  useEffect(() => {
    if (activeTab === "website-leads") {
      fetchWebsiteLeads()
    }
  }, [activeTab])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/admin/dashboard")
      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard data: ${response.status}`)
      }

      const data: AdminDashboardData = await response.json()
      setDashboardData(data)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setError(error instanceof Error ? error.message : "Failed to load dashboard data")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchReferralPerformance = async () => {
    setReferralLoading(true)
    try {
      const response = await fetch("/api/admin/referral-performance")
      if (!response.ok) throw new Error("Failed to fetch referral performance")

      const data = await response.json()
      setReferralPerformance(data)
    } catch (error) {
      console.error("Error fetching referral performance:", error)
    } finally {
      setReferralLoading(false)
    }
  }

  const fetchWebsiteLeads = async () => {
    setWebsiteLeadsLoading(true)
    try {
      const response = await fetch("/api/website-leads")
      if (!response.ok) throw new Error("Failed to fetch website leads")

      const data = await response.json()
      setWebsiteLeads(data.leads || [])
    } catch (error) {
      console.error("Error fetching website leads:", error)
    } finally {
      setWebsiteLeadsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">Error: {error}</div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div>No dashboard data available</div>
      </div>
    )
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "reps", label: "Representatives", icon: Users },
    { id: "sales", label: "Sales Data", icon: DollarSign },
    { id: "business-signups", label: "Business Signups", icon: Building2 },
    { id: "referral-performance", label: "Referral Performance", icon: MousePointer },
    { id: "website-leads", label: "Website Leads", icon: Globe },
    { id: "customers", label: "Customers", icon: Building2 },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Overview of key business metrics</p>
      </div>

      {/* Main Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Clients */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.clients?.total || 0}</div>
            <p className="text-xs text-muted-foreground">{dashboardData.clients?.active || 0} active subscriptions</p>
          </CardContent>
        </Card>

        {/* Monthly Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardData.monthlyRevenue?.total || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(dashboardData.monthlyRevenue?.thisMonth || 0)} this month
            </p>
          </CardContent>
        </Card>

        {/* Website Leads */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Website Leads</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.websiteLeads?.total || 0}</div>
            <p className="text-xs text-muted-foreground">{dashboardData.websiteLeads?.thisMonth || 0} this month</p>
          </CardContent>
        </Card>

        {/* Total Entries */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalEntries?.total || 0}</div>
            <p className="text-xs text-muted-foreground">{dashboardData.totalEntries?.thisMonth || 0} this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Growth Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Clients This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{dashboardData.clients?.thisMonth || 0}</div>
            <p className="text-xs text-muted-foreground">New business signups</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads Last 7 Days</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{dashboardData.leads?.last7Days || 0}</div>
            <p className="text-xs text-muted-foreground">Recent website activity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entries Last 7 Days</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{dashboardData.totalEntries?.last7Days || 0}</div>
            <p className="text-xs text-muted-foreground">Recent raffle activity</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      {(dashboardData.monthlyRevenue?.breakdown || []).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown by Plan</CardTitle>
            <CardDescription>Monthly recurring revenue by subscription plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(dashboardData.monthlyRevenue?.breakdown || []).map((plan, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{plan.planName}</div>
                    <div className="text-sm text-gray-500">{plan.count} subscribers</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatCurrency(plan.revenue)}</div>
                    <div className="text-sm text-gray-500">per month</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-[#009FFD] text-[#009FFD]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Representatives</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(dashboardData.repBreakdown || []).length}</div>
                <p className="text-xs text-muted-foreground">Active representatives</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sales This Month</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(dashboardData.dailySales || []).reduce((sum, day) => sum + day.salesCount, 0)}
                </div>
                <p className="text-xs text-muted-foreground">Total sales this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sales Last 7 Days</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(dashboardData.dailySales || [])
                    .filter((day) => new Date(day.date) >= new Date(new Date().setDate(new Date().getDate() - 7)))
                    .reduce((sum, day) => sum + day.salesCount, 0)}
                </div>
                <p className="text-xs text-muted-foreground">Sales in the last week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Website Leads</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.websiteLeads?.total || 0}</div>
                <p className="text-xs text-muted-foreground">Total website leads collected</p>
              </CardContent>
            </Card>
          </div>

          {/* Business Signup Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Business Signups</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.businessSignups?.total || 0}</div>
                <p className="text-xs text-muted-foreground">Total active businesses</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Signups This Month</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.businessSignups?.thisMonth || 0}</div>
                <p className="text-xs text-muted-foreground">New businesses this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">MRR</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(dashboardData.businessSignups?.mrr || 0)}</div>
                <p className="text-xs text-muted-foreground">Monthly recurring revenue</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Signups Last 7 Days</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.businessSignups?.last7Days || 0}</div>
                <p className="text-xs text-muted-foreground">Recent business growth</p>
              </CardContent>
            </Card>
          </div>

          {/* Website Leads Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Website Leads This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#009FFD]">{dashboardData.websiteLeads?.thisMonth || 0}</div>
                <p className="text-sm text-gray-600">Leads collected this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Leads Last 7 Days</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#FFAF40]">{dashboardData.websiteLeads?.last7Days || 0}</div>
                <p className="text-sm text-gray-600">Recent lead activity</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Lead Source</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#2A2A72]">
                  {dashboardData.websiteLeads?.bySource[0]?.source || "N/A"}
                </div>
                <p className="text-sm text-gray-600">{dashboardData.websiteLeads?.bySource[0]?.count || 0} leads</p>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {activeTab === "reps" && (
        <Card>
          <CardHeader>
            <CardTitle>Representative Performance</CardTitle>
            <CardDescription>Sales performance breakdown by representative</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rep Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Sales Count</TableHead>
                  <TableHead>Total Sales</TableHead>
                  <TableHead>Total Commission</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(dashboardData.repBreakdown || []).map((rep) => (
                  <TableRow key={rep.repId}>
                    <TableCell className="font-medium">{rep.repName}</TableCell>
                    <TableCell>{rep.email}</TableCell>
                    <TableCell>{rep.salesCount}</TableCell>
                    <TableCell>{formatCurrency(rep.totalSalesAmount)}</TableCell>
                    <TableCell>{formatCurrency(rep.totalCommission)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {(dashboardData.repBreakdown || []).length === 0 && (
              <div className="text-center py-8 text-gray-500">No sales data available</div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "sales" && (
        <Card>
          <CardHeader>
            <CardTitle>Daily Sales (Last 30 Days)</CardTitle>
            <CardDescription>Daily sales totals and transaction counts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Simple visual representation */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {(dashboardData.dailySales || []).map((day) => (
                  <div key={day.date} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{formatDate(day.date)}</div>
                      <div className="text-sm text-gray-500">{day.salesCount} sales</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(day.totalAmount)}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Statistics */}
              <div className="border-t pt-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#009FFD]">
                      {formatCurrency((dashboardData.dailySales || []).reduce((sum, day) => sum + day.totalAmount, 0))}
                    </div>
                    <div className="text-sm text-gray-500">Total Revenue (30 days)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#FFAF40]">
                      {(dashboardData.dailySales || []).reduce((sum, day) => sum + day.salesCount, 0)}
                    </div>
                    <div className="text-sm text-gray-500">Total Sales (30 days)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#2A2A72]">
                      {formatCurrency(
                        (dashboardData.dailySales || []).reduce((sum, day) => sum + day.totalAmount, 0) /
                          Math.max(
                            (dashboardData.dailySales || []).reduce((sum, day) => sum + day.salesCount, 0),
                            1,
                          ),
                      )}
                    </div>
                    <div className="text-sm text-gray-500">Average Sale Value</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "website-leads" && (
        <div className="space-y-6">
          {/* Website Leads Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.websiteLeads?.total || 0}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.websiteLeads?.thisMonth || 0}</div>
                <p className="text-xs text-muted-foreground">New leads this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last 7 Days</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.websiteLeads?.last7Days || 0}</div>
                <p className="text-xs text-muted-foreground">Recent activity</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Source</CardTitle>
                <MousePointer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">{dashboardData.websiteLeads?.bySource[0]?.source || "N/A"}</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData.websiteLeads?.bySource[0]?.count || 0} leads
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Lead Sources Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Lead Sources</CardTitle>
              <CardDescription>Breakdown of leads by source</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(dashboardData.websiteLeads?.bySource || []).map((source, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium capitalize">{source.source.replace("-", " ")}</div>
                    <div className="text-right">
                      <div className="font-bold">{source.count}</div>
                      <div className="text-sm text-gray-500">
                        {((source.count / (dashboardData.websiteLeads?.total || 1)) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Website Leads Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Website Leads</CardTitle>
              <CardDescription>Latest email addresses collected from website</CardDescription>
            </CardHeader>
            <CardContent>
              {websiteLeadsLoading ? (
                <div className="text-center py-8">Loading website leads...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {websiteLeads.map((lead) => (
                      <TableRow key={lead._id}>
                        <TableCell className="font-medium">{lead.email}</TableCell>
                        <TableCell>
                          <span className="capitalize">{lead.source.replace("-", " ")}</span>
                        </TableCell>
                        <TableCell>{formatDateTime(lead.timestamp)}</TableCell>
                        <TableCell className="text-sm text-gray-500">{lead.ipAddress || "Unknown"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              {websiteLeads.length === 0 && !websiteLeadsLoading && (
                <div className="text-center py-8 text-gray-500">No website leads collected yet</div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      {activeTab === "business-signups" && (
        <div className="space-y-6">
          {/* Business Signup Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Businesses</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.businessSignups?.total || 0}</div>
                <p className="text-xs text-muted-foreground">Active subscriptions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.businessSignups?.thisMonth || 0}</div>
                <p className="text-xs text-muted-foreground">New signups</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last 7 Days</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.businessSignups?.last7Days || 0}</div>
                <p className="text-xs text-muted-foreground">Recent growth</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(dashboardData.businessSignups?.mrr || 0)}</div>
                <p className="text-xs text-muted-foreground">MRR from subscriptions</p>
              </CardContent>
            </Card>
          </div>

          {/* Rep Performance for Business Signups */}
          <Card>
            <CardHeader>
              <CardTitle>Rep Performance - Business Signups</CardTitle>
              <CardDescription>Representatives ranked by business referrals and revenue generated</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rep Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Business Signups</TableHead>
                    <TableHead>Revenue Generated</TableHead>
                    <TableHead>Avg. Revenue per Signup</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(dashboardData.businessSignups?.repPerformance || []).map((rep) => (
                    <TableRow key={rep.repId}>
                      <TableCell className="font-medium">{rep.repName}</TableCell>
                      <TableCell>{rep.email}</TableCell>
                      <TableCell>{rep.businessSignups}</TableCell>
                      <TableCell>{formatCurrency(rep.totalRevenue)}</TableCell>
                      <TableCell>{formatCurrency(rep.totalRevenue / rep.businessSignups)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {(dashboardData.businessSignups?.repPerformance || []).length === 0 && (
                <div className="text-center py-8 text-gray-500">No business signups from reps yet</div>
              )}
            </CardContent>
          </Card>

          {/* Recent Business Signups */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Business Signups</CardTitle>
              <CardDescription>Latest businesses that have completed their subscription</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Referred By</TableHead>
                    <TableHead>Signup Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(dashboardData.businessSignups?.recent || []).map((signup, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{signup.businessName}</TableCell>
                      <TableCell>{signup.email}</TableCell>
                      <TableCell>{signup.repName}</TableCell>
                      <TableCell>{formatDateTime(signup.completedAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {(dashboardData.businessSignups?.recent || []).length === 0 && (
                <div className="text-center py-8 text-gray-500">No business signups yet</div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      {activeTab === "customers" && (
        <div className="space-y-6">
          {/* Customer Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.customers?.total || 0}</div>
                <p className="text-xs text-muted-foreground">All business accounts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.customers?.active || 0}</div>
                <p className="text-xs text-muted-foreground">Currently paying</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New This Month</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.customers?.thisMonth || 0}</div>
                <p className="text-xs text-muted-foreground">Recent acquisitions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total MRR</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(dashboardData.customers?.totalMRR || 0)}</div>
                <p className="text-xs text-muted-foreground">Monthly recurring revenue</p>
              </CardContent>
            </Card>
          </div>

          {/* Customers Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Business Customers</CardTitle>
              <CardDescription>Complete list of business subscribers with key metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Monthly Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total Entries</TableHead>
                    <TableHead>Referred By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(dashboardData.customers?.list || []).map((customer) => (
                    <TableRow key={customer.businessId}>
                      <TableCell className="font-medium">{customer.businessName}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{formatDate(customer.joinDate)}</TableCell>
                      <TableCell>{formatCurrency(customer.monthlyAmount)}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            customer.subscriptionStatus === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {customer.subscriptionStatus}
                        </span>
                      </TableCell>
                      <TableCell>{customer.totalEntries}</TableCell>
                      <TableCell>{customer.referredBy || "Direct"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {(!dashboardData.customers?.list || dashboardData.customers.list.length === 0) && (
                <div className="text-center py-8 text-gray-500">No customers found</div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      {activeTab === "referral-performance" && (
        <div className="space-y-6">
          {referralLoading ? (
            <div className="text-center py-8">Loading referral performance...</div>
          ) : referralPerformance ? (
            <>
              {/* Referral Performance Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Referral Links</CardTitle>
                    <MousePointer className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{referralPerformance.totalLinks}</div>
                    <p className="text-xs text-muted-foreground">Active referral links</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                    <MousePointer className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{referralPerformance.totalClicks}</div>
                    <p className="text-xs text-muted-foreground">All-time clicks</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Signups</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{referralPerformance.totalSignups}</div>
                    <p className="text-xs text-muted-foreground">Referral conversions</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(referralPerformance.totalCommission)}</div>
                    <p className="text-xs text-muted-foreground">Earned commissions</p>
                  </CardContent>
                </Card>
              </div>

              {/* Rep Referral Performance Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Rep Referral Performance</CardTitle>
                  <CardDescription>Detailed breakdown of referral performance by representative</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rep Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Active Links</TableHead>
                        <TableHead>Total Clicks</TableHead>
                        <TableHead>Total Signups</TableHead>
                        <TableHead>Conversion Rate</TableHead>
                        <TableHead>Revenue Generated</TableHead>
                        <TableHead>Commission Earned</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {referralPerformance.repPerformance.map((rep) => (
                        <TableRow key={rep.repId}>
                          <TableCell className="font-medium">{rep.repName}</TableCell>
                          <TableCell>{rep.email}</TableCell>
                          <TableCell>{rep.activeLinks}</TableCell>
                          <TableCell>{rep.totalClicks}</TableCell>
                          <TableCell>{rep.totalSignups}</TableCell>
                          <TableCell>
                            {rep.totalClicks > 0 ? ((rep.totalSignups / rep.totalClicks) * 100).toFixed(1) : 0}%
                          </TableCell>
                          <TableCell>{formatCurrency(rep.revenueGenerated)}</TableCell>
                          <TableCell>{formatCurrency(rep.commissionEarned)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {referralPerformance.repPerformance.length === 0 && (
                    <div className="text-center py-8 text-gray-500">No referral performance data available</div>
                  )}
                </CardContent>
              </Card>

              {/* Top Performing Links */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Referral Links</CardTitle>
                  <CardDescription>Best performing referral links across all representatives</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Link Name</TableHead>
                        <TableHead>Rep Name</TableHead>
                        <TableHead>Clicks</TableHead>
                        <TableHead>Signups</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {referralPerformance.topLinks.map((link) => (
                        <TableRow key={link.linkId}>
                          <TableCell className="font-medium">{link.name}</TableCell>
                          <TableCell>{link.repName}</TableCell>
                          <TableCell>{link.clicks}</TableCell>
                          <TableCell>{link.signups}</TableCell>
                          <TableCell>{formatCurrency(link.revenue)}</TableCell>
                          <TableCell>{formatDate(link.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {referralPerformance.topLinks.length === 0 && (
                    <div className="text-center py-8 text-gray-500">No referral links found</div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">Failed to load referral performance data</div>
          )}
        </div>
      )}
    </div>
  )
}
