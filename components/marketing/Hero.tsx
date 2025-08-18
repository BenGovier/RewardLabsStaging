"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

interface HeroProps {
  title: string
  subtitle: string
  ctaText?: string
  ctaHref?: string
}

export function Hero({ title, subtitle, ctaText, ctaHref }: HeroProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{title}</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">{subtitle}</p>
        {ctaText && ctaHref && (
          <Link href={ctaHref}>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              {ctaText}
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
