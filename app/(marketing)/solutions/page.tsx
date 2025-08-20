import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Target, Zap, Users, BarChart3 } from "lucide-react"

export default function SolutionsPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Solutions that turn traffic into growth
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Plug‑and‑play prize draws that capture emails, grow lists, and re‑engage customers.
            </p>
            <div className="flex justify-center mb-12">
              <Image
                src="/placeholder.svg?height=300&width=400"
                alt="Solutions illustration"
                width={400}
                height={300}
                className="max-w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {/* Lead Capture */}
            <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <Target className="h-8 w-8 text-blue-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Lead Capture</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Turn anonymous website visitors into qualified leads with engaging prize draws.
              </p>
              <Link
                href="/solutions/lead-capture"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                Learn more <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* Launch Campaigns */}
            <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <Zap className="h-8 w-8 text-blue-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Launch & Promo Campaigns</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Create buzz around product launches and promotions with viral giveaways.
              </p>
              <Link
                href="/solutions/launch-campaigns"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                Learn more <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* List Reactivation */}
            <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <Users className="h-8 w-8 text-blue-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">List Reactivation & Win‑back</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Re-engage dormant subscribers and win back lost customers with targeted campaigns.
              </p>
              <Link
                href="/solutions/reactivate-list"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                Learn more <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* Popups & Widgets */}
            <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">On‑site Popups & Embeddable Widgets</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Seamlessly integrate prize draws into your website with customizable widgets.
              </p>
              <Link
                href="/solutions/popups-widgets"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                Learn more <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">85%</div>
              <div className="text-gray-600">Average email capture rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">3.2x</div>
              <div className="text-gray-600">Increase in lead generation</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">24hrs</div>
              <div className="text-gray-600">Average setup time</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to turn your traffic into growth?</h2>
          <p className="text-xl text-gray-600 mb-8">
            See how our solutions can transform your business in just 24 hours.
          </p>
          <Link
            href="/signup/business"
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md text-lg font-medium"
          >
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
