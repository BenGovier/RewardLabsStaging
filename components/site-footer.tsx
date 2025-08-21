import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <img src="/images/reward-labs-logo-new.png" alt="Reward Labs" className="h-12 w-auto mb-4" />
            <p className="text-gray-400">
              Turn giveaways into growth with branded prize draws that collect leads and reward customers.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Solutions</h3>
            <ul className="space-y-2 text-gray-400">
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
                  Reactivate Lists
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Industries</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/industries/ecommerce" className="hover:text-white">
                  E-commerce
                </Link>
              </li>
              <li>
                <Link href="/industries/saas" className="hover:text-white">
                  SaaS
                </Link>
              </li>
              <li>
                <Link href="/industries/marketing-agencies" className="hover:text-white">
                  Agencies
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/demo" className="hover:text-white">
                  Demo
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="hover:text-white">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Reward Labs. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
