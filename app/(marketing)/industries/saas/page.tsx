import Link from "next/link"
import Image from "next/image"
import { ArrowRight, CheckCircle, Users, TrendingUp, Zap } from "lucide-react"

export default function SaaSIndustryPage() {
  return (
    <div className="bg-white">
      {/* Breadcrumbs */}
      <div className="bg-gray-50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link href="/" className="text-gray-500 hover:text-gray-700">
                  Home
                </Link>
              </li>
              <li>
                <span className="text-gray-400">/</span>
              </li>
              <li>
                <Link href="/industries" className="text-gray-500 hover:text-gray-700">
                  Industries
                </Link>
              </li>
              <li>
                <span className="text-gray-400">/</span>
              </li>
              <li>
                <span className="text-gray-900 font-medium">SaaS & Subscriptions</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Grow Your SaaS with Strategic Prize Campaigns
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Increase trial signups, reduce churn, and build a loyal subscriber base with targeted giveaways that
                convert.
              </p>
              <Link
                href="/signup/business"
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md text-lg font-medium"
              >
                Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
            <div className="flex justify-center">
              <Image
                src="/marketing/saas.png"
                alt="SaaS illustration"
                width={400}
                height={300}
                className="max-w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Key Outcomes */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Key Outcomes for SaaS Companies</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how prize campaigns can transform your SaaS metrics and drive sustainable growth.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Increase Trial Signups</h3>
              <p className="text-gray-600">
                Attract high-quality prospects with valuable prizes that align with your target audience.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Reduce Churn Rate</h3>
              <p className="text-gray-600">
                Re-engage at-risk subscribers with win-back campaigns that remind them of your value.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Boost Feature Adoption</h3>
              <p className="text-gray-600">
                Drive engagement with new features through targeted campaigns and educational prizes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Example Campaigns */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Example SaaS Campaigns</h2>
            <p className="text-xl text-gray-600">Real campaign ideas that drive results for SaaS companies.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Free Year Subscription Giveaway</h3>
              <p className="text-gray-600 mb-4">
                Attract new users by offering a full year of your premium plan as the grand prize.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Increases trial signups by 200%+
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Builds email list of qualified prospects
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Creates buzz around your product
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Win-Back Campaign</h3>
              <p className="text-gray-600 mb-4">
                Re-engage churned users with exclusive prizes and special offers to return.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Reduces churn by up to 45%
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Reactivates dormant accounts
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Improves customer lifetime value
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Process */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works for SaaS</h2>
            <p className="text-xl text-gray-600">Launch your first campaign in just 3 simple steps.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose Your Prize</h3>
              <p className="text-gray-600">
                Select prizes that appeal to your target audience - free subscriptions, premium features, or tech
                gadgets.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Brand & Launch</h3>
              <p className="text-gray-600">
                Customize the campaign with your branding and launch across your marketing channels.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Collect & Convert</h3>
              <p className="text-gray-600">
                Gather qualified leads and convert them into paying subscribers with targeted follow-up.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How do prize campaigns help reduce SaaS churn?
              </h3>
              <p className="text-gray-600">
                Prize campaigns re-engage at-risk users by providing value and reminding them of your product benefits.
                Win-back campaigns can reduce churn by up to 45%.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What types of prizes work best for SaaS companies?
              </h3>
              <p className="text-gray-600">
                Free subscriptions, premium feature access, tech gadgets, and professional development resources tend to
                perform well with SaaS audiences.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I integrate campaigns with my existing SaaS tools?
              </h3>
              <p className="text-gray-600">
                Yes, our platform integrates with popular SaaS tools including CRM systems, email marketing platforms,
                and analytics tools for seamless workflow integration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to grow your SaaS?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join hundreds of SaaS companies already using prize campaigns to drive growth.
          </p>
          <Link
            href="/signup/business"
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md text-lg font-medium"
          >
            Start Your Campaign <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
