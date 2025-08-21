import Link from "next/link"

export function SiteFooter() {
  const isStaging = process.env.NEXT_PUBLIC_STAGING === "1"

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className={`grid grid-cols-1 ${isStaging ? "md:grid-cols-6" : "md:grid-cols-4"} gap-8`}>
          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Raffily</h3>
            <p className="text-gray-400 text-sm">
              The easiest way to run giveaways that drive traffic, capture leads, and boost revenue.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/demo" className="hover:text-white">
                  Demo
                </Link>
              </li>
              <li>
                <Link href="#features" className="hover:text-white">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="hover:text-white">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/signup/business" className="hover:text-white">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Solutions - Staging Only */}
          {isStaging && (
            <div>
              <h4 className="font-semibold mb-4">Solutions</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/solutions/lead-capture" className="hover:text-white">
                    Lead Capture
                  </Link>
                </li>
                <li>
                  <Link href="/solutions/launch-campaigns" className="hover:text-white">
                    Launch Campaigns
                  </Link>
                </li>
                <li>
                  <Link href="/solutions/reactivate-list" className="hover:text-white">
                    List Reactivation
                  </Link>
                </li>
                <li>
                  <Link href="/solutions/popups-widgets" className="hover:text-white">
                    Popups & Widgets
                  </Link>
                </li>
              </ul>
            </div>
          )}

          {/* Industries - Staging Only */}
          {isStaging && (
            <div>
              <h4 className="font-semibold mb-4">Industries</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/industries/ecommerce" className="hover:text-white">
                    Ecommerce
                  </Link>
                </li>
                <li>
                  <Link href="/industries/saas" className="hover:text-white">
                    SaaS
                  </Link>
                </li>
                <li>
                  <Link href="/industries/marketing-agencies" className="hover:text-white">
                    Marketing Agencies
                  </Link>
                </li>
                <li>
                  <Link href="/industries/local-business" className="hover:text-white">
                    Local Business
                  </Link>
                </li>
              </ul>
            </div>
          )}

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="mailto:support@raffily.com" className="hover:text-white">
                  Contact Support
                </a>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="hover:text-white">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <a href="mailto:privacy@raffily.com" className="hover:text-white">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="mailto:hello@raffily.com" className="hover:text-white">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="mailto:sales@raffily.com" className="hover:text-white">
                  Enterprise Sales
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 Raffily. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
