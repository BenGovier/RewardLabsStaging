# Current Raffle System Analysis

## Existing Database Schema
\`\`\`typescript
// Current Raffle Model (from models/raffle.ts)
interface Raffle {
  _id: ObjectId | string
  title: string
  description: string
  startDate: Date
  endDate: Date
  // ... other fields
  // MISSING: status, isActive, lifecycle fields
}
\`\`\`

## Current Issues Identified:
1. **No Status Field**: Raffles don't have explicit status tracking
2. **Manual Management**: All status changes are manual
3. **No Automation**: No scheduled tasks for lifecycle events
4. **Inconsistent State**: Active raffles past end date still show as active
5. **Winner Selection**: Manual process, no automation

## Dependencies to Consider:
- BusinessRaffle entries reference raffle IDs
- Entry submissions depend on raffle status
- Public raffle pages need accurate status
- Admin dashboard shows raffle statistics
- Winner selection depends on raffle completion
