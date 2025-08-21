import BenefitPageLayout from "@/components/benefit-page-layout"
import { Target, Database, BarChart3, Users } from "lucide-react"

export default function CaptureDataPage() {
  return (
    <BenefitPageLayout
      title="Capture Valuable Customer Data"
      subtitle="Go beyond basic contact info. Collect preferences, behaviors, and insights that help you serve customers better."
      heroIcon={<Target className="w-12 h-12 text-white" />}
      heroColor="from-[#2A2A72] to-[#1F1F5C]"
      stats={[
        {
          number: "12+",
          label: "Data Points Per Entry",
          description: "Collect comprehensive customer profiles",
        },
        {
          number: "94%",
          label: "Form Completion Rate",
          description: "Higher completion than standard surveys",
        },
        {
          number: "£2,400",
          label: "Value Per Customer Profile",
          description: "Average lifetime value increase from better data",
        },
      ]}
      features={[
        {
          icon: <Database className="w-8 h-8 text-[#2A2A72]" />,
          title: "Custom Data Collection",
          description: "Design entry forms that capture exactly the customer insights you need for better targeting.",
        },
        {
          icon: <BarChart3 className="w-8 h-8 text-[#2A2A72]" />,
          title: "Behavioral Analytics",
          description: "Track how customers interact with your giveaways to understand preferences and motivations.",
        },
        {
          icon: <Users className="w-8 h-8 text-[#2A2A72]" />,
          title: "Audience Segmentation",
          description:
            "Automatically segment customers based on their responses and behaviors for personalized marketing.",
        },
      ]}
      testimonial={{
        quote:
          "The customer insights we collect through giveaways have transformed our product development and marketing strategy.",
        author: "David Chen",
        role: "Head of Customer Insights",
        company: "SaaS Startup",
        image: "/images/testimonial-man-1.png",
        result: "+340% data collection rate",
      }}
      caseStudy={{
        title: "How FashionForward Built Detailed Customer Profiles",
        description:
          "A fashion retailer used giveaway entry forms to collect style preferences, sizing, and shopping behaviors.",
        results: [
          "25,000 detailed customer profiles created",
          "94% form completion rate vs 31% for surveys",
          "£2.4M increase in personalized product sales",
          "67% improvement in email campaign relevance",
        ],
      }}
    />
  )
}
