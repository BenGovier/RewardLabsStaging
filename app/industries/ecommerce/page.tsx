import { Breadcrumbs } from "@/components/marketing/Breadcrumbs"
import { Hero } from "@/components/marketing/Hero"
import { StepRow } from "@/components/marketing/StepRow"
import { FAQ } from "@/components/marketing/FAQ"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const steps = [
  {
    number: 1,
    title: "Choose Prize",
    description: "Select products or gift cards that appeal to your target customers",
  },
  {
    number: 2,
    title: "Brand & Launch",
    description: "Customize the campaign to match your store's branding",
  },
  {
    number: 3,
    title: "Collect & Export",
    description: "Convert entries into customers and repeat buyers",
  },
]

const faqItems = [
  {
    question: "What prizes work best for ecommerce?",
    answer:
      "Popular products, gift cards, and exclusive bundles tend to perform well. We recommend prizes valued at 5-10% of your average order value.",
  },
  {
    question: "How do I convert entries into sales?",
    answer:
      "Follow up with discount codes, product recommendations, and targeted email campaigns to convert participants into customers.",
  },
  {
    question: "Can I integrate with my ecommerce platform?",
    answer:
      "Yes, we integrate with Shopify, WooCommerce, and other major platforms to sync customer data and track conversions.",
  },
]

export default function EcommercePage() {
  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Breadcrumbs items={[{ label: "Industries", href: "/industries" }, { label: "Ecommerce" }]} />
      </div>

      <Hero
        title="Boost sales and customer acquisition for online stores"
        subtitle="Prize draw campaigns help ecommerce businesses capture leads, increase average order values, and build customer loyalty."
      />

      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Key Outcomes for Ecommerce</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">35%</div>
              <div className="text-gray-600">Increase in email subscribers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">25%</div>
              <div className="text-gray-600">Higher average order value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">40%</div>
              <div className="text-gray-600">More repeat customers</div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Example Campaigns</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Product Launch Giveaway</h3>
              <p className="text-gray-600">
                Generate buzz for new products with exclusive prize bundles and early access opportunities.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Abandoned Cart Recovery</h3>
              <p className="text-gray-600">
                Win back customers who left items in their cart with special prize draw incentives.
              </p>
            </div>
          </div>
        </div>
      </div>

      <StepRow steps={steps} />

      <FAQ items={faqItems} />

      <div className="py-16 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to grow your ecommerce business?</h2>
          <Link href="/signup/business">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
