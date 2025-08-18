"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  Phone,
  Mail,
  Building2,
  Calendar,
  DollarSign,
  User,
  Edit3,
  Save,
  X,
  Plus,
  MessageSquare,
} from "lucide-react"
import type { Lead, LeadActivity } from "@/models/lead"

const STATUS_COLORS = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  qualified: "bg-green-100 text-green-800",
  proposal: "bg-purple-100 text-purple-800",
  negotiation: "bg-orange-100 text-orange-800",
  won: "bg-emerald-100 text-emerald-800",
  lost: "bg-red-100 text-red-800",
  nurturing: "bg-gray-100 text-gray-800",
}

const PRIORITY_COLORS = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-blue-100 text-blue-600",
  high: "bg-red-100 text-red-600",
}

const STATUS_OPTIONS = [
  { value: "new", label: "New Lead" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "proposal", label: "Proposal Sent" },
  { value: "negotiation", label: "In Negotiation" },
  { value: "won", label: "Deal Won" },
  { value: "lost", label: "Deal Lost" },
  { value: "nurturing", label: "Nurturing" },
]

export default function LeadDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const leadId = params.leadId as string

  const [lead, setLead] = useState<Lead | null>(null)
  const [activities, setActivities] = useState<LeadActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Form states
  const [editForm, setEditForm] = useState({
    status: "",
    priority: "",
    estimatedValue: "",
    expectedCloseDate: "",
    nextFollowUpDate: "",
    notes: "",
    tags: "",
  })

  // New activity form
  const [newActivity, setNewActivity] = useState({
    type: "note" as const,
    description: "",
    outcome: "",
    scheduledDate: "",
  })
  const [showActivityForm, setShowActivityForm] = useState(false)

  useEffect(() => {
    if (status === "loading") return

    if (!session?.user || session.user.role !== "rep") {
      router.push("/auth/signin")
      return
    }

    fetchLead()
  }, [session, status, router, leadId])

  const fetchLead = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/leads/${leadId}`)
      if (!response.ok) {
        if (response.status === 404) {
          router.push("/leads")
          return
        }
        throw new Error("Failed to fetch lead")
      }

      const data = await response.json()
      setLead(data.lead)
      setActivities(data.activities || [])

      // Initialize edit form
      setEditForm({
        status: data.lead.status,
        priority: data.lead.priority,
        estimatedValue: data.lead.estimatedValue?.toString() || "",
        expectedCloseDate: data.lead.expectedCloseDate ? data.lead.expectedCloseDate.split("T")[0] : "",
        nextFollowUpDate: data.lead.nextFollowUpDate ? data.lead.nextFollowUpDate.split("T")[0] : "",
        notes: data.lead.notes || "",
        tags: data.lead.tags?.join(", ") || "",
      })
    } catch (error) {
      console.error("Error fetching lead:", error)
      alert("Failed to load lead details")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!lead) return

    try {
      setIsSaving(true)
      const response = await fetch(`/api/leads/${leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          estimatedValue: editForm.estimatedValue ? Number.parseFloat(editForm.estimatedValue) : undefined,
          expectedCloseDate: editForm.expectedCloseDate || undefined,
          nextFollowUpDate: editForm.nextFollowUpDate || undefined,
          tags: editForm.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        }),
      })

      if (!response.ok) throw new Error("Failed to update lead")

      await fetchLead() // Refresh data
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating lead:", error)
      alert("Failed to update lead")
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddActivity = async () => {
    if (!newActivity.description.trim()) return

    try {
      const response = await fetch(`/api/leads/${leadId}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newActivity,
          scheduledDate: newActivity.scheduledDate || undefined,
        }),
      })

      if (!response.ok) throw new Error("Failed to add activity")

      await fetchLead() // Refresh data
      setNewActivity({
        type: "note",
        description: "",
        outcome: "",
        scheduledDate: "",
      })
      setShowActivityForm(false)
    } catch (error) {
      console.error("Error adding activity:", error)
      alert("Failed to add activity")
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

  const formatDateTime = (date: string | Date) => {
    return new Date(date).toLocaleString("en-US")
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Lead not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => router.push("/leads")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Leads
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {lead.firstName} {lead.lastName}
              </h1>
              <p className="text-gray-600">{lead.company || "Individual"}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={STATUS_COLORS[lead.status]}>
              {STATUS_OPTIONS.find((s) => s.value === lead.status)?.label}
            </Badge>
            <Badge className={PRIORITY_COLORS[lead.priority]}>{lead.priority} priority</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{lead.email}</span>
                    <Button size="sm" variant="outline" onClick={() => window.open(`mailto:${lead.email}`)}>
                      Email
                    </Button>
                  </div>
                  {lead.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{lead.phone}</span>
                      <Button size="sm" variant="outline" onClick={() => window.open(`tel:${lead.phone}`)}>
                        Call
                      </Button>
                    </div>
                  )}
                  {lead.company && (
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-gray-500" />
                      <span>{lead.company}</span>
                    </div>
                  )}
                  {lead.jobTitle && (
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span>{lead.jobTitle}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sales Information */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Sales Information</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                  {isEditing ? "Cancel" : "Edit"}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select
                          value={editForm.status}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          {STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Priority</label>
                        <select
                          value={editForm.priority}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, priority: e.target.value }))}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Estimated Value</label>
                        <Input
                          type="number"
                          step="0.01"
                          value={editForm.estimatedValue}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, estimatedValue: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Expected Close Date</label>
                        <Input
                          type="date"
                          value={editForm.expectedCloseDate}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, expectedCloseDate: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Next Follow-up Date</label>
                        <Input
                          type="date"
                          value={editForm.nextFollowUpDate}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, nextFollowUpDate: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                        <Input
                          value={editForm.tags}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, tags: e.target.value }))}
                          placeholder="e.g., hot-lead, enterprise"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Notes</label>
                      <Textarea
                        value={editForm.notes}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, notes: e.target.value }))}
                        rows={4}
                        placeholder="Add notes about this lead..."
                      />
                    </div>
                    <Button onClick={handleSave} disabled={isSaving}>
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span>Value: {lead.estimatedValue ? formatCurrency(lead.estimatedValue) : "Not set"}</span>
                    </div>
                    {lead.expectedCloseDate && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>Expected Close: {formatDate(lead.expectedCloseDate)}</span>
                      </div>
                    )}
                    {lead.nextFollowUpDate && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>Next Follow-up: {formatDate(lead.nextFollowUpDate)}</span>
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600">
                        <strong>Source:</strong> {lead.source.replace("-", " ")}
                        {lead.sourceDetails && ` - ${lead.sourceDetails}`}
                      </p>
                    </div>
                    {lead.tags && lead.tags.length > 0 && (
                      <div className="md:col-span-2">
                        <div className="flex flex-wrap gap-1">
                          {lead.tags.map((tag, index) => (
                            <Badge key={index} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {lead.notes && (
                      <div className="md:col-span-2">
                        <p className="text-sm">
                          <strong>Notes:</strong> {lead.notes}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activities */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Activity History</CardTitle>
                <Button size="sm" onClick={() => setShowActivityForm(!showActivityForm)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Activity
                </Button>
              </CardHeader>
              <CardContent>
                {showActivityForm && (
                  <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Activity Type</label>
                          <select
                            value={newActivity.type}
                            onChange={(e) => setNewActivity((prev) => ({ ...prev, type: e.target.value as any }))}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="call">Phone Call</option>
                            <option value="email">Email</option>
                            <option value="meeting">Meeting</option>
                            <option value="note">Note</option>
                            <option value="follow-up">Follow-up</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Scheduled Date (optional)</label>
                          <Input
                            type="datetime-local"
                            value={newActivity.scheduledDate}
                            onChange={(e) => setNewActivity((prev) => ({ ...prev, scheduledDate: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <Textarea
                          value={newActivity.description}
                          onChange={(e) => setNewActivity((prev) => ({ ...prev, description: e.target.value }))}
                          placeholder="What happened or what needs to be done?"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Outcome (optional)</label>
                        <Input
                          value={newActivity.outcome}
                          onChange={(e) => setNewActivity((prev) => ({ ...prev, outcome: e.target.value }))}
                          placeholder="Result or next steps"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={handleAddActivity}>Add Activity</Button>
                        <Button variant="outline" onClick={() => setShowActivityForm(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {activities.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No activities yet</p>
                  ) : (
                    activities.map((activity) => (
                      <div key={activity._id as string} className="border-l-4 border-blue-200 pl-4 py-2">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <MessageSquare className="h-4 w-4 text-blue-600" />
                            <span className="font-medium capitalize">{activity.type.replace("-", " ")}</span>
                          </div>
                          <span className="text-sm text-gray-500">{formatDateTime(activity.createdAt)}</span>
                        </div>
                        <p className="text-sm text-gray-700">{activity.description}</p>
                        {activity.outcome && (
                          <p className="text-sm text-gray-600 mt-1">
                            <strong>Outcome:</strong> {activity.outcome}
                          </p>
                        )}
                        {activity.scheduledDate && (
                          <p className="text-sm text-gray-600 mt-1">
                            <strong>Scheduled:</strong> {formatDateTime(activity.scheduledDate)}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" onClick={() => window.open(`mailto:${lead.email}`)}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                {lead.phone && (
                  <Button className="w-full" variant="outline" onClick={() => window.open(`tel:${lead.phone}`)}>
                    <Phone className="h-4 w-4 mr-2" />
                    Call Now
                  </Button>
                )}
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => {
                    setEditForm((prev) => ({ ...prev, status: "contacted" }))
                    setIsEditing(true)
                  }}
                >
                  Mark as Contacted
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => {
                    setEditForm((prev) => ({ ...prev, status: "qualified" }))
                    setIsEditing(true)
                  }}
                >
                  Mark as Qualified
                </Button>
              </CardContent>
            </Card>

            {/* Lead Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Lead Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <strong>Created:</strong> {formatDate(lead.createdAt)}
                </div>
                <div>
                  <strong>Last Updated:</strong> {formatDate(lead.updatedAt)}
                </div>
                {lead.lastContactDate && (
                  <div>
                    <strong>Last Contact:</strong> {formatDate(lead.lastContactDate)}
                  </div>
                )}
                <div>
                  <strong>Activities:</strong> {activities.length}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
