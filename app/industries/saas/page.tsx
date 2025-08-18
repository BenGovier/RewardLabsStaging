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
    description: "Select prizes that appeal to your target user persona",
  },
  {
    number: 2,
    title: "Brand & Launch",
    description: "Create campaigns that highlight your product's value",
  },
  {
    number: 3,
    title: "Collect & Export",
    description: "Convert participants into trial users and subscribers",
  },
]

const faqItems = [
  {
    question: "What prizes work for SaaS companies?",
    answer:
      "Free subscriptions, extended trials, tech gadgets, and professional development resources tend to perform well with B2B audiences.",
  },
  {
    question: "How can I reduce churn with prize campaigns?",
    answer:
      "Use win-back campaigns for churned users and loyalty programs for existing customers to increase retention.",
  },
  {
    question: "Can I track trial-to-paid conversions?",
    answer: "Yes, our analytics help you track the customer journey from prize entry to paid subscription.",
  },
]

export default function SaaSPage() {
  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Breadcrumbs items={[{ label: "Industries", href: "/industries" }, { label: "SaaS/Subscriptions" }]} />
      </div>

      <Hero
        title="Increase trial signups and reduce churn rates"
        subtitle="SaaS and subscription businesses use prize campaigns to attract qualified leads, boost trial conversions, and retain customers longer."
      />

      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Key Outcomes for SaaS</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">45%</div>
              <div className="text-gray-600">More qualified trial signups</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">30%</div>
              <div className="text-gray-600">Higher trial-to-paid conversion</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">20%</div>
              <div className="text-gray-600">Reduction in churn rate</div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Example Campaigns</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Free Trial Extension</h3>
              <p className="text-gray-600">
                Offer extended trials as prizes to give users more time to experience your product's value.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Win-Back Campaign</h3>
              <p className="text-gray-600">
                Re-engage churned customers with special offers and prizes to bring them back to your platform.
              </p>
            </div>
          </div>
        </div>
      </div>

      <StepRow steps={steps} />

      <FAQ items={faqItems} />

      <div className="py-16 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to grow your SaaS business?</h2>
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
