import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SessionProvider } from "@/components/session-provider"
import { ConditionalSidebar } from "@/components/conditional-sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Reward Labs",
  description: "Representative portal for Reward Labs",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <ConditionalSidebar>{children}</ConditionalSidebar>
        </SessionProvider>
      </body>
    </html>
  )
}
