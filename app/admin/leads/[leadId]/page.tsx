"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Phone, Mail, Building2, Calendar, DollarSign, User, MessageSquare } from "lucide-react"
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

export default function AdminLeadDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const leadId = params.leadId as string

  const [lead, setLead] = useState<Lead | null>(null)
  const [activities, setActivities] = useState<LeadActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return

    if (!session?.user || session.user.role !== "admin") {
      router.push("/auth/signin")
      return
    }

    fetchLead()
  }, [session, status, router, leadId])

  const fetchLead = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/leads/${leadId}`)
      if (!response.ok) {
        if (response.status === 404) {
          router.push("/admin/leads")
          return
        }
        throw new Error("Failed to fetch lead")
      }

      const data = await response.json()
      setLead(data.lead)
      setActivities(data.activities || [])
    } catch (error) {
      console.error("Error fetching lead:", error)
      alert("Failed to load lead details")
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
            <Button variant="outline" onClick={() => router.push("/admin/leads")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Leads
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {lead.firstName} {lead.lastName}
              </h1>
              <p className="text-gray-600">
                {lead.company || "Individual"} • Rep: {lead.repName}
              </p>
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
                  </div>
                  {lead.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{lead.phone}</span>
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
              <CardHeader>
                <CardTitle>Sales Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>

            {/* Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Activity History</CardTitle>
              </CardHeader>
              <CardContent>
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
            {/* Rep Information */}
            <Card>
              <CardHeader>
                <CardTitle>Assigned Rep</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Name:</strong> {lead.repName}
                  </div>
                  <div>
                    <strong>Email:</strong> {lead.repEmail}
                  </div>
                </div>
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
