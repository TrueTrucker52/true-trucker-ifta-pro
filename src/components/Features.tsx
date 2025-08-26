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
      icon: MapPin,
      title: "Smart Location System",
      description: "Auto-complete pickup/delivery locations with 100+ trucking destinations. Instant state detection for IFTA compliance."
    },
    {
      icon: Calculator,
      title: "Advanced IFTA Calculator",
      description: "Includes Kentucky KYU Weight Distance Tax calculation. Complete state-by-state breakdown with tax rates and multi-state route detection."
    },
    {
      icon: Receipt,
      title: "Professional Trip Management", 
      description: "Edit trips, modify dates, delete entries. Perfect for drivers running 2-7+ loads per week with complete trip control."
    },
    {
      icon: Calendar,
      title: "Enhanced Date Management",
      description: "Interactive calendar picker for easy date corrections. Log trips after the fact with flexible date editing capabilities."
    },
    {
      icon: Smartphone,
      title: "Mobile & Desktop Optimized",
      description: "Access your data anywhere - optimized for mobile, tablet, and desktop use with real-time synchronization."
    },
    {
      icon: Shield,
      title: "Kentucky KYU Compliance",
      description: "Automatic Weight Distance Tax calculation for Kentucky routes. Separate tracking and reporting for KYU requirements."
    },
    {
      icon: Clock,
      title: "Real-Time Location Intelligence", 
      description: "Auto-complete from 100+ truck stops, ports, and distribution centers. Instant state detection and multi-state route alerts."
    },
    {
      icon: FileText,
      title: "Complete Trip Editing",
      description: "Edit any trip detail after logging. Change dates, locations, mileage - perfect for drivers logging trips after delivery."
    },
    {
      icon: TrendingUp,
      title: "Advanced Route Analytics",
      description: "Track pickup/delivery patterns, multi-state routes, and fuel efficiency across your regular routes and customers."
    },
    {
      icon: Zap,
      title: "Professional Driver Tools",
      description: "Built for drivers running 2-7+ loads per week. Bulk editing, date management, and trucking-specific location database."
    },
    {
      icon: Users,
      title: "Fleet & Multi-Vehicle",
      description: "Manage multiple trucks with individual trip tracking, vehicle-specific reporting, and consolidated IFTA calculations."
    },
    {
      icon: Award,
      title: "Trucker-First Design",
      description: "Designed by truckers, for truckers. Every feature built for real-world trucking workflows and IFTA compliance needs."
    },
    {
      icon: FileText,
      title: "BOL Management & Scanning",
      description: "Scan Bills of Lading with OCR, track pickup/delivery dates, print professional BOL reports, and manage load documents digitally."
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
            Professional Trucking Tools for
            <span className="block text-primary">Real Drivers</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Smart location auto-complete, trip editing, Kentucky KYU compliance, and professional-grade IFTA management tools designed for active drivers.
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
            <h3 className="text-2xl font-bold text-foreground mb-2">Smart Pickup & Delivery Tracking</h3>
            <p className="text-muted-foreground">Auto-complete trucking locations, detect multi-state routes, and track Kentucky KYU compliance automatically</p>
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