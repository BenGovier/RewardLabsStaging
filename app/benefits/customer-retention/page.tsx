import BenefitPageLayout from "@/components/benefit-page-layout"
import { Award, Heart, RefreshCw, TrendingUp } from "lucide-react"

export default function CustomerRetentionPage() {
  return (
    <BenefitPageLayout
      title="Increase Customer Retention"
      subtitle="Keep customers engaged and coming back with regular giveaways that reward loyalty and create lasting connections."
      heroIcon={<Award className="w-12 h-12 text-white" />}
      heroColor="from-[#009FFD] to-[#007ACC]"
      stats={[
        {
          number: "34%",
          label: "Retention Rate Increase",
          description: "Customers stay longer when regularly engaged",
        },
        {
          number: "2.8x",
          label: "Purchase Frequency",
          description: "Giveaway participants buy more often",
        },
        {
          number: "£890",
          label: "Increased Customer LTV",
          description: "Higher lifetime value from engaged customers",
        },
      ]}
      features={[
        {
          icon: <Heart className="w-8 h-8 text-[#009FFD]" />,
          title: "Loyalty Rewards",
          description: "Show appreciation for existing customers with exclusive giveaways and VIP treatment.",
        },
        {
          icon: <RefreshCw className="w-8 h-8 text-[#009FFD]" />,
          title: "Regular Engagement",
          description: "Keep your brand top-of-mind with monthly giveaways that customers look forward to.",
        },
        {
          icon: <TrendingUp className="w-8 h-8 text-[#009FFD]" />,
          title: "Retention Analytics",
          description: "Track customer engagement and identify at-risk customers before they churn.",
        },
      ]}
      testimonial={{
        quote:
          "Our customer retention improved by 34% after implementing monthly giveaways. Customers love the surprises!",
        author: "Emma Thompson",
        role: "Customer Success Manager",
        company: "Subscription Box Service",
        image: "/images/testimonial-woman-1.png",
        result: "+34% retention rate",
      }}
      caseStudy={{
        title: "How HealthPlus Reduced Churn by 45%",
        description:
          "A health supplement company used targeted giveaways to re-engage customers and prevent cancellations.",
        results: [
          "45% reduction in customer churn rate",
          "2.8x increase in repeat purchase frequency",
          "£890 average increase in customer lifetime value",
          "78% of at-risk customers re-engaged through giveaways",
        ],
      }}
    />
  )
}
