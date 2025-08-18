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
    description: "Select an attractive prize that resonates with your target audience",
  },
  {
    number: 2,
    title: "Brand & Launch",
    description: "Customize the design to match your brand and launch your campaign",
  },
  {
    number: 3,
    title: "Collect & Export",
    description: "Gather qualified leads and export them to your CRM or email platform",
  },
]

const faqItems = [
  {
    question: "How quickly can I set up a lead capture campaign?",
    answer: "Most campaigns can be set up and launched within 24 hours using our templates and guided setup process.",
  },
  {
    question: "What types of prizes work best for lead capture?",
    answer:
      "Digital products, gift cards, and exclusive access tend to perform well. We provide guidance on prize selection based on your industry.",
  },
  {
    question: "Can I integrate with my existing email marketing tools?",
    answer: "Yes, we support integrations with major email platforms including Mailchimp, Klaviyo, and HubSpot.",
  },
]

export default function LeadCapturePage() {
  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Breadcrumbs items={[{ label: "Solutions", href: "/solutions" }, { label: "Lead Capture" }]} />
      </div>

      <Hero
        title="Turn anonymous visitors into qualified leads"
        subtitle="Capture high-quality email addresses from website traffic with engaging prize draws that visitors actually want to enter."
        imageSrc="/marketing/hero-solutions.png"
        imageAlt="Lead capture solution"
      />

      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">The Problem</h2>
              <p className="text-gray-600 mb-6">
                Most website visitors leave without taking action. Traditional lead magnets have low conversion rates,
                and pop-ups are often ignored or blocked.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Solution</h2>
              <p className="text-gray-600 mb-6">
                Prize draws create excitement and urgency. Visitors willingly share their email for a chance to win,
                resulting in 3x higher conversion rates than traditional methods.
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
              <div className="text-2xl font-bold text-blue-600 mb-2">85%</div>
              <div className="text-gray-600">Average email capture rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">3x</div>
              <div className="text-gray-600">Higher conversion vs. traditional forms</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">24hrs</div>
              <div className="text-gray-600">Time to launch your first campaign</div>
            </div>
          </div>
        </div>
      </div>

      <FAQ items={faqItems} />

      <div className="py-16 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to capture more leads?</h2>
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
