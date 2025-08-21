"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  ImageIcon,
  Loader2,
  Copy,
  ExternalLink,
  Users,
  Eye,
  Trophy,
  Users2,
  Clock,
  CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Raffle {
  _id: string
  title: string
  description: string
  startDate: string
  endDate: string
  prizeImages: string[]
  mainImageIndex: number
  coverImage: string
  createdAt: string
  updatedAt: string
}

interface BusinessUser {
  _id: string
  email: string
  businessName: string
}

export default function RafflesPage() {
  const router = useRouter()
  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [businessUsers, setBusinessUsers] = useState<BusinessUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRaffle, setSelectedRaffle] = useState<Raffle | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [urlsDialogOpen, setUrlsDialogOpen] = useState(false)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [winnersDialogOpen, setWinnersDialogOpen] = useState(false)
  const [winnerSelectionLoading, setWinnerSelectionLoading] = useState(false)
  const [raffleWinners, setRaffleWinners] = useState<any[]>([])
  const [raffleEntries, setRaffleEntries] = useState<any[]>([])
  const [selectionMethod, setSelectionMethod] = useState<"manual" | "random">("random")
  const [selectedEntryId, setSelectedEntryId] = useState<string>("")
  const [prizeDescription, setPrizeDescription] = useState<string>("")
  const [winnerNotes, setWinnerNotes] = useState<string>("")

  useEffect(() => {
    fetchRaffles()
    fetchBusinessUsers()
  }, [])

  const fetchRaffles = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/raffles")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch raffles")
      }

      setRaffles(data.raffles || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  const fetchBusinessUsers = async () => {
    try {
      console.log("Fetching business users...")
      const response = await fetch("/api/admin/reps")
      const data = await response.json()
      console.log("Admin reps response:", data)

      if (response.ok) {
        // Filter for business users only
        const businesses = data.reps?.filter((user: any) => user.role === "business") || []
        console.log("Filtered business users:", businesses)
        setBusinessUsers(businesses)
      } else {
        console.error("Failed to fetch reps:", data)
        // Try alternative endpoint
        const altResponse = await fetch("/api/debug/find-business-user")
        const altData = await altResponse.json()
        console.log("Alternative business user data:", altData)

        if (altData.success && altData.results?.users?.businessUsers) {
          setBusinessUsers(altData.results.users.businessUsers)
        }
      }
    } catch (err) {
      console.error("Failed to fetch business users:", err)
      // Try to get business users from debug endpoint as fallback
      try {
        const fallbackResponse = await fetch("/api/debug/find-business-user")
        const fallbackData = await fallbackResponse.json()
        if (fallbackData.success && fallbackData.results?.users?.businessUsers) {
          setBusinessUsers(fallbackData.results.users.businessUsers)
        }
      } catch (fallbackErr) {
        console.error("Fallback also failed:", fallbackErr)
      }
    }
  }

  const handleCreateRaffle = () => {
    router.push("/admin/raffles/create")
  }

  const handleEditRaffle = (id: string) => {
    router.push(`/admin/raffles/edit/${id}`)
  }

  const handleDeleteClick = (raffle: Raffle) => {
    setSelectedRaffle(raffle)
    setDeleteDialogOpen(true)
  }

  const handleViewUrls = (raffle: Raffle) => {
    setSelectedRaffle(raffle)
    setUrlsDialogOpen(true)
  }

  const handlePreviewClick = (raffle: Raffle) => {
    setSelectedRaffle(raffle)
    setPreviewDialogOpen(true)
  }

  const handlePreviewRaffle = (businessId?: string) => {
    if (!selectedRaffle) return

    // If no business ID provided, use the admin preview route
    if (!businessId || businessId === "preview") {
      const url = `/r/preview/${selectedRaffle._id}`
      window.open(url, "_blank")
      return
    }

    // Otherwise use the business-specific URL
    const url = `/r/${businessId}/${selectedRaffle._id}`
    window.open(url, "_blank")
  }

  const handleDeleteConfirm = async () => {
    if (!selectedRaffle) return

    try {
      setDeleteLoading(true)
      const response = await fetch(`/api/admin/raffles/${selectedRaffle._id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete raffle")
      }

      setRaffles(raffles.filter((raffle) => raffle._id !== selectedRaffle._id))
      setDeleteDialogOpen(false)
      setSelectedRaffle(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setDeleteLoading(false)
    }
  }

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedUrl(url)
      setTimeout(() => setCopiedUrl(null), 2000)
    } catch (err) {
      console.error("Failed to copy URL:", err)
    }
  }

  const generatePublicUrl = (businessId: string, raffleId: string) => {
    return `${window.location.origin}/r/${businessId}/${raffleId}`
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a")
    } catch (err) {
      return "Invalid date"
    }
  }

  const handleViewWinners = async (raffle: Raffle) => {
    setSelectedRaffle(raffle)
    setWinnersDialogOpen(true)

    try {
      const response = await fetch(`/api/admin/raffles/${raffle._id}/winners`)
      const data = await response.json()

      if (response.ok) {
        setRaffleWinners(data.winners || [])
        setRaffleEntries(data.entries || [])
      }
    } catch (err) {
      console.error("Failed to fetch winners:", err)
    }
  }

  const handleSelectWinner = async () => {
    if (!selectedRaffle) return

    try {
      setWinnerSelectionLoading(true)

      const response = await fetch(`/api/admin/raffles/${selectedRaffle._id}/winners`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selectionMethod,
          entryId: selectionMethod === "manual" ? selectedEntryId : undefined,
          prizeDescription,
          notes: winnerNotes,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Refresh winners list
        handleViewWinners(selectedRaffle)
        // Reset form
        setSelectedEntryId("")
        setPrizeDescription("")
        setWinnerNotes("")
      } else {
        setError(data.error || "Failed to select winner")
      }
    } catch (err) {
      setError("Failed to select winner")
    } finally {
      setWinnerSelectionLoading(false)
    }
  }

  const isRaffleEnded = (endDate: string) => {
    return new Date() > new Date(endDate)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg">Loading raffles...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
        <p>Error: {error}</p>
        <Button variant="outline" className="mt-2" onClick={() => fetchRaffles()}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Raffles</h1>
        <Button onClick={handleCreateRaffle}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Raffle
        </Button>
      </div>

      {raffles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium">No raffles found</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first raffle</p>
            <Button onClick={handleCreateRaffle}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Raffle
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {raffles.map((raffle) => (
            <Card key={raffle._id} className="overflow-hidden">
              <div className="relative h-48">
                <img
                  src={raffle.coverImage || "/placeholder.svg"}
                  alt={raffle.title}
                  className="w-full h-full object-cover"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                  onClick={() => handlePreviewClick(raffle)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
              </div>
              <CardHeader className="pb-2">
                <CardTitle>{raffle.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-500 line-clamp-2">{raffle.description}</p>

                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>
                    {formatDate(raffle.startDate)} - {formatDate(raffle.endDate)}
                  </span>
                </div>

                <div className="flex items-center text-sm text-blue-600">
                  <Users className="h-4 w-4 mr-1" />
                  <span>Available to {businessUsers.length} businesses</span>
                </div>

                <div className="flex flex-col space-y-2">
                  <div className="flex space-x-2">
                    <Button variant="outline" className="flex-1" onClick={() => handleEditRaffle(raffle._id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => handleViewUrls(raffle)}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View URLs
                    </Button>
                  </div>
                  <Button variant="destructive" className="w-full" onClick={() => handleDeleteClick(raffle)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
                {isRaffleEnded(raffle.endDate) && (
                  <Button variant="outline" className="w-full" onClick={() => handleViewWinners(raffle)}>
                    <Trophy className="h-4 w-4 mr-2" />
                    Manage Winners
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Raffle</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete &quot;{selectedRaffle?.title}&quot;? This action cannot be undone.</p>
          <p className="text-sm text-gray-500">This will also remove this raffle from all business accounts.</p>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleteLoading}>
              {deleteLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Public URLs Dialog */}
      <Dialog open={urlsDialogOpen} onOpenChange={setUrlsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Public Entry URLs for &quot;{selectedRaffle?.title}&quot;</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {businessUsers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No business users found.</p>
                <p className="text-sm text-gray-400">Business users need to be created before URLs can be generated.</p>
              </div>
            ) : (
              businessUsers.map((business) => {
                const url = generatePublicUrl(business._id, selectedRaffle?._id || "")
                return (
                  <div key={business._id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{business.businessName}</h4>
                      <span className="text-sm text-gray-500">{business.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 text-xs bg-gray-100 p-2 rounded break-all">{url}</code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(url)}
                        className={copiedUrl === url ? "bg-green-100 text-green-700" : ""}
                      >
                        {copiedUrl === url ? "Copied!" : <Copy className="h-4 w-4" />}
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setUrlsDialogOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Preview Raffle</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p>Choose how you want to preview this raffle:</p>

            <Button className="w-full" onClick={() => handlePreviewRaffle("preview")}>
              <Eye className="mr-2 h-4 w-4" />
              Preview with Default Business
            </Button>

            {businessUsers.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Or select a specific business view:</p>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {businessUsers.map((business) => (
                    <Button
                      key={business._id}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handlePreviewRaffle(business._id)}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      {business.businessName}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Winners Management Dialog */}
      <Dialog open={winnersDialogOpen} onOpenChange={setWinnersDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Winners Management - "{selectedRaffle?.title}"</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Existing Winners */}
            {raffleWinners.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                  Selected Winners ({raffleWinners.length})
                </h3>
                <div className="space-y-3">
                  {raffleWinners.map((winner, index) => (
                    <div key={winner._id} className="border rounded-lg p-4 bg-green-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{winner.winnerName}</h4>
                          <p className="text-sm text-gray-600">{winner.winnerEmail}</p>
                          {winner.winnerPhone && <p className="text-sm text-gray-600">Phone: {winner.winnerPhone}</p>}
                          <p className="text-xs text-gray-500 mt-1">
                            Ticket: {winner.ticketNumber} | Selected: {new Date(winner.selectedAt).toLocaleDateString()}{" "}
                            | Method: {winner.selectionMethod}
                          </p>
                          {winner.prizeDescription && (
                            <p className="text-sm text-blue-600 mt-1">Prize: {winner.prizeDescription}</p>
                          )}
                          {winner.notes && <p className="text-sm text-gray-600 mt-1">Notes: {winner.notes}</p>}
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Winner Selection Form */}
            {isRaffleEnded(selectedRaffle?.endDate || "") && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Users2 className="h-5 w-5 mr-2 text-blue-500" />
                  Select New Winner
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Selection Method</label>
                    <select
                      value={selectionMethod}
                      onChange={(e) => setSelectionMethod(e.target.value as "manual" | "random")}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="random">Random Selection</option>
                      <option value="manual">Manual Selection</option>
                    </select>
                  </div>

                  {selectionMethod === "manual" && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Select Entry</label>
                      <select
                        value={selectedEntryId}
                        onChange={(e) => setSelectedEntryId(e.target.value)}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">Choose an entry...</option>
                        {raffleEntries
                          .filter((entry) => !raffleWinners.some((winner) => winner.entryId === entry._id.toString()))
                          .map((entry) => (
                            <option key={entry._id} value={entry._id}>
                              {entry.firstName} {entry.lastName} - {entry.email}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Prize Description (Optional)</label>
                    <input
                      type="text"
                      value={prizeDescription}
                      onChange={(e) => setPrizeDescription(e.target.value)}
                      placeholder="e.g., iPhone 15 Pro, $500 Gift Card"
                      className="w-full p-2 border rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                    <input
                      type="text"
                      value={winnerNotes}
                      onChange={(e) => setWinnerNotes(e.target.value)}
                      placeholder="Any additional notes..."
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    Total Entries: {raffleEntries.length} | Available: {raffleEntries.length - raffleWinners.length}
                  </div>
                  <Button
                    onClick={handleSelectWinner}
                    disabled={winnerSelectionLoading || (selectionMethod === "manual" && !selectedEntryId)}
                  >
                    {winnerSelectionLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Selecting...
                      </>
                    ) : (
                      <>
                        <Trophy className="h-4 w-4 mr-2" />
                        Select Winner
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {!isRaffleEnded(selectedRaffle?.endDate || "") && (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Winner selection will be available after the raffle ends.</p>
                <p className="text-sm">
                  End Date: {selectedRaffle?.endDate ? new Date(selectedRaffle.endDate).toLocaleDateString() : "N/A"}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end mt-6">
            <Button variant="outline" onClick={() => setWinnersDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
