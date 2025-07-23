import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CheckCircle, ArrowRight } from "lucide-react";

const SimpleHero = () => {
  const navigate = useNavigate();

  console.log('SimpleHero rendering...');

  return (
    <section className="min-h-screen flex items-center justify-center bg-background">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-muted rounded-full mb-8">
            <CheckCircle className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Trusted by 10,000+ Professional Truckers</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-foreground">
            IFTA Made
            <span className="block text-primary">Simple & Smart</span>
          </h1>

          <p className="text-xl md:text-2xl mb-8 text-muted-foreground max-w-3xl mx-auto">
            Track mileage, calculate taxes, and manage quarterly returns with ease. 
            Built by truckers, for truckers. Your road to IFTA compliance starts here.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-10">
            {[
              "State-by-State Calculations",
              "Receipt Scanning", 
              "Quarterly Returns"
            ].map((feature) => (
              <div key={feature} className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="text-lg px-8 py-4 h-14"
              onClick={() => navigate('/auth')}
            >
              Start 7-Day Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-4 h-14"
              onClick={() => navigate('/demo')}
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SimpleHero;