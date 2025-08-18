"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2 } from "lucide-react"

interface Client {
  _id: string
  businessName: string
  email: string
  createdAt: string
  subscription?: {
    id: string
    status: string
    planName: string
    monthlyAmount: number
    currency: string
    currentPeriodEnd: string
    cancelAtPeriodEnd: boolean
  }
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/admin/clients")
      if (response.ok) {
        const data = await response.json()
        setClients(data.clients || [])
      }
    } catch (error) {
      console.error("Error fetching clients:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async (clientId: string, subscriptionId: string) => {
    setCancellingId(clientId)
    try {
      const response = await fetch(`/api/admin/clients/${clientId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId }),
      })

      if (response.ok) {
        // Refresh clients data
        await fetchClients()
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error)
    } finally {
      setCancellingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Clients</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Business Clients ({clients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Monthly Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client._id}>
                  <TableCell className="font-medium">{client.businessName}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.subscription?.planName || "No Plan"}</TableCell>
                  <TableCell>{client.subscription ? `£${client.subscription.monthlyAmount}` : "-"}</TableCell>
                  <TableCell>
                    {client.subscription ? (
                      <Badge variant={client.subscription.status === "active" ? "default" : "secondary"}>
                        {client.subscription.cancelAtPeriodEnd ? "Cancelling" : client.subscription.status}
                      </Badge>
                    ) : (
                      <Badge variant="outline">No Subscription</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {client.subscription &&
                      client.subscription.status === "active" &&
                      !client.subscription.cancelAtPeriodEnd && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancelSubscription(client._id, client.subscription!.id)}
                          disabled={cancellingId === client._id}
                        >
                          {cancellingId === client._id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cancel"}
                        </Button>
                      )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
