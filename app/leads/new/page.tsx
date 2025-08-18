"use client"

import type React from "react"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"

export default function NewLeadPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    jobTitle: "",
    source: "",
    sourceDetails: "",
    priority: "medium",
    estimatedValue: "",
    expectedCloseDate: "",
    nextFollowUpDate: "",
    notes: "",
    tags: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.firstName || !formData.lastName || !formData.email) {
      alert("Please fill in all required fields")
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          estimatedValue: formData.estimatedValue ? Number.parseFloat(formData.estimatedValue) : undefined,
          expectedCloseDate: formData.expectedCloseDate || undefined,
          nextFollowUpDate: formData.nextFollowUpDate || undefined,
          tags: formData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create lead")
      }

      const result = await response.json()
      router.push(`/leads/${result.leadId}`)
    } catch (error) {
      console.error("Error creating lead:", error)
      alert(error instanceof Error ? error.message : "Failed to create lead")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session?.user || session.user.role !== "rep") {
    router.push("/auth/signin")
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6 flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.push("/leads")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Leads
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Lead</h1>
            <p className="text-gray-600">Create a new lead in your pipeline</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lead Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Company</label>
                  <Input
                    value={formData.company}
                    onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Job Title</label>
                  <Input
                    value={formData.jobTitle}
                    onChange={(e) => setFormData((prev) => ({ ...prev, jobTitle: e.target.value }))}
                  />
                </div>
              </div>

              {/* Lead Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Source</label>
                  <Select
                    value={formData.source}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, source: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cold-call">Cold Call</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="social-media">Social Media</SelectItem>
                      <SelectItem value="event">Event/Trade Show</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Estimated Value (£)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.estimatedValue}
                    onChange={(e) => setFormData((prev) => ({ ...prev, estimatedValue: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Expected Close Date</label>
                  <Input
                    type="date"
                    value={formData.expectedCloseDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, expectedCloseDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Next Follow-up Date</label>
                  <Input
                    type="date"
                    value={formData.nextFollowUpDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, nextFollowUpDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                  <Input
                    value={formData.tags}
                    onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                    placeholder="e.g., hot-lead, enterprise"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Source Details</label>
                <Input
                  value={formData.sourceDetails}
                  onChange={(e) => setFormData((prev) => ({ ...prev, sourceDetails: e.target.value }))}
                  placeholder="Additional context about the source"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                  placeholder="Add any additional notes about this lead..."
                />
              </div>

              <div className="flex space-x-4">
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Creating..." : "Create Lead"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push("/leads")}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
