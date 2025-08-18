import { Hero } from "@/components/marketing/Hero"
import Link from "next/link"

const industries = [
  {
    title: "Ecommerce",
    description: "Boost sales and customer acquisition for online stores",
    href: "/industries/ecommerce",
  },
  {
    title: "SaaS/Subscriptions",
    description: "Increase trial signups and reduce churn rates",
    href: "/industries/saas",
  },
  {
    title: "Marketing Agencies",
    description: "Deliver better results for your clients with prize campaigns",
    href: "/industries/marketing-agencies",
  },
  {
    title: "Local Business",
    description: "Drive foot traffic and build community engagement",
    href: "/industries/local-business",
  },
]

export default function IndustriesPage() {
  return (
    <div>
      <Hero
        title="Who uses Reward Labs?"
        subtitle="Prize draw campaigns work across industries. See how businesses like yours are growing with engaging prize campaigns."
      />

      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {industries.map((industry, index) => (
              <Link key={index} href={industry.href}>
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{industry.title}</h3>
                  <p className="text-gray-600 mb-4">{industry.description}</p>
                  <span className="text-blue-600 font-medium">Learn more →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
