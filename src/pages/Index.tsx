import LandingHeader from "@/components/landing/LandingHeader";
import HeroSection from "@/components/landing/HeroSection";
import PainPointsSection from "@/components/landing/PainPointsSection";
import FeaturesShowcase from "@/components/landing/FeaturesShowcase";
import HowItWorks from "@/components/landing/HowItWorks";
import CompetitorComparison from "@/components/landing/CompetitorComparison";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import PricingSection from "@/components/landing/PricingSection";
import LaunchOfferBanner from "@/components/landing/LaunchOfferBanner";
import FAQSection from "@/components/landing/FAQSection";
import FinalCTA from "@/components/landing/FinalCTA";
import LandingFooter from "@/components/landing/LandingFooter";

const Index = () => {
  return (
    <>
      <LandingHeader />
      <HeroSection />
      <PainPointsSection />
      <FeaturesShowcase />
      <HowItWorks />
      <CompetitorComparison />
      <TestimonialsSection />
      <PricingSection />
      <LaunchOfferBanner />
      <FAQSection />
      <FinalCTA />
      <LandingFooter />

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "SoftwareApplication",
                name: "TrueTrucker IFTA Pro",
                applicationCategory: "BusinessApplication",
                operatingSystem: "Android, iOS, Web",
                description:
                  "Automate IFTA filing, track miles by state, scan BOLs, and stay ELD compliant. Built for truck drivers.",
                offers: {
                  "@type": "AggregateOffer",
                  lowPrice: "39",
                  highPrice: "199",
                  priceCurrency: "USD",
                  offerCount: 4,
                },
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: "4.9",
                  reviewCount: "500",
                  bestRating: "5",
                },
              },
              {
                "@type": "FAQPage",
                mainEntity: [
                  {
                    "@type": "Question",
                    name: "Do I need a credit card to start?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "No! Start your 7-day free trial with just your email address.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Is TrueTrucker ELD FMCSA certified?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Yes. TrueTrucker meets all FMCSA 49 CFR Part 395 requirements.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Can I cancel anytime?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Yes. Cancel anytime with no fees. 30-day money-back guarantee included.",
                    },
                  },
                ],
              },
            ],
          }),
        }}
      />
    </>
  );
};

export default Index;
