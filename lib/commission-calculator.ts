// lib/commission-calculator.ts

// This file will contain the logic for calculating commissions.
// Since there is no existing code, we will start with a basic structure.

interface CommissionTier {
  threshold: number
  rate: number
}

interface CommissionCalculationParams {
  salesAmount: number
  commissionTiers: CommissionTier[]
}

function calculateCommission(params: CommissionCalculationParams): number {
  const { salesAmount, commissionTiers } = params

  let commission = 0

  for (const tier of commissionTiers) {
    if (salesAmount > tier.threshold) {
      commission += (salesAmount - tier.threshold) * tier.rate
    }
  }

  return commission
}

/**
 * OO wrapper around the functional `calculateCommission` helper.
 * You can extend this later with logging, DB-lookups, etc.
 */
export class CommissionCalculatorService {
  /**
   * Convenience method—delegates to `calculateCommission`
   */
  static calculate(salesAmount: number, commissionTiers: CommissionTier[]): number {
    return calculateCommission({ salesAmount, commissionTiers })
  }
}

export { calculateCommission, type CommissionTier, type CommissionCalculationParams }
