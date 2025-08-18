import BenefitPageLayout from "@/components/benefit-page-layout"
import { CheckCircle, Shield, Mail, Users } from "lucide-react"

export default function MarketingConsentPage() {
  return (
    <BenefitPageLayout
      title="Renew Marketing Consents"
      subtitle="Stay GDPR compliant while re-engaging customers. Get fresh consent for marketing communications through exciting giveaway opportunities."
      heroIcon={<CheckCircle className="w-12 h-12 text-white" />}
      heroColor="from-[#FFAF40] to-[#FF9500]"
      stats={[
        {
          number: "87%",
          label: "Consent Renewal Rate",
          description: "Customers happily opt-in for giveaway updates",
        },
        {
          number: "15,000",
          label: "Consents Renewed Monthly",
          description: "Average fresh consents collected per campaign",
        },
        {
          number: "100%",
          label: "GDPR Compliance",
          description: "Fully compliant consent collection process",
        },
      ]}
      features={[
        {
          icon: <Shield className="w-8 h-8 text-[#FFAF40]" />,
          title: "GDPR Compliant Process",
          description: "Collect marketing consent the right way with clear opt-ins and transparent data usage.",
        },
        {
          icon: <Mail className="w-8 h-8 text-[#FFAF40]" />,
          title: "Re-engagement Campaigns",
          description: "Win back customers who've unsubscribed with compelling giveaway opportunities.",
        },
        {
          icon: <Users className="w-8 h-8 text-[#FFAF40]" />,
          title: "Consent Management",
          description: "Track and manage customer consent preferences with built-in compliance tools.",
        },
      ]}
      testimonial={{
        quote:
          "We renewed marketing consent for 15,000 customers in 3 months. Our email list is now fully compliant and engaged.",
        author: "James Wilson",
        role: "Data Protection Officer",
        company: "Financial Services",
        image: "/images/testimonial-man-1.png",
        result: "+15,000 renewed consents",
      }}
      caseStudy={{
        title: "How TravelCorp Rebuilt Their Email List Compliantly",
        description:
          "A travel company used giveaways to collect fresh marketing consent from 50,000 existing customers.",
        results: [
          "50,000 customers provided fresh marketing consent",
          "87% consent renewal rate through giveaways",
          "100% GDPR compliance maintained",
          "£2.1M in revenue from re-engaged customers",
        ],
      }}
    />
  )
}
