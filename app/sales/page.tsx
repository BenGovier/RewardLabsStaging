"use client"

export const dynamic = "force-dynamic"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Trash2, Loader2, TrendingUp, DollarSign, Users } from "lucide-react"
import type { SaleWithDetails, SalesSummary } from "@/models/sale"
import type { Customer } from "@/models/customer"

interface SalesResponse {
  sales: SaleWithDetails[]
}

interface CustomersResponse {
  customers: Customer[]
}

interface SummaryResponse {
  summary: SalesSummary[]
}

function ReferralModule() {
  const [referralLinks, setReferralLinks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [newLinkName, setNewLinkName] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    fetchReferralLinks()
  }, [])

  const fetchReferralLinks = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/referrals/links")
      if (response.ok) {
        const data = await response.json()
        setReferralLinks(data.links || [])
      }
    } catch (error) {
      console.error("Error fetching referral links:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const createReferralLink = async () => {
    if (!newLinkName.trim()) return

    try {
      setIsCreating(true)
      const response = await fetch("/api/referrals/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newLinkName.trim() }),
      })

      if (response.ok) {
        setNewLinkName("")
        setShowCreateForm(false)
        fetchReferralLinks()
      }
    } catch (error) {
      console.error("Error creating referral link:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const deactivateLink = async (linkId: string) => {
    if (!confirm("Are you sure you want to deactivate this link?")) return

    try {
      const response = await fetch(`/api/referrals/links/${linkId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchReferralLinks()
      }
    } catch (error) {
      console.error("Error deactivating link:", error)
    }
  }

  const copyToClipboard = async (url: string) => {
    await navigator.clipboard.writeText(url)
    // You could add a toast notification here
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amount)
  }

  // Calculate metrics for currently displayed links
  const totalSales = referralLinks.reduce((sum, link) => sum + (link.totalSignups || 0), 0)
  const totalMonthlyRevenue = referralLinks.reduce((sum, link) => sum + (link.totalRevenue || 0), 0)
  const totalMonthlyCommission = totalMonthlyRevenue * 0.4

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Your Referral Links</h3>
          <p className="text-sm text-gray-500">Create and manage your business referral links</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} disabled={isLoading}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Link
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Number of Sales</p>
                <p className="text-2xl font-bold">{totalSales}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Monthly Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(totalMonthlyRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Commission</p>
                <p className="text-2xl font-bold">{formatCurrency(totalMonthlyCommission)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create New Link Form */}
      {showCreateForm && (
        <div className="p-4 bg-gray-50 rounded-lg space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Link Name</label>
            <Input
              value={newLinkName}
              onChange={(e) => setNewLinkName(e.target.value)}
              placeholder="e.g., LinkedIn Campaign, Email Newsletter, etc."
              onKeyPress={(e) => e.key === "Enter" && createReferralLink()}
            />
          </div>
          <div className="flex space-x-2">
            <Button onClick={createReferralLink} disabled={isCreating || !newLinkName.trim()}>
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Link"
              )}
            </Button>
            <Button variant="outline" onClick={() => setShowCreateForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Links Table */}
      {isLoading ? (
        <div className="text-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          <p className="text-gray-500">Loading your referral links...</p>
        </div>
      ) : referralLinks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No referral links created yet.</p>
          <p className="text-sm">Create your first link to start earning commissions!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Clicks</TableHead>
                <TableHead>Signups</TableHead>
                <TableHead>Monthly Revenue</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referralLinks.map((link) => {
                const monthlyRevenue = link.totalRevenue || 0
                const commission = monthlyRevenue * 0.4

                return (
                  <TableRow key={link._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{link.name}</p>
                        <p className="text-xs text-gray-500 font-mono">{link.slug}</p>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(link.createdAt)}</TableCell>
                    <TableCell>
                      <div className="text-center">
                        <p className="font-medium">{link.totalClicks || 0}</p>
                        {link.lastClickedAt && (
                          <p className="text-xs text-gray-500">Last: {formatDate(link.lastClickedAt)}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-medium">{link.totalSignups || 0}</TableCell>
                    <TableCell className="text-center font-medium">{formatCurrency(monthlyRevenue)}</TableCell>
                    <TableCell className="text-center font-medium text-green-600">
                      {formatCurrency(commission)}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => copyToClipboard(link.referralUrl)}>
                          Copy
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deactivateLink(link._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>How it works:</strong> Create named links for different campaigns. Track clicks, signups, and revenue
          for each link to see which campaigns perform best! You earn 40% commission on all monthly revenue.
        </p>
      </div>
    </div>
  )
}

export default function SalesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sales, setSales] = useState<SaleWithDetails[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [summary, setSummary] = useState<SalesSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  // Form state
  const [formData, setFormData] = useState({
    customerId: "",
    amount: "",
    dateOfSale: "",
    productDescription: "",
    commissionEarned: "",
  })

  // Filter state
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    repId: "",
  })

  useEffect(() => {
    if (status === "loading") return

    if (!session?.user) {
      router.push("/auth/signin")
      return
    }

    if (!["admin", "rep"].includes(session.user.role || "")) {
      router.push("/")
      return
    }

    fetchData()
    if (session.user.role === "rep") {
      fetchCustomers()
    }
  }, [session, status, router])

  const fetchData = async () => {
    try {
      setIsLoading(true)

      if (session?.user?.role === "rep") {
        // Fetch rep's sales
        const params = new URLSearchParams()
        if (filters.from) params.append("from", filters.from)
        if (filters.to) params.append("to", filters.to)

        const response = await fetch(`/api/sales?${params}`)
        if (!response.ok) throw new Error("Failed to fetch sales")

        const data: SalesResponse = await response.json()
        setSales(data.sales)
      } else if (session?.user?.role === "admin") {
        // Fetch all sales and summary
        const params = new URLSearchParams()
        if (filters.from) params.append("from", filters.from)
        if (filters.to) params.append("to", filters.to)
        if (filters.repId) params.append("repId", filters.repId)

        const [salesResponse, summaryResponse] = await Promise.all([
          fetch(`/api/sales?${params}`),
          fetch(`/api/sales/summary?${params}`),
        ])

        if (!salesResponse.ok || !summaryResponse.ok) {
          throw new Error("Failed to fetch data")
        }

        const salesData: SalesResponse = await salesResponse.json()
        const summaryData: SummaryResponse = await summaryResponse.json()

        setSales(salesData.sales)
        setSummary(summaryData.summary)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers")
      if (!response.ok) throw new Error("Failed to fetch customers")

      const data: CustomersResponse = await response.json()
      setCustomers(data.customers)
    } catch (error) {
      console.error("Error fetching customers:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to create sale")

      setIsDialogOpen(false)
      setFormData({
        customerId: "",
        amount: "",
        dateOfSale: "",
        productDescription: "",
        commissionEarned: "",
      })
      fetchData()
    } catch (error) {
      console.error("Error creating sale:", error)
    }
  }

  const deleteSale = async (saleId: string) => {
    if (!confirm("Are you sure you want to delete this sale?")) return

    try {
      const response = await fetch(`/api/sales/${saleId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete sale")

      fetchData()
    } catch (error) {
      console.error("Error deleting sale:", error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US")
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  const isRep = session?.user?.role === "rep"
  const isAdmin = session?.user?.role === "admin"

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sales Management</h1>
          <p className="text-gray-600">{isRep ? "Track and manage your sales" : "Overview of all sales across reps"}</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">From Date</label>
                <Input
                  type="date"
                  value={filters.from}
                  onChange={(e) => setFilters((prev) => ({ ...prev, from: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">To Date</label>
                <Input
                  type="date"
                  value={filters.to}
                  onChange={(e) => setFilters((prev) => ({ ...prev, to: e.target.value }))}
                />
              </div>
              {isAdmin && (
                <div>
                  <label className="block text-sm font-medium mb-1">Rep</label>
                  <select
                    value={filters.repId}
                    onChange={(e) => setFilters((prev) => ({ ...prev, repId: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">All Reps</option>
                    {summary.map((rep) => (
                      <option key={rep.repId} value={rep.repId}>
                        {rep.repName}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex items-end">
                <Button onClick={fetchData}>Apply Filters</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rep Referral Module - Only show for reps */}
        {isRep && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Business Referral Program</CardTitle>
              <CardDescription>Generate your referral link to earn commissions from business signups</CardDescription>
            </CardHeader>
            <CardContent>
              <ReferralModule />
            </CardContent>
          </Card>
        )}

        {/* Admin Tabs */}
        {isAdmin && (
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "all"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  All Sales
                </button>
                <button
                  onClick={() => setActiveTab("summary")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "summary"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Rep Summary
                </button>
              </nav>
            </div>
          </div>
        )}

        {/* Rep Sales Table or Admin All Sales */}
        {(isRep || (isAdmin && activeTab === "all")) && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{isRep ? "My Sales" : "All Sales"}</CardTitle>
                  <CardDescription>
                    {isRep ? "Your sales history and performance" : "Complete sales overview"}
                  </CardDescription>
                </div>
                {isRep && (
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Sale
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Sale</DialogTitle>
                        <DialogDescription>Add a new sale to your records.</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Customer</label>
                          <select
                            value={formData.customerId}
                            onChange={(e) => setFormData((prev) => ({ ...prev, customerId: e.target.value }))}
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="">Select a customer</option>
                            {customers.map((customer) => (
                              <option key={customer._id as string} value={customer._id as string}>
                                {customer.name} ({customer.email})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Amount</label>
                          <Input
                            type="number"
                            step="0.01"
                            value={formData.amount}
                            onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Date of Sale</label>
                          <Input
                            type="date"
                            value={formData.dateOfSale}
                            onChange={(e) => setFormData((prev) => ({ ...prev, dateOfSale: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Product Description</label>
                          <Input
                            value={formData.productDescription}
                            onChange={(e) => setFormData((prev) => ({ ...prev, productDescription: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Commission Earned (Optional)</label>
                          <Input
                            type="number"
                            step="0.01"
                            value={formData.commissionEarned}
                            onChange={(e) => setFormData((prev) => ({ ...prev, commissionEarned: e.target.value }))}
                          />
                        </div>
                        <Button type="submit" className="w-full">
                          Create Sale
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    {isAdmin && <TableHead>Rep</TableHead>}
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Commission</TableHead>
                    {isRep && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale._id as string}>
                      <TableCell>{formatDate(sale.dateOfSale)}</TableCell>
                      {isAdmin && (
                        <TableCell>{sale.rep ? `${sale.rep.firstName} ${sale.rep.lastName}` : "Unknown"}</TableCell>
                      )}
                      <TableCell>{sale.customer?.name || "Unknown"}</TableCell>
                      <TableCell>{sale.productDescription}</TableCell>
                      <TableCell>{formatCurrency(sale.amount)}</TableCell>
                      <TableCell>{sale.commissionEarned ? formatCurrency(sale.commissionEarned) : "-"}</TableCell>
                      {isRep && (
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="ghost" onClick={() => deleteSale(sale._id as string)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {sales.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {isRep
                    ? "No sales recorded yet. Create your first sale!"
                    : "No sales found for the selected criteria."}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Admin Summary Tab */}
        {isAdmin && activeTab === "summary" && (
          <Card>
            <CardHeader>
              <CardTitle>Rep Performance Summary</CardTitle>
              <CardDescription>Sales performance overview by representative</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rep Name</TableHead>
                    <TableHead>Total Sales</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Total Commission</TableHead>
                    <TableHead>Average Sale</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.map((rep) => (
                    <TableRow key={rep.repId}>
                      <TableCell className="font-medium">{rep.repName}</TableCell>
                      <TableCell>{rep.totalSales}</TableCell>
                      <TableCell>{formatCurrency(rep.totalAmount)}</TableCell>
                      <TableCell>{formatCurrency(rep.totalCommission)}</TableCell>
                      <TableCell>{formatCurrency(rep.averageSale)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {summary.length === 0 && (
                <div className="text-center py-8 text-gray-500">No sales data available for the selected period.</div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
