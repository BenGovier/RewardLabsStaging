import BenefitPageLayout from "@/components/benefit-page-layout"
import { TrendingUp, Users, Target, BarChart3 } from "lucide-react"

export default function GenerateLeadsPage() {
  return (
    <BenefitPageLayout
      title="Generate High-Quality Leads"
      subtitle="Turn visitors into customers with giveaways that attract your ideal audience and capture valuable contact information."
      heroIcon={<TrendingUp className="w-12 h-12 text-white" />}
      heroColor="from-[#009FFD] to-[#007ACC]"
      stats={[
        {
          number: "4,800",
          label: "Average Leads Per Campaign",
          description: "Businesses collect thousands of qualified leads monthly",
        },
        {
          number: "73%",
          label: "Lead Quality Score",
          description: "Higher conversion rates than traditional lead gen",
        },
        {
          number: "15min",
          label: "Setup Time",
          description: "From idea to live campaign in minutes",
        },
      ]}
      features={[
        {
          icon: <Target className="w-8 h-8 text-[#009FFD]" />,
          title: "Targeted Audience Attraction",
          description: "Attract your ideal customers with prizes and messaging that resonate with your target market.",
        },
        {
          icon: <Users className="w-8 h-8 text-[#009FFD]" />,
          title: "Custom Entry Questions",
          description:
            "Collect exactly the information you need with customizable entry forms and qualifying questions.",
        },
        {
          icon: <BarChart3 className="w-8 h-8 text-[#009FFD]" />,
          title: "Lead Scoring & Analytics",
          description: "Track lead quality, source attribution, and conversion metrics to optimize your campaigns.",
        },
      ]}
      testimonial={{
        quote:
          "We generated 4,800 qualified leads in our first month. The quality was incredible - 68% became paying customers.",
        author: "Sarah Mitchell",
        role: "Marketing Director",
        company: "Local Café Chain",
        image: "/images/testimonial-woman-1.png",
        result: "+4,800 leads in 30 days",
      }}
      caseStudy={{
        title: "How TechStart Generated 12,000 Leads in 90 Days",
        description:
          "A B2B software company used Reward Labs to build their email list and generate qualified sales leads.",
        results: [
          "12,000 new leads collected across 3 campaigns",
          "68% lead-to-customer conversion rate",
          "£180,000 in new revenue attributed to campaigns",
          "45% reduction in cost per lead vs. paid ads",
        ],
      }}
    />
  )
}
