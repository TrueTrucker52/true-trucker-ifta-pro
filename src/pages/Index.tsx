import Header from "@/components/Header";
import SimpleHero from "@/components/SimpleHero";
import Features from "@/components/Features";
import { CompetitiveAdvantages } from "@/components/CompetitiveAdvantages";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

const Index = () => {
  console.log('Index page rendering...');
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SimpleHero />
      <Features />
      <CompetitiveAdvantages />
      <Pricing />
      <Footer />
    </div>
  );
};

export default Index;
