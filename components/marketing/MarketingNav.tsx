"use client"

import Link from "next/link"
import { useState } from "react"
import { ChevronDown, Menu, X } from "lucide-react"

export default function MarketingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [industriesOpen, setIndustriesOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              Reward Labs
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link href="/" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                Home
              </Link>
              <Link href="/solutions" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                Solutions
              </Link>

              {/* Industries Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIndustriesOpen(!industriesOpen)}
                  className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium flex items-center"
                >
                  Industries
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                {industriesOpen && (
                  <div className="absolute z-10 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200">
                    <Link href="/industries" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      All Industries
                    </Link>
                    <Link href="/industries/saas" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      SaaS
                    </Link>
                    <Link
                      href="/industries/ecommerce"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Ecommerce
                    </Link>
                    <Link
                      href="/industries/marketing-agencies"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Marketing Agencies
                    </Link>
                    <Link
                      href="/industries/local-business"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Local Business
                    </Link>
                  </div>
                )}
              </div>

              <Link href="/resources" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                Resources
              </Link>
              <Link href="/pricing" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                Pricing
              </Link>
            </div>
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center space-x-4">
              <Link href="/auth/signin" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                Login
              </Link>
              <Link
                href="/signup/business"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-900 hover:text-blue-600 p-2"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              <Link href="/" className="text-gray-900 hover:text-blue-600 block px-3 py-2 text-base font-medium">
                Home
              </Link>
              <Link
                href="/solutions"
                className="text-gray-900 hover:text-blue-600 block px-3 py-2 text-base font-medium"
              >
                Solutions
              </Link>
              <Link
                href="/industries"
                className="text-gray-900 hover:text-blue-600 block px-3 py-2 text-base font-medium"
              >
                Industries
              </Link>
              <Link
                href="/resources"
                className="text-gray-900 hover:text-blue-600 block px-3 py-2 text-base font-medium"
              >
                Resources
              </Link>
              <Link href="/pricing" className="text-gray-900 hover:text-blue-600 block px-3 py-2 text-base font-medium">
                Pricing
              </Link>
              <Link
                href="/auth/signin"
                className="text-gray-900 hover:text-blue-600 block px-3 py-2 text-base font-medium"
              >
                Login
              </Link>
              <Link
                href="/signup/business"
                className="bg-blue-600 hover:bg-blue-700 text-white block px-3 py-2 rounded-md text-base font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
