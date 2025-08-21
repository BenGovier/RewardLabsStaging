# RaffilyRepPortal - Complete Developer Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Authentication & Authorization](#authentication--authorization)
6. [Business Logic](#business-logic)
7. [Frontend Components](#frontend-components)
8. [Integrations](#integrations)
9. [Deployment](#deployment)
10. [Development Workflow](#development-workflow)
11. [Troubleshooting](#troubleshooting)

## Project Overview

RaffilyRepPortal is a comprehensive B2B SaaS platform that enables businesses to run promotional raffles while providing sales representatives with tools to track referrals, manage leads, and earn commissions. The platform serves three main user types:

- **Admin Users**: Platform administrators who manage raffles, users, and system-wide settings
- **Business Users**: Companies that run raffles and manage their customer entries
- **Sales Representatives**: Individuals who refer businesses and earn commissions

### Key Features
- Multi-tenant raffle management system
- Lead generation and CRM functionality
- Commission tracking and payment system
- Real-time analytics and reporting
- Email marketing integration
- Stripe payment processing
- Referral tracking system
- Custom branding and white-labeling

## Architecture

### Technology Stack
- **Frontend**: Next.js 14 with App Router, React 18, TypeScript
- **Backend**: Next.js API Routes (serverless functions)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js with custom providers
- **Payments**: Stripe integration
- **Email**: SendGrid SMTP
- **File Storage**: Vercel Blob Storage
- **Deployment**: Vercel (primary), Azure (secondary)

### Project Structure
\`\`\`
├── app/                          # Next.js App Router pages
│   ├── admin/                    # Admin dashboard pages
│   ├── api/                      # API route handlers
│   ├── auth/                     # Authentication pages
│   ├── business/                 # Business dashboard pages
│   ├── leads/                    # Lead management pages
│   ├── r/                        # Public raffle entry pages
│   └── signup/                   # Registration pages
├── components/                   # Reusable React components
│   ├── ui/                       # shadcn/ui components
│   └── [feature-components]      # Feature-specific components
├── lib/                          # Utility libraries
├── models/                       # Database models
├── public/                       # Static assets
├── scripts/                      # Database scripts and utilities
└── docs/                         # Documentation
\`\`\`

## Database Schema

### Core Collections

#### Users Collection
\`\`\`typescript
interface User {
  _id: ObjectId
  email: string
  password?: string              // Hashed password (optional for OAuth users)
  firstName: string
  lastName: string
  role: 'admin' | 'business' | 'rep'
  businessName?: string          // For business users
  dateCreated: Date
  lastLogin?: Date
  isActive: boolean
  
  // Stripe integration
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  stripeSubscriptionStatus?: string
  
  // Referral tracking
  createdByRepId?: string        // Which rep referred this user
  referralCode?: string          // Unique referral code for reps
  
  // Profile information
  profilePicture?: string
  phone?: string
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}
\`\`\`

#### Raffles Collection
\`\`\`typescript
interface Raffle {
  _id: ObjectId
  title: string
  description: string
  startDate: Date
  endDate: Date
  isActive: boolean
  
  // Prize information
  prizeTitle: string
  prizeDescription: string
  prizeValue: number
  prizeImage?: string
  
  // Entry requirements
  maxEntries?: number
  minAge?: number
  allowedCountries?: string[]
  
  // Terms and conditions
  termsAndConditions: string
  privacyPolicy: string
  
  // Admin settings
  createdBy: ObjectId           // Admin who created the raffle
  createdAt: Date
  updatedAt: Date
  
  // Winner information
  winnerId?: ObjectId
  winnerSelectedAt?: Date
  winnerNotified?: boolean
}
\`\`\`

#### Business Raffles Collection
\`\`\`typescript
interface BusinessRaffle {
  _id: ObjectId
  businessId: ObjectId          // Reference to User with role 'business'
  raffleId: ObjectId            // Reference to Raffle
  isActive: boolean
  
  // Business customizations
  businessCustomizations?: {
    customBranding?: {
      logo?: string
      primaryColor?: string
      secondaryColor?: string
      fontFamily?: string
    }
    customQuestions?: Array<{
      id: string
      question: string
      type: 'text' | 'email' | 'phone' | 'select' | 'checkbox'
      required: boolean
      options?: string[]          // For select type questions
    }>
    customTerms?: string
    customPrivacyPolicy?: string
    thankYouMessage?: string
    socialMediaLinks?: {
      facebook?: string
      twitter?: string
      instagram?: string
      linkedin?: string
    }
  }
  
  // Analytics
  totalEntries?: number
  uniqueEntries?: number
  conversionRate?: number
  
  createdAt: Date
  updatedAt: Date
}
\`\`\`

#### Entries Collection
\`\`\`typescript
interface Entry {
  _id: ObjectId
  businessId: ObjectId          // Which business this entry is for
  raffleId: ObjectId            // Which raffle this entry is for
  
  // Participant information
  firstName: string
  lastName: string
  email: string
  phone?: string
  dateOfBirth?: Date
  
  // Custom question answers
  answers: Record<string, any>   // Key-value pairs for custom questions
  
  // Entry metadata
  ipAddress: string
  userAgent: string
  referralSource?: string
  utmParameters?: {
    source?: string
    medium?: string
    campaign?: string
    term?: string
    content?: string
  }
  
  // Consent and legal
  marketingConsent: boolean
  termsAccepted: boolean
  privacyPolicyAccepted: boolean
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
  
  // Verification
  emailVerified?: boolean
  phoneVerified?: boolean
}
\`\`\`

#### Leads Collection
\`\`\`typescript
interface Lead {
  _id: ObjectId
  
  // Contact information
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  jobTitle?: string
  
  // Lead source and attribution
  source: 'website' | 'referral' | 'import' | 'manual' | 'raffle_entry'
  assignedToRepId?: ObjectId     // Which rep owns this lead
  referredByRepId?: ObjectId     // Which rep referred this lead
  
  // Lead status and pipeline
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  priority: 'low' | 'medium' | 'high'
  estimatedValue?: number
  expectedCloseDate?: Date
  
  // Communication history
  lastContactDate?: Date
  nextFollowUpDate?: Date
  notes?: string
  
  // Custom fields
  customFields?: Record<string, any>
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
  
  // Tags and categorization
  tags?: string[]
  industry?: string
  companySize?: string
}
\`\`\`

#### Lead Activities Collection
\`\`\`typescript
interface LeadActivity {
  _id: ObjectId
  leadId: ObjectId
  userId: ObjectId               // Who performed the activity
  
  // Activity details
  type: 'call' | 'email' | 'meeting' | 'note' | 'task' | 'status_change'
  subject: string
  description?: string
  
  // Activity metadata
  duration?: number              // In minutes
  outcome?: 'positive' | 'neutral' | 'negative'
  nextAction?: string
  
  // Scheduling
  scheduledAt?: Date
  completedAt?: Date
  
  // File attachments
  attachments?: Array<{
    filename: string
    url: string
    type: string
    size: number
  }>
  
  createdAt: Date
}
\`\`\`

#### Referral Links Collection
\`\`\`typescript
interface ReferralLink {
  _id: ObjectId
  repId: ObjectId                // Which rep owns this link
  slug: string                   // Unique identifier for the link
  
  // Link configuration
  targetUrl: string              // Where the link redirects to
  title: string
  description?: string
  
  // Tracking
  clickCount: number
  conversionCount: number
  lastClickedAt?: Date
  
  // Status
  isActive: boolean
  expiresAt?: Date
  
  createdAt: Date
  updatedAt: Date
}
\`\`\`

#### Referral Clicks Collection
\`\`\`typescript
interface ReferralClick {
  _id: ObjectId
  referralSlug: string           // Which referral link was clicked
  repId: ObjectId                // Which rep gets credit
  
  // Click metadata
  ipAddress: string
  userAgent: string
  referrer?: string
  
  // Geographic data
  country?: string
  city?: string
  
  // Conversion tracking
  converted: boolean
  conversionValue?: number
  conversionDate?: Date
  
  timestamp: Date
}
\`\`\`

#### Winners Collection
\`\`\`typescript
interface Winner {
  _id: ObjectId
  raffleId: ObjectId
  businessId: ObjectId
  entryId: ObjectId              // The winning entry
  
  // Winner information (denormalized for performance)
  winnerEmail: string
  winnerFirstName: string
  winnerLastName: string
  
  // Selection metadata
  selectedAt: Date
  selectedBy: ObjectId           // Admin who selected the winner
  selectionMethod: 'random' | 'manual'
  
  // Notification status
  notified: boolean
  notificationSentAt?: Date
  notificationMethod?: 'email' | 'phone' | 'mail'
  
  // Prize claim status
  prizeClaimed: boolean
  prizeClaimedAt?: Date
  prizeDeliveryStatus?: 'pending' | 'shipped' | 'delivered' | 'failed'
  trackingNumber?: string
  
  // Verification
  identityVerified: boolean
  verificationDocuments?: string[]
  
  createdAt: Date
  updatedAt: Date
}
\`\`\`

#### Business Signups Collection
\`\`\`typescript
interface BusinessSignup {
  _id: ObjectId
  
  // Business information
  email: string
  businessName: string
  contactName: string
  phone?: string
  
  // Signup process
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded'
  stripeSessionId?: string
  stripeCustomerId?: string
  
  // Attribution
  createdByRepId?: ObjectId      // Which rep gets commission
  referralSource?: string
  
  // Completion status
  completedAt?: Date
  userId?: ObjectId              // Created user ID after completion
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
}
\`\`\`

#### Stripe Subscriptions Collection
\`\`\`typescript
interface StripeSubscription {
  _id: ObjectId
  userId: ObjectId
  stripeSubscriptionId: string
  stripeCustomerId: string
  
  // Subscription details
  status: string
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  
  // Plan information
  planId: string
  planName: string
  amount: number
  currency: string
  interval: 'month' | 'year'
  
  // Billing
  lastPaymentDate?: Date
  nextPaymentDate?: Date
  paymentMethod?: string
  
  // Lifecycle
  createdAt: Date
  updatedAt: Date
  canceledAt?: Date
  endedAt?: Date
}
\`\`\`

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/signin
Sign in a user with email and password.

**Request Body:**
\`\`\`json
{
  "email": "user@example.com",
  "password": "password123"
}
\`\`\`

**Response:**
\`\`\`json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "business",
    "firstName": "John",
    "lastName": "Doe"
  },
  "token": "jwt_token"
}
\`\`\`

#### POST /api/auth/forgot-password
Request a password reset email.

**Request Body:**
\`\`\`json
{
  "email": "user@example.com"
}
\`\`\`

#### POST /api/auth/reset-password
Reset password using a token.

**Request Body:**
\`\`\`json
{
  "token": "reset_token",
  "password": "new_password"
}
\`\`\`

### User Management Endpoints

#### GET /api/users
Get all users (admin only).

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)
- `role`: Filter by user role
- `search`: Search by name or email

#### GET /api/users/me
Get current user profile.

#### PUT /api/users/[id]
Update user profile.

#### POST /api/users/[id]/upload-picture
Upload user profile picture.

### Raffle Management Endpoints

#### GET /api/admin/raffles
Get all raffles (admin only).

#### POST /api/admin/raffles
Create a new raffle (admin only).

**Request Body:**
\`\`\`json
{
  "title": "Summer Giveaway 2024",
  "description": "Win amazing prizes this summer!",
  "startDate": "2024-07-01T00:00:00Z",
  "endDate": "2024-07-31T23:59:59Z",
  "prizeTitle": "MacBook Pro",
  "prizeDescription": "Latest MacBook Pro 16-inch",
  "prizeValue": 2499,
  "termsAndConditions": "Terms text...",
  "privacyPolicy": "Privacy policy text..."
}
\`\`\`

#### GET /api/admin/raffles/[id]
Get specific raffle details.

#### PUT /api/admin/raffles/[id]
Update raffle details.

#### DELETE /api/admin/raffles/[id]
Delete a raffle.

#### POST /api/admin/raffles/[id]/winners
Select winner for a raffle.

### Business Endpoints

#### GET /api/business/raffles
Get raffles assigned to the current business.

#### GET /api/business/raffles/[raffleId]/customize
Get customization settings for a raffle.

#### PUT /api/business/raffles/[raffleId]/customize
Update customization settings.

**Request Body:**
\`\`\`json
{
  "customBranding": {
    "logo": "logo_url",
    "primaryColor": "#007bff",
    "secondaryColor": "#6c757d"
  },
  "customQuestions": [
    {
      "id": "q1",
      "question": "What's your favorite product?",
      "type": "text",
      "required": true
    }
  ],
  "thankYouMessage": "Thank you for entering!"
}
\`\`\`

#### GET /api/business/entries
Get entries for the current business.

**Query Parameters:**
- `raffleId`: Filter by raffle ID
- `page`: Page number
- `limit`: Items per page
- `search`: Search entries
- `sortBy`: Sort field
- `sortOrder`: Sort direction (asc/desc)

#### GET /api/business/entries/stats
Get entry statistics.

#### GET /api/business/entries/export
Export entries as CSV.

#### GET /api/business/winners
Get winners for business raffles.

### Entry Management Endpoints

#### POST /api/entries
Submit a new raffle entry.

**Request Body:**
\`\`\`json
{
  "businessId": "business_id",
  "raffleId": "raffle_id",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "answers": {
    "q1": "Product A"
  },
  "marketingConsent": true,
  "termsAccepted": true,
  "privacyPolicyAccepted": true
}
\`\`\`

### Lead Management Endpoints

#### GET /api/leads
Get leads for the current user.

**Query Parameters:**
- `status`: Filter by lead status
- `assignedTo`: Filter by assigned rep
- `source`: Filter by lead source
- `page`: Page number
- `limit`: Items per page

#### POST /api/leads
Create a new lead.

**Request Body:**
\`\`\`json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@company.com",
  "phone": "+1234567890",
  "company": "Acme Corp",
  "jobTitle": "Marketing Manager",
  "source": "website",
  "status": "new",
  "priority": "medium"
}
\`\`\`

#### GET /api/leads/[id]
Get specific lead details.

#### PUT /api/leads/[id]
Update lead information.

#### DELETE /api/leads/[id]
Delete a lead.

#### GET /api/leads/[id]/activities
Get activities for a specific lead.

#### POST /api/leads/[id]/activities
Add activity to a lead.

**Request Body:**
\`\`\`json
{
  "type": "call",
  "subject": "Follow-up call",
  "description": "Discussed pricing options",
  "duration": 30,
  "outcome": "positive",
  "nextAction": "Send proposal"
}
\`\`\`

### Referral Tracking Endpoints

#### GET /api/referrals/links
Get referral links for the current rep.

#### POST /api/referrals/links
Create a new referral link.

**Request Body:**
\`\`\`json
{
  "title": "Summer Promotion",
  "description": "Special summer offer",
  "targetUrl": "https://example.com/signup"
}
\`\`\`

#### GET /api/referrals/links/[id]
Get specific referral link details.

#### PUT /api/referrals/links/[id]
Update referral link.

#### POST /api/referrals/track
Track a referral click.

**Request Body:**
\`\`\`json
{
  "slug": "referral_slug",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "referrer": "https://google.com"
}
\`\`\`

### Payment Endpoints

#### POST /api/stripe/checkout
Create Stripe checkout session.

**Request Body:**
\`\`\`json
{
  "priceId": "price_1234567890",
  "businessName": "Acme Corp",
  "email": "contact@acme.com",
  "referredBy": "rep_id"
}
\`\`\`

#### POST /api/stripe/webhooks
Handle Stripe webhook events.

### Commission Endpoints

#### GET /api/admin/commissions
Get commission data (admin only).

**Query Parameters:**
- `repId`: Filter by rep ID
- `startDate`: Start date filter
- `endDate`: End date filter
- `status`: Commission status

### Analytics Endpoints

#### GET /api/admin/dashboard
Get admin dashboard data.

#### GET /api/admin/referral-performance
Get referral performance metrics.

#### GET /api/business/dashboard
Get business dashboard data.

## Authentication & Authorization

### NextAuth.js Configuration

The application uses NextAuth.js for authentication with custom providers and session management.

#### Providers
- **Credentials Provider**: Email/password authentication
- **Magic Link Provider**: Passwordless email authentication (planned)

#### Session Strategy
- **JWT Strategy**: Stateless authentication using JSON Web Tokens
- **Session Duration**: 30 days
- **Refresh Token**: Automatic token refresh

#### Authorization Middleware

\`\`\`typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.nextauth.token
  const { pathname } = request.nextUrl

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!token || token.role !== 'admin') {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
  }

  // Protect business routes
  if (pathname.startsWith('/business')) {
    if (!token || token.role !== 'business') {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
  }

  // Protect rep routes
  if (pathname.startsWith('/leads') || pathname.startsWith('/sales')) {
    if (!token || token.role !== 'rep') {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
  }
}
\`\`\`

### Role-Based Access Control (RBAC)

#### Admin Role
- Full system access
- User management
- Raffle creation and management
- System configuration
- Analytics and reporting
- Commission management

#### Business Role
- Business dashboard access
- Raffle customization
- Entry management
- Winner selection (for own raffles)
- Analytics for own data
- Subscription management

#### Rep Role
- Lead management
- Referral tracking
- Commission viewing
- Sales tools access
- Performance analytics

## Business Logic

### Raffle Lifecycle Management

#### 1. Raffle Creation
\`\`\`typescript
// lib/raffle-lifecycle.ts
export async function createRaffle(raffleData: CreateRaffleInput): Promise<Raffle> {
  // Validate raffle data
  const validation = validateRaffleData(raffleData)
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '))
  }

  // Create raffle in database
  const raffle = await createRaffleInDB(raffleData)

  // Assign to all active businesses
  await assignRaffleToBusinesses(raffle._id)

  // Schedule lifecycle events
  await scheduleRaffleEvents(raffle)

  return raffle
}
\`\`\`

#### 2. Entry Processing
\`\`\`typescript
export async function processEntry(entryData: EntryInput): Promise<Entry> {
  // Validate entry data
  await validateEntry(entryData)

  // Check for duplicates
  const existingEntry = await checkDuplicateEntry(entryData)
  if (existingEntry) {
    throw new Error('Duplicate entry detected')
  }

  // Create entry
  const entry = await createEntry(entryData)

  // Update statistics
  await updateEntryStatistics(entryData.businessId, entryData.raffleId)

  // Send confirmation email
  await sendEntryConfirmation(entry)

  return entry
}
\`\`\`

#### 3. Winner Selection
\`\`\`typescript
export async function selectWinner(raffleId: string, method: 'random' | 'manual', winnerId?: string): Promise<Winner> {
  const raffle = await getRaffle(raffleId)
  
  if (raffle.winnerId) {
    throw new Error('Winner already selected for this raffle')
  }

  let selectedEntry: Entry

  if (method === 'random') {
    selectedEntry = await selectRandomWinner(raffleId)
  } else {
    if (!winnerId) {
      throw new Error('Winner ID required for manual selection')
    }
    selectedEntry = await getEntry(winnerId)
  }

  // Create winner record
  const winner = await createWinner({
    raffleId,
    businessId: selectedEntry.businessId,
    entryId: selectedEntry._id,
    winnerEmail: selectedEntry.email,
    winnerFirstName: selectedEntry.firstName,
    winnerLastName: selectedEntry.lastName,
    selectionMethod: method
  })

  // Update raffle with winner
  await updateRaffle(raffleId, { winnerId: selectedEntry._id })

  // Send winner notification
  await sendWinnerNotification(winner)

  return winner
}
\`\`\`

### Commission Calculation

\`\`\`typescript
// lib/commission-calculator.ts
export interface CommissionRule {
  type: 'percentage' | 'fixed'
  value: number
  tier?: string
  minimumAmount?: number
  maximumAmount?: number
}

export function calculateCommission(
  saleAmount: number,
  repId: string,
  rules: CommissionRule[]
): number {
  // Get applicable rule based on rep tier and sale amount
  const applicableRule = getApplicableRule(saleAmount, repId, rules)
  
  if (!applicableRule) {
    return 0
  }

  let commission = 0

  if (applicableRule.type === 'percentage') {
    commission = saleAmount * (applicableRule.value / 100)
  } else {
    commission = applicableRule.value
  }

  // Apply minimum and maximum limits
  if (applicableRule.minimumAmount) {
    commission = Math.max(commission, applicableRule.minimumAmount)
  }

  if (applicableRule.maximumAmount) {
    commission = Math.min(commission, applicableRule.maximumAmount)
  }

  return commission
}
\`\`\`

### Email System

\`\`\`typescript
// lib/email.ts
export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })
  }

  async sendEmail(to: string, template: EmailTemplate, variables: Record<string, any>) {
    const subject = this.replaceVariables(template.subject, variables)
    const html = this.replaceVariables(template.html, variables)
    const text = this.replaceVariables(template.text, variables)

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
      text
    })
  }

  private replaceVariables(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] || match
    })
  }
}

// Email templates
export const EMAIL_TEMPLATES = {
  ENTRY_CONFIRMATION: {
    subject: 'Entry Confirmation - {{raffleName}}',
    html: `
      <h1>Thank you for entering {{raffleName}}!</h1>
      <p>Hi {{firstName}},</p>
      <p>Your entry has been confirmed. Good luck!</p>
      <p>Entry Details:</p>
      <ul>
        <li>Raffle: {{raffleName}}</li>
        <li>Entry Date: {{entryDate}}</li>
        <li>Entry ID: {{entryId}}</li>
      </ul>
    `,
    text: 'Thank you for entering {{raffleName}}! Your entry has been confirmed.'
  },
  
  WINNER_NOTIFICATION: {
    subject: 'Congratulations! You won {{raffleName}}',
    html: `
      <h1>🎉 Congratulations {{firstName}}!</h1>
      <p>You are the winner of {{raffleName}}!</p>
      <p>Prize: {{prizeTitle}}</p>
      <p>We will contact you shortly with details on how to claim your prize.</p>
    `,
    text: 'Congratulations! You won {{raffleName}}. Prize: {{prizeTitle}}'
  }
}
\`\`\`

## Frontend Components

### Component Architecture

The frontend follows a component-based architecture with reusable UI components and feature-specific components.

#### UI Components (shadcn/ui)
- `Button`: Customizable button component
- `Input`: Form input component
- `Card`: Container component
- `Table`: Data table component
- `Dialog`: Modal dialog component
- `DropdownMenu`: Dropdown menu component
- `Alert`: Alert/notification component

#### Feature Components

##### Business Dashboard Components
\`\`\`typescript
// components/business-dashboard.tsx
export function BusinessDashboard() {
  const { data: stats } = useBusinessStats()
  const { data: recentEntries } = useRecentEntries()

  return (
    <div className="space-y-6">
      <StatsCards stats={stats} />
      <EntriesChart data={stats?.entriesByDate} />
      <RecentEntriesTable entries={recentEntries} />
    </div>
  )
}

// components/stats-cards.tsx
export function StatsCards({ stats }: { stats: BusinessStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Total Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalEntries}</div>
        </CardContent>
      </Card>
      {/* More stat cards */}
    </div>
  )
}
\`\`\`

##### Lead Management Components
\`\`\`typescript
// components/lead-table.tsx
export function LeadTable() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, limit: 50 })

  const columns: ColumnDef<Lead>[] = [
    {
      accessorKey: "firstName",
      header: "Name",
      cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}`
    },
    {
      accessorKey: "email",
      header: "Email"
    },
    {
      accessorKey: "company",
      header: "Company"
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={getStatusVariant(row.original.status)}>
          {row.original.status}
        </Badge>
      )
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => editLead(row.original)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => deleteLead(row.original.id)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ]

  return (
    <DataTable
      columns={columns}
      data={leads}
      loading={loading}
      pagination={pagination}
      onPaginationChange={setPagination}
    />
  )
}
\`\`\`

##### Public Raffle Entry Form
\`\`\`typescript
// components/raffle-entry-form.tsx
export function RaffleEntryForm({ raffle, businessCustomization }: RaffleEntryFormProps) {
  const [formData, setFormData] = useState<EntryFormData>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await submitEntry({
        ...formData,
        raffleId: raffle.id,
        businessId: raffle.businessId
      })
      
      // Show success message
      toast.success('Entry submitted successfully!')
    } catch (error) {
      toast.error('Failed to submit entry')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{raffle.title}</CardTitle>
        <CardDescription>{raffle.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                required
                value={formData.firstName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                required
                value={formData.lastName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>

          {/* Custom questions */}
          {businessCustomization?.customQuestions?.map((question) => (
            <CustomQuestionField
              key={question.id}
              question={question}
              value={formData.answers?.[question.id]}
              onChange={(value) => setFormData(prev => ({
                ...prev,
                answers: { ...prev.answers, [question.id]: value }
              }))}
            />
          ))}

          {/* Consent checkboxes */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="termsAccepted"
                required
                checked={formData.termsAccepted || false}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, termsAccepted: checked }))}
              />
              <Label htmlFor="termsAccepted">I accept the terms and conditions</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="marketingConsent"
                checked={formData.marketingConsent || false}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, marketingConsent: checked }))}
              />
              <Label htmlFor="marketingConsent">I consent to marketing communications</Label>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Enter Raffle'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
\`\`\`

### State Management

The application uses React's built-in state management with custom hooks for data fetching and state synchronization.

#### Custom Hooks
\`\`\`typescript
// hooks/use-business-stats.ts
export function useBusinessStats() {
  return useSWR('/api/business/entries/stats', fetcher)
}

// hooks/use-leads.ts
export function useLeads(filters: LeadFilters) {
  const queryString = new URLSearchParams(filters).toString()
  return useSWR(`/api/leads?${queryString}`, fetcher)
}

// hooks/use-referral-links.ts
export function useReferralLinks() {
  return useSWR('/api/referrals/links', fetcher)
}
\`\`\`

## Integrations

### Stripe Integration

#### Setup
\`\`\`typescript
// lib/stripe.ts
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

export const STRIPE_PLANS = {
  STARTER: {
    priceId: 'price_starter',
    name: 'Starter Plan',
    price: 29,
    features: ['Up to 1,000 entries', 'Basic analytics', 'Email support']
  },
  PROFESSIONAL: {
    priceId: 'price_professional',
    name: 'Professional Plan',
    price: 99,
    features: ['Up to 10,000 entries', 'Advanced analytics', 'Priority support', 'Custom branding']
  },
  ENTERPRISE: {
    priceId: 'price_enterprise',
    name: 'Enterprise Plan',
    price: 299,
    features: ['Unlimited entries', 'White-label solution', 'Dedicated support', 'API access']
  }
}
\`\`\`

#### Webhook Handling
\`\`\`typescript
// app/api/stripe/webhooks/route.ts
export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
      break
    
    case 'customer.subscription.created':
      await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
      break
    
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
      break
    
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
      break
    
    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
      break
    
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object as Stripe.Invoice)
      break
  }

  return NextResponse.json({ received: true })
}
\`\`\`

### SendGrid Email Integration

\`\`\`typescript
// lib/sendgrid.ts
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export async function sendTransactionalEmail(
  to: string,
  templateId: string,
  dynamicTemplateData: Record<string, any>
) {
  const msg = {
    to,
    from: process.env.SMTP_FROM!,
    templateId,
    dynamicTemplateData
  }

  await sgMail.send(msg)
}

// Email templates
export const SENDGRID_TEMPLATES = {
  ENTRY_CONFIRMATION: 'd-1234567890abcdef',
  WINNER_NOTIFICATION: 'd-abcdef1234567890',
  PASSWORD_RESET: 'd-fedcba0987654321',
  WELCOME_EMAIL: 'd-123456789abcdef0'
}
\`\`\`

### Vercel Blob Storage

\`\`\`typescript
// lib/blob-storage.ts
import { put, del, list } from '@vercel/blob'

export async function uploadFile(file: File, filename: string): Promise<string> {
  const blob = await put(filename, file, {
    access: 'public'
  })
  
  return blob.url
}

export async function deleteFile(url: string): Promise<void> {
  await del(url)
}

export async function listFiles(prefix?: string) {
  const { blobs } = await list({ prefix })
  return blobs
}
\`\`\`

## Deployment

### Environment Variables

#### Required Environment Variables
\`\`\`bash
# Database
MONGODB_URI=mongodb://localhost:27017/raffilyrepportal
MONGODB_DB=raffilyRepPortalDB

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.com

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM=noreply@yourdomain.com

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# File Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_token

# Setup
SETUP_KEY=your-setup-key
\`\`\`

### Vercel Deployment

#### vercel.json Configuration
\`\`\`json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "rewrites": [
    {
      "source": "/r/:businessId/:raffleId",
      "destination": "/r/:businessId/:raffleId"
    }
  ]
}
\`\`\`

#### Build Configuration
\`\`\`json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "dev": "next dev",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
\`\`\`

### Azure Deployment

#### Azure App Service Configuration
\`\`\`yaml
# azure-pipelines.yml
trigger:
- main

pool:
  vmImage: 'ubuntu-latest'

steps:
- task: NodeTool@0
  inputs:
    versionSpec: '18.x'
  displayName: 'Install Node.js'

- script: |
    npm install
    npm run build
  displayName: 'Install dependencies and build'

- task: AzureWebApp@1
  inputs:
    azureSubscription: 'your-subscription'
    appType: 'webAppLinux'
    appName: 'your-app-name'
    package: '.'
\`\`\`

### Database Migration Scripts

\`\`\`javascript
// scripts/migrate-database.js
const { MongoClient } = require('mongodb')

async function migrateDatabase() {
  const client = new MongoClient(process.env.MONGODB_URI)
  await client.connect()
  
  const db = client.db(process.env.MONGODB_DB)
  
  // Add indexes
  await db.collection('users').createIndex({ email: 1 }, { unique: true })
  await db.collection('entries').createIndex({ businessId: 1, raffleId: 1 })
  await db.collection('leads').createIndex({ assignedToRepId: 1 })
  await db.collection('referralClicks').createIndex({ referralSlug: 1 })
  
  // Add any data migrations here
  
  await client.close()
  console.log('Database migration completed')
}

migrateDatabase().catch(console.error)
\`\`\`

## Development Workflow

### Local Development Setup

1. **Clone the repository**
\`\`\`bash
git clone https://github.com/your-org/raffily-rep-portal.git
cd raffily-rep-portal
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
# or
bun install
\`\`\`

3. **Set up environment variables**
\`\`\`bash
cp .env.example .env.local
# Edit .env.local with your configuration
\`\`\`

4. **Start MongoDB locally**
\`\`\`bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or install MongoDB locally
\`\`\`

5. **Run database setup**
\`\`\`bash
npm run db:setup
\`\`\`

6. **Start development server**
\`\`\`bash
npm run dev
\`\`\`

### Code Quality Tools

#### ESLint Configuration
\`\`\`json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error"
  }
}
\`\`\`

#### Prettier Configuration
\`\`\`json
{
  "semi": false,
  "trailingComma": "es5",
  "singleQuote": true,
  "tabWidth": 2,
  "printWidth": 120
}
\`\`\`

### Testing Strategy

#### Unit Tests
\`\`\`typescript
// __tests__/lib/commission-calculator.test.ts
import { calculateCommission } from '@/lib/commission-calculator'

describe('Commission Calculator', () => {
  it('should calculate percentage commission correctly', () => {
    const rules = [{ type: 'percentage', value: 10 }]
    const commission = calculateCommission(1000, 'rep1', rules)
    expect(commission).toBe(100)
  })

  it('should apply minimum commission limit', () => {
    const rules = [{ type: 'percentage', value: 1, minimumAmount: 50 }]
    const commission = calculateCommission(1000, 'rep1', rules)
    expect(commission).toBe(50)
  })
})
\`\`\`

#### Integration Tests
\`\`\`typescript
// __tests__/api/entries.test.ts
import { createMocks } from 'node-mocks-http'
import handler from '@/app/api/entries/route'

describe('/api/entries', () => {
  it('should create a new entry', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        businessId: 'business1',
        raffleId: 'raffle1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(201)
    const data = JSON.parse(res._getData())
    expect(data.entry.email).toBe('john@example.com')
  })
})
\`\`\`

### Git Workflow

#### Branch Naming Convention
- `feature/feature-name`: New features
- `bugfix/bug-description`: Bug fixes
- `hotfix/critical-fix`: Critical production fixes
- `refactor/component-name`: Code refactoring

#### Commit Message Format
\`\`\`
type(scope): description

[optional body]

[optional footer]
\`\`\`

Examples:
- `feat(auth): add password reset functionality`
- `fix(api): resolve duplicate entry validation`
- `refactor(components): extract reusable table component`

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Issues
**Problem**: `MongoServerError: Authentication failed`

**Solution**:
\`\`\`bash
# Check connection string format
MONGODB_URI=mongodb://username:password@host:port/database

# For MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
\`\`\`

#### 2. NextAuth Session Issues
**Problem**: Session not persisting or user not authenticated

**Solution**:
\`\`\`typescript
// Check NEXTAUTH_SECRET is set
// Verify NEXTAUTH_URL matches your domain
// Clear browser cookies and localStorage

// Debug session
console.log('Session:', await getServerSession(authOptions))
\`\`\`

#### 3. Stripe Webhook Verification Failed
**Problem**: `Invalid signature` error in webhook handler

**Solution**:
\`\`\`typescript
// Ensure raw body is used for signature verification
// Check STRIPE_WEBHOOK_SECRET is correct
// Verify webhook endpoint URL in Stripe dashboard

// Debug webhook
console.log('Received signature:', req.headers.get('stripe-signature'))
console.log('Expected secret:', process.env.STRIPE_WEBHOOK_SECRET)
\`\`\`

#### 4. Email Delivery Issues
**Problem**: Emails not being sent or delivered

**Solution**:
\`\`\`typescript
// Check SMTP configuration
// Verify SendGrid API key
// Check spam folders
// Test with email testing service

// Debug email
console.log('SMTP Config:', {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  user: process.env.SMTP_USER
})
\`\`\`

#### 5. File Upload Issues
**Problem**: File uploads failing or not accessible

**Solution**:
\`\`\`typescript
// Check BLOB_READ_WRITE_TOKEN
// Verify file size limits
// Check file type restrictions

// Debug upload
console.log('Upload result:', await put(filename, file, { access: 'public' }))
\`\`\`

### Performance Optimization

#### Database Optimization
\`\`\`javascript
// Add compound indexes for common queries
db.entries.createIndex({ businessId: 1, raffleId: 1, createdAt: -1 })
db.leads.createIndex({ assignedToRepId: 1, status: 1 })
db.referralClicks.createIndex({ referralSlug: 1, timestamp: -1 })

// Use aggregation pipelines for complex queries
const pipeline = [
  { $match: { businessId: ObjectId(businessId) } },
  { $group: { _id: '$raffleId', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]
\`\`\`

#### Frontend Optimization
\`\`\`typescript
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  // Component logic
})

// Implement virtual scrolling for large lists
import { FixedSizeList as List } from 'react-window'

// Use SWR for data fetching with caching
const { data, error } = useSWR('/api/data', fetcher, {
  revalidateOnFocus: false,
  dedupingInterval: 60000
})
\`\`\`

#### API Optimization
\`\`\`typescript
// Implement pagination for large datasets
export async function GET(req: NextRequest) {
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1')
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50')
  const skip = (page - 1) * limit

  const results = await collection
    .find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray()

  return NextResponse.json({
    data: results,
    pagination: { page, limit, total: await collection.countDocuments(query) }
  })
}
\`\`\`

### Monitoring and Logging

#### Error Tracking
\`\`\`typescript
// lib/error-tracking.ts
export function logError(error: Error, context?: Record<string, any>) {
  console.error('Error:', error.message, {
    stack: error.stack,
    context,
    timestamp: new Date().toISOString()
  })

  // Send to error tracking service (e.g., Sentry)
  if (process.env.NODE_ENV === 'production') {
    // Sentry.captureException(error, { extra: context })
  }
}
\`\`\`

#### Performance Monitoring
\`\`\`typescript
// lib/performance.ts
export function measurePerformance<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const start = Date.now()
    
    try {
      const result = await fn()
      const duration = Date.now() - start
      
      console.log(`Performance: ${name} took ${duration}ms`)
      resolve(result)
    } catch (error) {
      reject(error)
    }
  })
}
\`\`\`

This comprehensive developer guide covers all aspects of the RaffilyRepPortal system, from architecture and database design to deployment and troubleshooting. It serves as a complete reference for developers working on the platform.
