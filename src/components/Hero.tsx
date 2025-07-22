import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-truck.jpg";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-secondary/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center text-white">
          {/* Hero Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-8 animate-fade-in">
            <CheckCircle className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Trusted by 10,000+ Professional Truckers</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-up">
            IFTA Made
            <span className="block bg-gradient-sunset bg-clip-text text-transparent">
              Simple & Smart
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto animate-fade-in">
            Track mileage, calculate taxes, and manage quarterly returns with ease. 
            Built by truckers, for truckers. Your road to IFTA compliance starts here.
          </p>

          {/* Feature List */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-10 animate-fade-in">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-success" />
              <span>State-by-State Calculations</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-success" />
              <span>Receipt Scanning</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-success" />
              <span>Quarterly Returns</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
            <Button 
              variant="hero" 
              size="lg" 
              className="text-lg px-8 py-4 h-14"
              onClick={() => navigate('/auth')}
            >
              Start 7-Day Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4 h-14 bg-white/10 border-white/30 text-white hover:bg-white/20">
              Watch Demo
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 text-white/70 animate-fade-in">
            <p className="text-sm mb-4">Join thousands of satisfied truckers</p>
            <div className="flex items-center justify-center space-x-8 opacity-60">
              <div className="text-center">
                <div className="text-2xl font-bold">10K+</div>
                <div className="text-xs">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">$2M+</div>
                <div className="text-xs">IFTA Calculated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">4.9/5</div>
                <div className="text-xs">App Store Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce-gentle">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;