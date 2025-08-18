import BenefitPageLayout from "@/components/benefit-page-layout"
import { Mail, TrendingUp, Users, Zap } from "lucide-react"

export default function EmailMarketingPage() {
  return (
    <BenefitPageLayout
      title="Boost Email Open Rates"
      subtitle="Transform your email marketing with giveaway announcements that get opened, clicked, and shared."
      heroIcon={<Mail className="w-12 h-12 text-white" />}
      heroColor="from-[#FFAF40] to-[#FF9500]"
      stats={[
        {
          number: "89%",
          label: "Average Open Rate",
          description: "Giveaway emails significantly outperform standard campaigns",
        },
        {
          number: "3.2x",
          label: "Click-Through Rate",
          description: "Higher engagement than traditional email marketing",
        },
        {
          number: "67%",
          label: "Share Rate",
          description: "Recipients forward giveaway emails to friends",
        },
      ]}
      features={[
        {
          icon: <TrendingUp className="w-8 h-8 text-[#FFAF40]" />,
          title: "High-Engagement Content",
          description: "Giveaway announcements naturally generate excitement and encourage opens and clicks.",
        },
        {
          icon: <Users className="w-8 h-8 text-[#FFAF40]" />,
          title: "List Growth Acceleration",
          description: "Grow your email list faster with compelling giveaway opt-ins and referral mechanics.",
        },
        {
          icon: <Zap className="w-8 h-8 text-[#FFAF40]" />,
          title: "Re-engagement Campaigns",
          description: "Win back inactive subscribers with exciting giveaway opportunities they can't ignore.",
        },
      ]}
      testimonial={{
        quote:
          "Our email open rates went from 22% to 89% with giveaway campaigns. It completely transformed our email marketing.",
        author: "Mike Johnson",
        role: "Email Marketing Manager",
        company: "E-commerce Store",
        image: "/images/testimonial-man-2.png",
        result: "+67% open rate increase",
      }}
      caseStudy={{
        title: "How RetailPlus Revived Their Email List",
        description:
          "An online retailer used giveaways to re-engage 15,000 inactive subscribers and boost overall email performance.",
        results: [
          "89% open rate on giveaway announcement emails",
          "15,000 inactive subscribers re-engaged",
          "3.2x increase in email-driven revenue",
          "45% growth in email list size in 6 months",
        ],
      }}
    />
  )
}
