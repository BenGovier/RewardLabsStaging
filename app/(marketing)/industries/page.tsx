import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ShoppingCart, Monitor, Megaphone, MapPin } from "lucide-react"

export default function IndustriesPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 to-emerald-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">Who uses Reward Labs?</h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Businesses across industries use our platform to capture leads, engage customers, and drive growth.
            </p>
            <div className="flex justify-center mb-12">
              <Image
                src="/placeholder.svg?height=300&width=400"
                alt="Industries illustration"
                width={400}
                height={300}
                className="max-w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Industries Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {/* Ecommerce */}
            <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <ShoppingCart className="h-8 w-8 text-green-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Ecommerce</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Boost conversions, reduce cart abandonment, and build customer loyalty with targeted giveaways.
              </p>
              <Link
                href="/industries/ecommerce"
                className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
              >
                Learn more <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* SaaS */}
            <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <Monitor className="h-8 w-8 text-green-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">SaaS & Subscriptions</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Increase trial signups, reduce churn, and grow your subscriber base with strategic campaigns.
              </p>
              <Link
                href="/industries/saas"
                className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
              >
                Learn more <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* Marketing Agencies */}
            <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <Megaphone className="h-8 w-8 text-green-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Marketing Agencies</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Deliver exceptional results for clients with white-label prize draw campaigns.
              </p>
              <Link
                href="/industries/marketing-agencies"
                className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
              >
                Learn more <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* Local Business */}
            <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <MapPin className="h-8 w-8 text-green-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Local Businesses</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Build community engagement and attract new customers with location-based campaigns.
              </p>
              <Link
                href="/industries/local-business"
                className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
              >
                Learn more <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories Preview */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Success Stories Across Industries</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">150%</div>
              <div className="text-gray-600">Increase in email signups</div>
              <div className="text-sm text-gray-500 mt-2">Ecommerce Store</div>
            </div>
            <div className="bg-white p-6 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">45%</div>
              <div className="text-gray-600">Reduction in churn rate</div>
              <div className="text-sm text-gray-500 mt-2">SaaS Platform</div>
            </div>
            <div className="bg-white p-6 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">300+</div>
              <div className="text-gray-600">New local customers</div>
              <div className="text-sm text-gray-500 mt-2">Restaurant Chain</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to see results in your industry?</h2>
          <p className="text-xl text-gray-600 mb-8">Join thousands of businesses already growing with Reward Labs.</p>
          <Link
            href="/signup/business"
            className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-md text-lg font-medium"
          >
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
