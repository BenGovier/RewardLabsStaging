import { Hero } from "@/components/marketing/Hero"
import { Stats } from "@/components/marketing/Stats"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const solutions = [
  {
    title: "Lead Capture",
    description: "Turn anonymous visitors into qualified leads with prize draws",
    href: "/solutions/lead-capture",
  },
  {
    title: "Launch Campaigns",
    description: "Create buzz and drive engagement with promotional campaigns",
    href: "/solutions/launch-campaigns",
  },
  {
    title: "List Reactivation",
    description: "Re-engage dormant subscribers and win back customers",
    href: "/solutions/reactivate-list",
  },
  {
    title: "Popups & Widgets",
    description: "Embed prize draws anywhere with customizable widgets",
    href: "/solutions/popups-widgets",
  },
]

const stats = [
  { value: "85%", label: "Email capture rate" },
  { value: "3x", label: "Engagement boost" },
  { value: "24hrs", label: "Setup time" },
  { value: "50k+", label: "Leads captured" },
]

export default function SolutionsPage() {
  return (
    <div>
      <Hero
        title="Solutions that turn traffic into growth"
        subtitle="Plug‑and‑play prize draws that capture emails, grow lists, and re‑engage customers."
      />

      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {solutions.map((solution, index) => (
              <Link key={index} href={solution.href}>
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{solution.title}</h3>
                  <p className="text-gray-600 mb-4">{solution.description}</p>
                  <span className="text-blue-600 font-medium">Learn more →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Stats stats={stats} />

      <div className="py-16 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/how-it-works">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              See how it works
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
