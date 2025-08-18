"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { Plus, Edit, UserX, CheckCircle, XCircle } from "lucide-react"

interface Rep {
  _id: string
  firstName: string
  lastName: string
  email: string
  mobile?: string
  isActive: boolean
  invitationSent: boolean
  dateCreated: string
}

interface RepsResponse {
  reps: Rep[]
}

export default function AdminRepsPage() {
  const [reps, setReps] = useState<Rep[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRep, setEditingRep] = useState<Rep | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
  })

  useEffect(() => {
    fetchReps()
  }, [])

  const fetchReps = async () => {
    try {
      const response = await fetch("/api/admin/reps")
      if (!response.ok) throw new Error("Failed to fetch reps")

      const data: RepsResponse = await response.json()
      setReps(data.reps)
    } catch (error) {
      console.error("Error fetching reps:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      const url = editingRep ? `/api/admin/reps/${editingRep._id}` : "/api/admin/reps"
      const method = editingRep ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save rep")
      }

      setIsDialogOpen(false)
      setEditingRep(null)
      resetForm()
      fetchReps()
    } catch (error) {
      console.error("Error saving rep:", error)
      alert(error instanceof Error ? error.message : "Failed to save rep")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (rep: Rep) => {
    setEditingRep(rep)
    setFormData({
      firstName: rep.firstName,
      lastName: rep.lastName,
      email: rep.email,
      mobile: rep.mobile || "",
    })
    setIsDialogOpen(true)
  }

  const handleDeactivate = async (repId: string) => {
    if (!confirm("Are you sure you want to deactivate this representative?")) return

    try {
      const response = await fetch(`/api/admin/reps/${repId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to deactivate rep")

      fetchReps()
    } catch (error) {
      console.error("Error deactivating rep:", error)
      alert("Failed to deactivate rep")
    }
  }

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      mobile: "",
    })
    setEditingRep(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Representatives</h1>
            <p className="text-gray-600">Add, edit, and manage sales representatives</p>
          </div>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open) resetForm()
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Rep
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingRep ? "Edit Representative" : "Add New Representative"}</DialogTitle>
                <DialogDescription>
                  {editingRep
                    ? "Update the representative's information."
                    : "Create a new representative account. An invitation email will be sent."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name</label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                    required
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                    required
                    placeholder="Enter last name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    required
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mobile (Optional)</label>
                  <Input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData((prev) => ({ ...prev, mobile: e.target.value }))}
                    placeholder="Enter mobile number"
                  />
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Saving..." : editingRep ? "Update Rep" : "Create Rep"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Reps Table */}
      <Card>
        <CardHeader>
          <CardTitle>Representatives</CardTitle>
          <CardDescription>Manage all sales representatives in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Date Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reps.map((rep) => (
                <TableRow key={rep._id}>
                  <TableCell className="font-medium">
                    {rep.firstName} {rep.lastName}
                  </TableCell>
                  <TableCell>{rep.email}</TableCell>
                  <TableCell>{rep.mobile || "-"}</TableCell>
                  <TableCell>{formatDate(rep.dateCreated)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {rep.isActive ? (
                        <div className="flex items-center space-x-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>Active</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 text-red-600">
                          <XCircle className="h-4 w-4" />
                          <span>Inactive</span>
                        </div>
                      )}
                      {!rep.invitationSent && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          Invitation Pending
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(rep)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      {rep.isActive && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeactivate(rep._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {reps.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No representatives found. Create your first rep to get started!
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
