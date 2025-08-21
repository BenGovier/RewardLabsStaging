import BenefitPageLayout from "@/components/benefit-page-layout"
import { Zap, TrendingUp, Target, Globe } from "lucide-react"

export default function DriveTrafficPage() {
  return (
    <BenefitPageLayout
      title="Drive Traffic to Your Website"
      subtitle="Boost website visits and engagement with giveaways that create buzz, encourage sharing, and bring customers back."
      heroIcon={<Zap className="w-12 h-12 text-white" />}
      heroColor="from-[#2A2A72] to-[#1F1F5C]"
      stats={[
        {
          number: "3.2x",
          label: "Traffic Increase",
          description: "Average website traffic boost during campaigns",
        },
        {
          number: "67%",
          label: "Social Sharing Rate",
          description: "Participants share giveaways with friends",
        },
        {
          number: "45%",
          label: "Return Visitor Rate",
          description: "Giveaway participants return to browse",
        },
      ]}
      features={[
        {
          icon: <Globe className="w-8 h-8 text-[#2A2A72]" />,
          title: "Viral Sharing Mechanics",
          description:
            "Built-in sharing features that encourage participants to spread the word and drive referral traffic.",
        },
        {
          icon: <TrendingUp className="w-8 h-8 text-[#2A2A72]" />,
          title: "SEO Benefits",
          description: "Increased engagement signals and backlinks from giveaway coverage boost search rankings.",
        },
        {
          icon: <Target className="w-8 h-8 text-[#2A2A72]" />,
          title: "Targeted Landing Pages",
          description: "Custom giveaway pages that showcase your products and guide visitors through your site.",
        },
      ]}
      testimonial={{
        quote:
          "Our website traffic increased by 320% during our first giveaway campaign. The engagement was incredible!",
        author: "Lisa Rodriguez",
        role: "Digital Marketing Manager",
        company: "Home Decor Store",
        image: "/images/testimonial-woman-1.png",
        result: "+320% traffic increase",
      }}
      caseStudy={{
        title: "How GadgetWorld Drove 100K Visitors in 30 Days",
        description: "An electronics retailer used a tech giveaway to drive massive traffic and boost brand awareness.",
        results: [
          "100,000 new website visitors in 30 days",
          "3.2x increase in average daily traffic",
          "67% of participants shared on social media",
          "£450,000 in sales during campaign period",
        ],
      }}
    />
  )
}
