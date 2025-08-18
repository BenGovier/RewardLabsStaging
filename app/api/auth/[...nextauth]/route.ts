import NextAuth, { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { getDb } from "@/lib/mongodb"
import { USERS_COLLECTION } from "@/models/user"

export const dynamic = "force-dynamic"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("NextAuth: Missing credentials")
          return null
        }

        try {
          console.log("NextAuth: Attempting to authorize user:", credentials.email)

          // Connect to MongoDB and get users collection
          const db = await getDb()
          const usersCollection = db.collection(USERS_COLLECTION)

          console.log("NextAuth: Connected to database, collection:", USERS_COLLECTION)

          // Find user by email
          const user = await usersCollection.findOne({
            email: credentials.email.toLowerCase(),
          })

          console.log("NextAuth: User found:", !!user)
          if (user) {
            console.log("NextAuth: User details:", {
              id: user._id,
              email: user.email,
              role: user.role,
              hasPasswordHash: !!user.passwordHash,
              hasPassword: !!user.password,
            })
          }

          if (!user) {
            console.log("NextAuth: No user found with email:", credentials.email)

            // Additional debug: check if any users exist
            const userCount = await usersCollection.countDocuments()
            console.log("NextAuth: Total users in database:", userCount)

            return null
          }

          // Check which password field exists
          const storedPassword = user.passwordHash || user.password

          if (!storedPassword) {
            console.log("NextAuth: No password hash found for user")
            console.log("NextAuth: User object keys:", Object.keys(user))
            return null
          }

          console.log("NextAuth: Comparing password...")

          // Verify password using bcryptjs
          const isPasswordValid = await bcrypt.compare(credentials.password, storedPassword)

          console.log("NextAuth: Password valid:", isPasswordValid)

          if (!isPasswordValid) {
            console.log("NextAuth: Invalid password for user:", credentials.email)
            return null
          }

          console.log("NextAuth: User authorized successfully:", credentials.email)
          console.log("NextAuth: User role:", user.role)

          // Return user object (exclude password) - ENSURE ROLE IS INCLUDED
          return {
            id: user._id.toString(),
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            role: user.role || "rep", // Ensure role is always included
            firstName: user.firstName,
            lastName: user.lastName,
            businessName: user.businessName || "",
          }
        } catch (error) {
          console.error("NextAuth: Authentication error:", error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log("NextAuth JWT callback - User data:", {
          id: user.id,
          email: user.email,
          role: user.role,
        })

        // Explicitly set all user properties on token
        token.id = user.id
        token.email = user.email
        token.role = user.role
        token.firstName = user.firstName
        token.lastName = user.lastName
        if (user.businessName) {
          token.businessName = user.businessName
        }
      }

      console.log("NextAuth JWT callback - Final token:", {
        sub: token.sub,
        email: token.email,
        role: token.role,
      })

      return token
    },
    async session({ session, token }) {
      if (token) {
        // Ensure all token properties are copied to session
        session.user.id = token.sub!
        session.user.email = token.email as string
        session.user.role = token.role as string
        session.user.firstName = token.firstName as string
        session.user.lastName = token.lastName as string

        console.log("NextAuth Session callback - Setting role:", token.role)
        console.log("NextAuth Session callback - Final session:", {
          id: session.user.id,
          email: session.user.email,
          role: session.user.role,
        })

        if (token.businessName) {
          session.user.businessName = token.businessName as string
        }
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // If user is signing in, redirect based on their role
      if (url === baseUrl || url === `${baseUrl}/`) {
        // Default redirect - will be handled by individual pages
        return `${baseUrl}/feed`
      }

      // Allow relative callback URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }

      // Allow callback URLs on the same origin
      if (new URL(url).origin === baseUrl) {
        return url
      }

      return baseUrl
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  debug: true,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

// Export authOptions for use in other modules
