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
    description: "Select prizes that align with your website visitors' interests",
  },
  {
    number: 2,
    title: "Brand & Launch",
    description: "Customize widget design and configure display rules",
  },
  {
    number: 3,
    title: "Collect & Export",
    description: "Capture leads seamlessly and integrate with your systems",
  },
]

const faqItems = [
  {
    question: "How do I embed widgets on my website?",
    answer: "Simply copy and paste our embed code. No technical knowledge required - works with any website platform.",
  },
  {
    question: "Can I control when and where widgets appear?",
    answer: "Yes, set display rules based on page visits, time on site, scroll depth, and exit intent.",
  },
  {
    question: "Will widgets slow down my website?",
    answer: "No, our widgets are optimized for performance and load asynchronously without affecting page speed.",
  },
]

export default function PopupsWidgetsPage() {
  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Breadcrumbs items={[{ label: "Solutions", href: "/solutions" }, { label: "Popups & Widgets" }]} />
      </div>

      <Hero
        title="Embed prize draws anywhere with customizable widgets"
        subtitle="Add engaging prize draw widgets to any website, blog, or landing page. Capture leads without disrupting the user experience."
      />

      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">The Problem</h2>
              <p className="text-gray-600 mb-6">
                Traditional pop-ups are intrusive and often blocked. Static forms have low conversion rates and don't
                create engagement.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Solution</h2>
              <p className="text-gray-600 mb-6">
                Smart widgets that appear at the right moment with compelling prize draws. Visitors engage willingly,
                resulting in higher conversion rates.
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
              <div className="text-2xl font-bold text-blue-600 mb-2">4x</div>
              <div className="text-gray-600">Higher conversion than standard popups</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">5min</div>
              <div className="text-gray-600">Setup time for any website</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">90%</div>
              <div className="text-gray-600">Positive user experience rating</div>
            </div>
          </div>
        </div>
      </div>

      <FAQ items={faqItems} />

      <div className="py-16 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to embed prize draws?</h2>
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
