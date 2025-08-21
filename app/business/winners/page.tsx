"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Trophy, Calendar, Mail, Phone, FileText, Award, Copy, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Winner {
  _id: string
  raffleId: string
  ticketNumber: string
  winnerName: string
  winnerEmail: string
  winnerPhone?: string
  selectedAt: string
  selectionMethod: "manual" | "random"
  prizeDescription?: string
  notes?: string
  raffleName: string
}

export default function BusinessWinnersPage() {
  const [winners, setWinners] = useState<Winner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedText, setCopiedText] = useState<string | null>(null)

  useEffect(() => {
    fetchWinners()
  }, [])

  const fetchWinners = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("🔍 Fetching winners...")
      const response = await fetch("/api/business/winners")
      const data = await response.json()

      console.log("📋 API Response:", { status: response.status, data })

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      setWinners(data.winners || [])
      console.log("✅ Winners loaded:", data.winners?.length || 0)
    } catch (err) {
      console.error("❌ Error fetching winners:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(`${type}-${text}`)
      setTimeout(() => setCopiedText(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a")
    } catch (err) {
      return "Invalid date"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading winners...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Trophy className="mr-3 h-7 w-7 text-yellow-500" />
              Winners
            </h1>
            <p className="text-gray-600 mt-1">Manage and contact your raffle winners</p>
          </div>
        </div>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-sm font-medium">!</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Error Loading Winners</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 border-red-300 text-red-700 hover:bg-red-100"
                  onClick={() => fetchWinners()}
                >
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Trophy className="mr-3 h-7 w-7 text-yellow-500" />
            Winners
          </h1>
          <p className="text-gray-600 mt-1">Manage and contact your raffle winners</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-yellow-600">{winners.length}</p>
          <p className="text-sm text-gray-500">Total Winners</p>
        </div>
      </div>

      {winners.length === 0 ? (
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="relative mb-6">
              <Trophy className="h-16 w-16 text-blue-300" />
              <Clock className="h-6 w-6 text-blue-500 absolute -bottom-1 -right-1 bg-white rounded-full p-1" />
            </div>
            <h3 className="text-xl font-semibold text-blue-900 mb-2">No Winners Yet</h3>
            <p className="text-blue-700 text-center max-w-md mb-4">
              Check back when the first winners are announced! Winners will be selected by the admin after your raffles
              end.
            </p>
            <div className="bg-blue-100 rounded-lg p-4 max-w-sm text-center">
              <p className="text-sm text-blue-800">
                <strong>How it works:</strong>
                <br />
                1. Your raffle ends
                <br />
                2. Admin selects winners
                <br />
                3. Winners appear here with contact details
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {winners.map((winner) => (
            <Card key={winner._id} className="overflow-hidden border-l-4 border-l-yellow-500">
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center text-lg">
                      <Award className="mr-2 h-5 w-5 text-yellow-600" />
                      {winner.winnerName}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{winner.raffleName}</p>
                  </div>
                  <div className="text-right">
                    <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                      {winner.ticketNumber}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 capitalize">{winner.selectionMethod} selection</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-4">
                {/* Contact Information */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm">{winner.winnerEmail}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(winner.winnerEmail, "email")}
                      className={copiedText === `email-${winner.winnerEmail}` ? "bg-green-100 text-green-700" : ""}
                    >
                      {copiedText === `email-${winner.winnerEmail}` ? "Copied!" : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>

                  {winner.winnerPhone && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm">{winner.winnerPhone}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(winner.winnerPhone!, "phone")}
                        className={copiedText === `phone-${winner.winnerPhone}` ? "bg-green-100 text-green-700" : ""}
                      >
                        {copiedText === `phone-${winner.winnerPhone}` ? "Copied!" : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  )}

                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm">Selected: {formatDate(winner.selectedAt)}</span>
                  </div>
                </div>

                {/* Prize Information */}
                {winner.prizeDescription && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 mb-1">Prize</h4>
                    <p className="text-sm text-blue-700">{winner.prizeDescription}</p>
                  </div>
                )}

                {/* Notes */}
                {winner.notes && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-start">
                      <FileText className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">Notes</h4>
                        <p className="text-sm text-gray-600">{winner.notes}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <a
                      href={`mailto:${winner.winnerEmail}?subject=Congratulations! You've won our raffle&body=Dear ${winner.winnerName},%0D%0A%0D%0ACongratulations! You have been selected as a winner in our raffle.%0D%0A%0D%0ATicket Number: ${winner.ticketNumber}%0D%0A${winner.prizeDescription ? `Prize: ${winner.prizeDescription}%0D%0A` : ""}%0D%0APlease reply to this email to claim your prize.%0D%0A%0D%0ABest regards`}
                    >
                      <Mail className="h-3 w-3 mr-1" />
                      Email Winner
                    </a>
                  </Button>

                  {winner.winnerPhone && (
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <a href={`tel:${winner.winnerPhone}`}>
                        <Phone className="h-3 w-3 mr-1" />
                        Call Winner
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
