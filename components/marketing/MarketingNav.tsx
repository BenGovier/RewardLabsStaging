"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Play, LogIn } from "lucide-react"

export function MarketingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <img src="/images/reward-labs-logo-new.png" alt="Reward Labs" className="h-16 w-auto" />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-12">
            <a
              href="#how-it-works"
              className="text-[#374151] hover:text-[#111827] font-semibold transition-colors text-lg hover:scale-105 duration-200"
            >
              How it Works
            </a>
            <a
              href="#benefits"
              className="text-[#374151] hover:text-[#111827] font-semibold transition-colors text-lg hover:scale-105 duration-200"
            >
              Benefits
            </a>
            <a
              href="#testimonials"
              className="text-[#374151] hover:text-[#111827] font-semibold transition-colors text-lg hover:scale-105 duration-200"
            >
              Success Stories
            </a>
            <Link
              href="/demo"
              className="text-[#374151] hover:text-[#111827] font-semibold transition-colors text-lg hover:scale-105 duration-200 flex items-center"
            >
              <Play className="w-4 h-4 mr-2" />
              Demo (0:45)
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/auth/signin">
              <Button
                variant="ghost"
                className="font-semibold text-lg px-6 py-3 h-auto text-[#374151] hover:text-[#111827] hover:scale-105 transition-all duration-200"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </Link>
            <Link href="/register-interest">
              <Button className="bg-[#009FFD] hover:bg-[#007ACC] font-semibold text-lg px-6 py-3 shadow-lg h-auto text-white hover:scale-105 transition-all duration-200 hover:shadow-xl">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-6 border-t border-gray-100">
            <div className="flex flex-col space-y-4">
              <a href="#how-it-works" className="text-[#374151] hover:text-[#111827] font-semibold py-2 text-lg">
                How it Works
              </a>
              <a href="#benefits" className="text-[#374151] hover:text-[#111827] font-semibold py-2 text-lg">
                Benefits
              </a>
              <a href="#testimonials" className="text-[#374151] hover:text-[#111827] font-semibold py-2 text-lg">
                Success Stories
              </a>
              <Link
                href="/demo"
                className="justify-start text-[#374151] hover:text-[#111827] font-semibold text-lg p-2 flex items-center"
              >
                <Play className="w-4 h-4 mr-2" />
                Demo (0:45)
              </Link>
              <div className="flex flex-col space-y-3 pt-4">
                <Link href="/auth/signin">
                  <Button
                    variant="outline"
                    className="w-full text-lg py-3 h-auto border-[#009FFD] text-[#009FFD] hover:bg-[#009FFD] hover:text-white bg-transparent"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
                <Link href="/register-interest">
                  <Button className="w-full bg-[#009FFD] hover:bg-[#007ACC] text-lg py-3 h-auto text-white">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
