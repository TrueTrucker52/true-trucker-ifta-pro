import Header from "@/components/Header";
import SimpleHero from "@/components/SimpleHero";
import Features from "@/components/Features";
import { CompetitiveAdvantages } from "@/components/CompetitiveAdvantages";
import TrustBuilders from "@/components/TrustBuilders";
import Pricing from "@/components/Pricing";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  console.log('Index page rendering...');
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SimpleHero />
      <Features />
      <CompetitiveAdvantages />
      <TrustBuilders />
      <Pricing />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
