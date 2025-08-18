"use client"

import { useRouter } from "next/navigation"

export function WebsiteFooter() {
  const router = useRouter()

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <img
              src="/images/reward-labs-main-logo.png"
              alt="Reward Labs"
              className="h-12 w-auto mb-6 cursor-pointer"
              onClick={() => router.push("/")}
            />
            <p className="text-gray-300 text-lg leading-relaxed max-w-md">
              The easiest way to run giveaways that grow your business. We handle the prizes, you get the leads.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-xl mb-6">Product</h3>
            <ul className="space-y-4 text-gray-300">
              <li>
                <a href="/#benefits" className="hover:text-white transition-colors">
                  Benefits
                </a>
              </li>
              <li>
                <a href="/#testimonials" className="hover:text-white transition-colors">
                  Success Stories
                </a>
              </li>
              <li>
                <a href="/demo" className="hover:text-white transition-colors">
                  Demo
                </a>
              </li>
              <li>
                <a href="/signup/business" className="hover:text-white transition-colors">
                  Pricing
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-xl mb-6">Support</h3>
            <ul className="space-y-4 text-gray-300">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="/terms-and-conditions" className="hover:text-white transition-colors">
                  Terms & Privacy
                </a>
              </li>
              <li>
                <a href="/auth/signin" className="hover:text-white transition-colors">
                  Sign In
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Reward Labs. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
