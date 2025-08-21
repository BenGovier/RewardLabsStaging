import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"
import { type User, USERS_COLLECTION, validateUser } from "@/models/user"
import { sendEmail, generateInvitationEmail } from "@/lib/email"
import bcrypt from "bcryptjs"
import { nanoid } from "nanoid"

// GET all reps
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const db = await getDb()
    const reps = await db
      .collection(USERS_COLLECTION)
      .find({ role: "rep" })
      .project({
        _id: 1,
        firstName: 1,
        lastName: 1,
        email: 1,
        mobile: 1,
        isActive: 1,
        invitationSent: 1,
        dateCreated: 1,
      })
      .sort({ dateCreated: -1 })
      .toArray()

    return NextResponse.json({ reps })
  } catch (error) {
    console.error("Error fetching reps:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST create new rep
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const { firstName, lastName, email, mobile } = body

    // Generate temporary password (12 characters)
    const tempPassword = nanoid(12)
    const passwordHash = await bcrypt.hash(tempPassword, 12)

    const userData: Partial<User> = {
      firstName: firstName?.trim(),
      lastName: lastName?.trim(),
      email: email?.trim().toLowerCase(),
      mobile: mobile?.trim(),
      role: "rep",
      passwordHash,
      isActive: true,
      invitationSent: false,
    }

    const errors = validateUser(userData)
    if (errors.length > 0) {
      return NextResponse.json({ error: "Validation failed", errors }, { status: 400 })
    }

    const db = await getDb()

    // Check if email already exists
    const existingUser = await db.collection(USERS_COLLECTION).findOne({ email: userData.email })
    if (existingUser) {
      return NextResponse.json({ error: "Email address already exists" }, { status: 400 })
    }

    // Create user
    const user: User = {
      ...userData,
      dateCreated: new Date(),
    } as User

    const result = await db.collection(USERS_COLLECTION).insertOne(user)

    // Send invitation email
    const emailSent = await sendEmail({
      to: userData.email!,
      subject: "Welcome to Raffily RepPortal - Your Account is Ready",
      html: generateInvitationEmail(userData.firstName!, userData.lastName!, tempPassword),
    })

    if (emailSent) {
      // Update user to mark invitation as sent
      await db.collection(USERS_COLLECTION).updateOne(
        { _id: result.insertedId },
        {
          $set: {
            invitationSent: true,
            invitationSentAt: new Date(),
          },
        },
      )
    }

    return NextResponse.json(
      {
        success: true,
        repId: result.insertedId,
        emailSent,
        message: emailSent ? "Rep created and invitation sent" : "Rep created but email failed to send",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating rep:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
