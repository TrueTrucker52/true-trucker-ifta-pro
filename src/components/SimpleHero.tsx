import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CheckCircle, ArrowRight, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedStatistics } from "./AnimatedStatistics";
import heroTruck from "@/assets/hero-truck.jpg";

const SimpleHero = () => {
  const navigate = useNavigate();

  console.log('SimpleHero rendering...');

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Hero Truck Background */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105"
          style={{
            backgroundImage: `url(${heroTruck})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/85 via-background/60 to-background/85" />
        
        {/* Animated Floating Elements */}
        <div className="absolute top-20 left-10 animate-bounce">
          <div className="w-4 h-4 bg-primary/40 rounded-full blur-sm" />
        </div>
        <div className="absolute top-40 right-20 animate-pulse">
          <div className="w-6 h-6 bg-secondary/50 rounded-full blur-sm" />
        </div>
        <div className="absolute bottom-40 left-20 animate-bounce delay-1000">
          <div className="w-3 h-3 bg-accent/60 rounded-full blur-sm" />
        </div>
        <div className="absolute top-60 right-40 animate-pulse delay-500">
          <div className="w-5 h-5 bg-primary/30 rounded-full blur-sm" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
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

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button 
              variant="hero"
              size="lg" 
              className="text-lg px-8 py-4 h-14"
              onClick={() => navigate('/demo')}
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="premium"
              size="lg" 
              className="text-lg px-8 py-4 h-14"
              onClick={() => {
                console.log('🛒 Order Now button clicked - scrolling to pricing');
                const pricingElement = document.getElementById('pricing');
                if (pricingElement) {
                  pricingElement.scrollIntoView({ behavior: 'smooth' });
                } else {
                  navigate('/#pricing');
                }
              }}
            >
              Order Now
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

          {/* Animated 2D Truck */}
          <div className="mb-12 flex justify-center">
            <motion.div
              className="relative p-8 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl"
              animate={{ 
                scale: [1, 1.05, 1],
                rotateY: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <motion.div
                animate={{ 
                  x: [0, 20, -20, 0],
                  rotate: [0, 2, -2, 0]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Truck className="h-24 w-24 text-primary" />
              </motion.div>
              
              {/* Animated road lines */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent">
                <motion.div
                  className="h-full w-8 bg-primary"
                  animate={{ x: [-32, 300] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </motion.div>
          </div>

          {/* Statistics */}
          <AnimatedStatistics />
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="animate-bounce">
          <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-primary rounded-full animate-pulse mt-2" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SimpleHero;