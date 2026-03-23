import { lazy, Suspense } from "react";
import LandingHeader from "@/components/landing/LandingHeader";
import HeroSection from "@/components/landing/HeroSection";

// Lazy load below-the-fold sections to reduce initial DOM nodes and JS
const PainPointsSection = lazy(() => import("@/components/landing/PainPointsSection"));
const FeaturesShowcase = lazy(() => import("@/components/landing/FeaturesShowcase"));
const HowItWorks = lazy(() => import("@/components/landing/HowItWorks"));
const CompetitorComparison = lazy(() => import("@/components/landing/CompetitorComparison"));
const TestimonialsSection = lazy(() => import("@/components/landing/TestimonialsSection"));
const PricingSection = lazy(() => import("@/components/landing/PricingSection"));
const LaunchOfferBanner = lazy(() => import("@/components/landing/LaunchOfferBanner"));
const FAQSection = lazy(() => import("@/components/landing/FAQSection"));
const FinalCTA = lazy(() => import("@/components/landing/FinalCTA"));
const LandingFooter = lazy(() => import("@/components/landing/LandingFooter"));

const SectionFallback = () => <div className="py-20" />;

const Index = () => {
  return (
    <>
      <LandingHeader />
      <HeroSection />
      <Suspense fallback={<SectionFallback />}>
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
      </Suspense>

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
                description: "IFTA filing and fleet management app for truck drivers",
                url: "https://true-trucker-ifta-pro.com",
                applicationCategory: "BusinessApplication",
                operatingSystem: "Android, iOS, Web",
                offers: {
                  "@type": "Offer",
                  price: "39.00",
                  priceCurrency: "USD",
                },
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: "4.9",
                  reviewCount: "500",
                  bestRating: "5",
                },
                author: {
                  "@type": "Person",
                  name: "George Williams",
                },
              },
              {
                "@type": "FAQPage",
                mainEntity: [
                  {
                    "@type": "Question",
                    name: "What is IFTA?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "IFTA stands for International Fuel Tax Agreement. It requires commercial truck drivers who operate in multiple states to file quarterly fuel tax reports.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "When is the IFTA deadline?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "IFTA is filed quarterly: Q1 due April 30, Q2 due July 31, Q3 due October 31, Q4 due January 31.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "How much does IFTA filing cost?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "TrueTrucker IFTA Pro starts at $39 per month for solo owner operators with a 7-day free trial.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Is TrueTrucker ELD FMCSA certified?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Yes. TrueTrucker meets all FMCSA 49 CFR Part 395 requirements for electronic logging devices.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Does TrueTrucker work on iPhone?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Yes. TrueTrucker works on iPhone, Android, and desktop computers.",
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
