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
    description: "Select a compelling prize that aligns with your campaign goals",
  },
  {
    number: 2,
    title: "Brand & Launch",
    description: "Customize messaging and design to create maximum impact",
  },
  {
    number: 3,
    title: "Collect & Export",
    description: "Track engagement and export participant data for follow-up",
  },
]

const faqItems = [
  {
    question: "What makes a successful launch campaign?",
    answer:
      "Clear messaging, attractive prizes, and strategic timing. We provide templates and best practices for maximum impact.",
  },
  {
    question: "How do I promote my campaign?",
    answer:
      "Use social media, email marketing, and paid ads. Our platform provides shareable links and promotional materials.",
  },
  {
    question: "Can I track campaign performance?",
    answer: "Yes, get detailed analytics on entries, engagement rates, and conversion metrics in real-time.",
  },
]

export default function LaunchCampaignsPage() {
  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Breadcrumbs items={[{ label: "Solutions", href: "/solutions" }, { label: "Launch Campaigns" }]} />
      </div>

      <Hero
        title="Create buzz with promotional campaigns"
        subtitle="Launch engaging prize draw campaigns that generate excitement, drive traffic, and build your audience for product launches and promotions."
      />

      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">The Problem</h2>
              <p className="text-gray-600 mb-6">
                Product launches often lack engagement. Traditional marketing campaigns struggle to create genuine
                excitement and word-of-mouth promotion.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Solution</h2>
              <p className="text-gray-600 mb-6">
                Prize draw campaigns create natural sharing and engagement. Participants become brand advocates,
                amplifying your reach organically.
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
              <div className="text-2xl font-bold text-blue-600 mb-2">5x</div>
              <div className="text-gray-600">More social shares than standard posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">40%</div>
              <div className="text-gray-600">Increase in brand awareness</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">2x</div>
              <div className="text-gray-600">Higher engagement rates</div>
            </div>
          </div>
        </div>
      </div>

      <FAQ items={faqItems} />

      <div className="py-16 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to launch your campaign?</h2>
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
