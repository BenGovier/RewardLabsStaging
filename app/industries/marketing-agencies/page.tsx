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
    description: "Work with clients to select prizes that resonate with their audience",
  },
  {
    number: 2,
    title: "Brand & Launch",
    description: "White-label campaigns with your agency branding and client's brand",
  },
  {
    number: 3,
    title: "Collect & Export",
    description: "Deliver qualified leads and detailed performance reports to clients",
  },
]

const faqItems = [
  {
    question: "Can I white-label the platform for my clients?",
    answer: "Yes, our agency plans include white-label options so campaigns appear under your brand and domain.",
  },
  {
    question: "How do I price prize campaign services?",
    answer:
      "Most agencies charge 2-5x our platform cost plus prize budget. We provide pricing guidance and proposal templates.",
  },
  {
    question: "What kind of results can I promise clients?",
    answer:
      "Typical results include 3-5x higher conversion rates than traditional lead magnets and 85%+ email capture rates.",
  },
]

export default function MarketingAgenciesPage() {
  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Breadcrumbs items={[{ label: "Industries", href: "/industries" }, { label: "Marketing Agencies" }]} />
      </div>

      <Hero
        title="Deliver better results for your clients with prize campaigns"
        subtitle="Marketing agencies use our platform to create high-converting campaigns that generate more leads and better ROI for their clients."
      />

      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Key Outcomes for Agencies</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">5x</div>
              <div className="text-gray-600">Higher conversion rates for clients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">50%</div>
              <div className="text-gray-600">Increase in client retention</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">3x</div>
              <div className="text-gray-600">More referrals from happy clients</div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Example Campaigns</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Lead Generation for B2B Clients</h3>
              <p className="text-gray-600">
                Create professional prize campaigns that capture high-quality leads for your B2B clients.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Social Media Engagement</h3>
              <p className="text-gray-600">
                Boost social media metrics with shareable prize campaigns that increase reach and engagement.
              </p>
            </div>
          </div>
        </div>
      </div>

      <StepRow steps={steps} />

      <FAQ items={faqItems} />

      <div className="py-16 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to offer prize campaigns to your clients?</h2>
          <Link href="/signup/business">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Start Agency Trial
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
