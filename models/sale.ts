import type { ObjectId } from "mongodb"

/**
 * Sale interface for sales tracking
 */
export interface Sale {
  _id?: ObjectId | string
  repId: string
  customerId: string
  amount: number
  dateOfSale: Date
  productDescription: string
  commissionEarned?: number
  createdAt: Date
}

/**
 * Sale with populated rep and customer info (for API responses)
 */
export interface SaleWithDetails extends Sale {
  rep?: {
    _id: string
    firstName: string
    lastName: string
  }
  customer?: {
    _id: string
    name: string
    email: string
  }
}

/**
 * Sales summary interface for admin dashboard
 */
export interface SalesSummary {
  repId: string
  repName: string
  totalSales: number
  totalAmount: number
  totalCommission: number
  averageSale: number
}

/**
 * Collection name for MongoDB
 */
export const SALES_COLLECTION = "sales"

/**
 * Helper function to validate a sale object
 */
export function validateSale(sale: Partial<Sale>): string[] {
  const errors: string[] = []

  if (!sale.repId) errors.push("Rep ID is required")
  if (!sale.customerId) errors.push("Customer ID is required")
  if (!sale.amount || sale.amount <= 0) errors.push("Amount must be greater than 0")
  if (!sale.dateOfSale) errors.push("Date of sale is required")
  if (!sale.productDescription || sale.productDescription.trim().length === 0) {
    errors.push("Product description is required")
  }
  if (sale.commissionEarned !== undefined && sale.commissionEarned < 0) {
    errors.push("Commission earned cannot be negative")
  }

  return errors
}
