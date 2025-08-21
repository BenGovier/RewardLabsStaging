export interface LeadRecord {
  id: string
  firstName: string
  lastName: string
  email: string
  status: string
  createdAt: string
}

/**
 * Temporary placeholder data so the build passes.
 * Real data is fetched from the database via /api/leads.
 */
export const leads: LeadRecord[] = []
