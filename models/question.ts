import type { ObjectId } from "mongodb"

/**
 * Question interface for onboarding questions
 */
export interface Question {
  _id?: ObjectId | string
  questionText: string
  fieldType: "text" | "multiple-choice" | "textarea" | "number" | "email"
  options?: string[]
  required: boolean
  isActive?: boolean
  order?: number
  dateCreated?: Date
}

/**
 * Onboarding response interface
 */
export interface OnboardingResponse {
  _id?: ObjectId | string
  userId: string
  questionId: string
  answer: string
  timestamp: Date
}

/**
 * Collection names for MongoDB
 */
export const QUESTIONS_COLLECTION = "onboardingQuestions"
export const RESPONSES_COLLECTION = "onboardingResponses"

/**
 * Helper function to validate a question object
 */
export function validateQuestion(question: Partial<Question>): string[] {
  const errors: string[] = []

  if (!question.questionText) errors.push("Question text is required")
  if (!question.fieldType) errors.push("Field type is required")

  const validFieldTypes = ["text", "multiple-choice", "textarea", "number", "email"]
  if (question.fieldType && !validFieldTypes.includes(question.fieldType)) {
    errors.push("Invalid field type")
  }

  if (question.fieldType === "multiple-choice" && (!question.options || question.options.length === 0)) {
    errors.push("Multiple choice questions must have options")
  }

  if (typeof question.required !== "boolean") {
    errors.push("Required field must be a boolean")
  }

  return errors
}
