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
    description: "Select prizes that will re-engage your dormant subscribers",
  },
  {
    number: 2,
    title: "Brand & Launch",
    description: "Create compelling win-back campaigns with personalized messaging",
  },
  {
    number: 3,
    title: "Collect & Export",
    description: "Re-engage subscribers and segment active participants",
  },
]

const faqItems = [
  {
    question: "How do I identify dormant subscribers?",
    answer:
      "Upload your email list and we'll help you segment subscribers based on engagement history and activity levels.",
  },
  {
    question: "What's the best approach for win-back campaigns?",
    answer: "Combine attractive prizes with personalized messaging. Our templates are optimized for re-engagement.",
  },
  {
    question: "How do I measure reactivation success?",
    answer: "Track open rates, click-through rates, and subsequent engagement to measure campaign effectiveness.",
  },
]

export default function ReactivateListPage() {
  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Breadcrumbs items={[{ label: "Solutions", href: "/solutions" }, { label: "List Reactivation" }]} />
      </div>

      <Hero
        title="Re-engage dormant subscribers and win back customers"
        subtitle="Transform inactive email lists into engaged audiences with targeted prize draw campaigns designed to reactivate and retain customers."
      />

      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">The Problem</h2>
              <p className="text-gray-600 mb-6">
                Email lists naturally decay over time. Subscribers become inactive, open rates drop, and customer
                lifetime value decreases without intervention.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Solution</h2>
              <p className="text-gray-600 mb-6">
                Prize draws provide a compelling reason for dormant subscribers to re-engage. Win-back campaigns can
                revive 20-30% of inactive subscribers.
              </p>
            </div>
          </div>
        </div>
      </div>

      <StepRow steps={steps} />

      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Key Outcomes</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">25%</div>
              <div className="text-gray-600">Average reactivation rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">60%</div>
              <div className="text-gray-600">Improvement in open rates</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">$15</div>
              <div className="text-gray-600">Average recovered customer value</div>
            </div>
          </div>
        </div>
      </div>

      <FAQ items={faqItems} />

      <div className="py-16 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to reactivate your list?</h2>
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
