"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X, ChevronDown } from "lucide-react"

export function MarketingNav() {
  const [isOpen, setIsOpen] = useState(false)
  const [isIndustriesOpen, setIsIndustriesOpen] = useState(false)

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-blue-600">
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
                  onClick={() => setIsIndustriesOpen(!isIndustriesOpen)}
                  className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium flex items-center"
                >
                  Industries
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                {isIndustriesOpen && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border z-50">
                    <Link
                      href="/industries"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsIndustriesOpen(false)}
                    >
                      All Industries
                    </Link>
                    <Link
                      href="/industries/ecommerce"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsIndustriesOpen(false)}
                    >
                      Ecommerce
                    </Link>
                    <Link
                      href="/industries/saas"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsIndustriesOpen(false)}
                    >
                      SaaS
                    </Link>
                    <Link
                      href="/industries/marketing-agencies"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsIndustriesOpen(false)}
                    >
                      Marketing Agencies
                    </Link>
                    <Link
                      href="/industries/local-business"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsIndustriesOpen(false)}
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
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-900 hover:text-blue-600 p-2">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              <Link
                href="/"
                className="text-gray-900 hover:text-blue-600 block px-3 py-2 text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/solutions"
                className="text-gray-900 hover:text-blue-600 block px-3 py-2 text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                Solutions
              </Link>
              <Link
                href="/industries"
                className="text-gray-900 hover:text-blue-600 block px-3 py-2 text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                Industries
              </Link>
              <Link
                href="/resources"
                className="text-gray-900 hover:text-blue-600 block px-3 py-2 text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                Resources
              </Link>
              <Link
                href="/pricing"
                className="text-gray-900 hover:text-blue-600 block px-3 py-2 text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                Pricing
              </Link>
              <div className="border-t pt-4 mt-4">
                <Link
                  href="/auth/signin"
                  className="text-gray-900 hover:text-blue-600 block px-3 py-2 text-base font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/signup/business"
                  className="bg-blue-600 hover:bg-blue-700 text-white block px-3 py-2 rounded-md text-base font-medium mt-2"
                  onClick={() => setIsOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
