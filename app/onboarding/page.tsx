"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Question } from "@/models/question"

interface FormResponse {
  questionId: string
  answer: string
}

export default function OnboardingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [responses, setResponses] = useState<FormResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "loading") return

    if (!session?.user) {
      router.push("/auth/signin")
      return
    }

    if (session.user.role !== "rep") {
      router.push("/")
      return
    }

    // Check if onboarding is already completed
    // Note: This would need to be fetched from user data in a real implementation
    // For now, we'll assume it's not completed if they're on this page

    fetchQuestions()
  }, [session, status, router])

  const fetchQuestions = async () => {
    try {
      const response = await fetch("/api/onboarding/questions")
      if (!response.ok) throw new Error("Failed to fetch questions")

      const data = await response.json()
      setQuestions(data.questions)

      // Initialize responses array
      setResponses(
        data.questions.map((q: Question) => ({
          questionId: q._id as string,
          answer: "",
        })),
      )
    } catch (err) {
      setError("Failed to load onboarding questions")
      console.error("Error fetching questions:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (questionId: string, value: string) => {
    setResponses((prev) =>
      prev.map((response) => (response.questionId === questionId ? { ...response, answer: value } : response)),
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    // Validate required fields
    const requiredQuestions = questions.filter((q) => q.required)
    const missingResponses = requiredQuestions.filter((q) => {
      const response = responses.find((r) => r.questionId === q._id)
      return !response?.answer?.trim()
    })

    if (missingResponses.length > 0) {
      setError("Please fill in all required fields")
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch("/api/onboarding/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ responses }),
      })

      if (!response.ok) throw new Error("Failed to submit responses")

      // Redirect to home feed after successful submission
      router.push("/")
    } catch (err) {
      setError("Failed to submit onboarding. Please try again.")
      console.error("Error submitting onboarding:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderField = (question: Question) => {
    const response = responses.find((r) => r.questionId === question._id)
    const value = response?.answer || ""

    switch (question.fieldType) {
      case "text":
      case "email":
        return (
          <Input
            type={question.fieldType}
            value={value}
            onChange={(e) => handleInputChange(question._id as string, e.target.value)}
            required={question.required}
            placeholder={`Enter ${question.fieldType === "email" ? "email" : "text"}`}
          />
        )

      case "number":
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleInputChange(question._id as string, e.target.value)}
            required={question.required}
            placeholder="Enter number"
          />
        )

      case "textarea":
        return (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(question._id as string, e.target.value)}
            required={question.required}
            placeholder="Enter your response"
            rows={4}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        )

      case "multiple-choice":
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(question._id as string, e.target.value)}
            required={question.required}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select an option</option>
            {question.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        )

      default:
        return <Input value={value} onChange={(e) => handleInputChange(question._id as string, e.target.value)} />
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Onboarding</CardTitle>
            <CardDescription>Please fill out the following information to complete your account setup.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {questions.map((question) => (
                <div key={question._id as string}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {question.questionText}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {renderField(question)}
                </div>
              ))}

              {error && <div className="text-red-600 text-sm">{error}</div>}

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Submitting..." : "Complete Onboarding"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
