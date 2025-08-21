import type React from "react"
import { Inter } from "next/font/google"
import { MarketingNav } from "@/components/marketing/MarketingNav"
import { SiteFooter } from "@/components/site-footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Reward Labs - Turn Giveaways Into Growth",
  description: "Branded prize draws that collect leads, reward customers, and get shared — all on autopilot.",
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <MarketingNav />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  )
}
