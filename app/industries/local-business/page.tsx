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
    description: "Select local prizes that appeal to your community",
  },
  {
    number: 2,
    title: "Brand & Launch",
    description: "Create campaigns that highlight your local presence",
  },
  {
    number: 3,
    title: "Collect & Export",
    description: "Build a local customer database and drive foot traffic",
  },
]

const faqItems = [
  {
    question: "What prizes work best for local businesses?",
    answer:
      "Gift certificates, free services, local experiences, and partnerships with other local businesses tend to perform well.",
  },
  {
    question: "How can I drive foot traffic with online campaigns?",
    answer:
      "Require in-store pickup for prizes, offer location-specific rewards, and promote local events through your campaigns.",
  },
  {
    question: "Can I target people in my local area?",
    answer:
      "Yes, use geo-targeting and local social media promotion to reach customers in your specific geographic area.",
  },
]

export default function LocalBusinessPage() {
  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Breadcrumbs items={[{ label: "Industries", href: "/industries" }, { label: "Local Business" }]} />
      </div>

      <Hero
        title="Drive foot traffic and build community engagement"
        subtitle="Local businesses use prize campaigns to attract new customers, build email lists, and create buzz in their community."
      />

      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Key Outcomes for Local Business</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">60%</div>
              <div className="text-gray-600">Increase in foot traffic</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">40%</div>
              <div className="text-gray-600">More local email subscribers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">25%</div>
              <div className="text-gray-600">Higher customer lifetime value</div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Example Campaigns</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Grand Opening Giveaway</h3>
              <p className="text-gray-600">
                Generate excitement for new locations with prize campaigns that drive initial foot traffic.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Seasonal Promotions</h3>
              <p className="text-gray-600">
                Boost sales during slow periods with themed prize campaigns tied to holidays and seasons.
              </p>
            </div>
          </div>
        </div>
      </div>

      <StepRow steps={steps} />

      <FAQ items={faqItems} />

      <div className="py-16 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to grow your local business?</h2>
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
