import Header from "@/components/Header";
import { TrialBanner } from "@/components/TrialBanner";
import SimpleHero from "@/components/SimpleHero";
import Features from "@/components/Features";
import { CompetitiveAdvantages } from "@/components/CompetitiveAdvantages";
import TrustBuilders from "@/components/TrustBuilders";
import Pricing from "@/components/Pricing";
import ContactSection from "@/components/ContactSection";
import SupportBot from "@/components/SupportBot";
import Footer from "@/components/Footer";

const Index = () => {
  console.log('Index page rendering...');
  
  return (
    <>
      <Header />
      <TrialBanner />
      <SimpleHero />
      <Features />
      <CompetitiveAdvantages />
      <TrustBuilders />
      <Pricing />
      <ContactSection />
      <Footer />
      <SupportBot />
    </>
  );
};

export default Index;