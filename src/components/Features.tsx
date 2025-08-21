import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calculator, 
  MapPin, 
  Receipt, 
  Calendar, 
  Smartphone, 
  Shield, 
  Clock, 
  FileText,
  TrendingUp,
  Zap,
  Users,
  Award,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import RouteMap from "./RouteMap";
import { ReceiptScanAnimation } from "./ReceiptScanAnimation";
import { InteractiveStateMap } from "./InteractiveStateMap";

const Features = () => {
  const navigate = useNavigate();
  const features = [
    {
      icon: Calculator,
      title: "Smart IFTA Calculations",
      description: "Automatically calculate fuel taxes for all IFTA states with precision and accuracy."
    },
    {
      icon: MapPin,
      title: "State-by-State Tracking",
      description: "Track mileage and fuel purchases across all 48 contiguous states and Canadian provinces."
    },
    {
      icon: Receipt,
      title: "Receipt Scanning",
      description: "Scan and digitize fuel receipts instantly with advanced OCR technology."
    },
    {
      icon: Calendar,
      title: "Quarterly Returns",
      description: "Generate and submit quarterly IFTA returns with automated calculations and due date reminders."
    },
    {
      icon: Smartphone,
      title: "Mobile & Desktop",
      description: "Access your data anywhere - optimized for mobile, tablet, and desktop use."
    },
    {
      icon: Shield,
      title: "Secure & Compliant",
      description: "Bank-level security with full IFTA compliance and audit-ready reports."
    },
    {
      icon: Clock,
      title: "Real-Time Sync",
      description: "All your data syncs across devices in real-time, so you're always up to date."
    },
    {
      icon: FileText,
      title: "Detailed Reports",
      description: "Generate comprehensive reports for accounting, tax preparation, and record keeping."
    },
    {
      icon: TrendingUp,
      title: "Fuel Analytics",
      description: "Track fuel efficiency, costs, and trends to optimize your operations."
    },
    {
      icon: Zap,
      title: "Quick Entry",
      description: "Log trips and fuel purchases in seconds with our streamlined interface."
    },
    {
      icon: Users,
      title: "Fleet Management",
      description: "Manage multiple trucks and drivers from a single, unified dashboard."
    },
    {
      icon: Award,
      title: "Expert Support",
      description: "Get help from IFTA experts and fellow truckers in our community."
    }
  ];

  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Everything You Need for
            <span className="block text-primary">IFTA Success</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Built specifically for professional truckers who need reliable, accurate, and easy-to-use IFTA management.
          </p>
        </motion.div>

        {/* Route Visualization Demo */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-2">Origin to Destination Tracking</h3>
            <p className="text-muted-foreground">Visualize your routes with real-time mileage and fuel stop tracking across IFTA states</p>
          </div>
          <RouteMap />
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <Card 
                className="border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg group h-full"
              >
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="bg-gradient-primary p-3 rounded-lg"
                    >
                      <feature.icon className="h-6 w-6 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {feature.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Receipt Scanning Demo */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-foreground mb-4">Smart Receipt Processing</h3>
              <p className="text-muted-foreground mb-6 text-lg">
                Upload receipts and watch our AI extract fuel purchase data automatically. 
                No more manual data entry - just scan and go!
              </p>
              <div className="space-y-3">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="flex items-center"
                >
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-2 bg-primary rounded-full mr-3"
                  />
                  <span className="text-foreground">Automatic OCR text recognition</span>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="flex items-center"
                >
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    className="w-2 h-2 bg-primary rounded-full mr-3"
                  />
                  <span className="text-foreground">Smart data extraction</span>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  viewport={{ once: true }}
                  className="flex items-center"
                >
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    className="w-2 h-2 bg-primary rounded-full mr-3"
                  />
                  <span className="text-foreground">Instant IFTA calculations</span>
                </motion.div>
              </div>
            </div>
            <div className="flex justify-center">
              <ReceiptScanAnimation />
            </div>
          </div>
        </motion.div>

        {/* Interactive State Map */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <InteractiveStateMap />
        </motion.div>

        {/* Call to Action */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="bg-gradient-primary p-8 rounded-2xl text-white">
            <motion.h3 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-2xl font-bold mb-4"
            >
              Ready to Simplify Your IFTA?
            </motion.h3>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-white/90 mb-6 max-w-2xl mx-auto"
            >
              Join thousands of truckers who've already made the switch to TrueTrucker IFTA Pro. 
              Start your free trial today and see the difference.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button 
                size="lg" 
                variant="secondary"
                className="text-lg px-8 py-4 h-14 bg-white text-primary hover:bg-white/90"
                onClick={() => {
                  console.log('🚀 Features Start Free Trial button clicked');
                  navigate('/auth?mode=signup');
                }}
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="premium"
                className="text-lg px-8 py-4 h-14"
                onClick={() => {
                  console.log('🛒 Features Order Now button clicked - scrolling to pricing');
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
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-4 h-14 border-white bg-white/10 text-white hover:bg-white hover:text-primary transition-all duration-300 font-semibold"
                onClick={() => {
                  console.log('💰 View Pricing button clicked');
                  const pricingElement = document.getElementById('pricing');
                  if (pricingElement) {
                    pricingElement.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    navigate('/#pricing');
                  }
                }}
              >
                View Pricing
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;