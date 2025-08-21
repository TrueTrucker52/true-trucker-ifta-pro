import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Edit3, 
  Calendar,
  AlertTriangle,
  Truck,
  CheckCircle,
  ArrowRight,
  Navigation,
  Route,
  MapIcon
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const ProfessionalFeatures = () => {
  const navigate = useNavigate();

  const professionalFeatures = [
    {
      icon: MapPin,
      title: "Smart Location Auto-Complete",
      badge: "NEW",
      highlights: [
        "100+ pre-loaded trucking destinations",
        "Major ports, distribution centers, truck stops",
        "Auto-detect states for IFTA compliance",
        "Format: 'Los Angeles, CA' with instant validation"
      ],
      description: "Type just 2 letters and get instant suggestions for pickup/delivery locations. Built-in database of major trucking hubs, ports, and distribution centers.",
      demoText: "🏁 Pickup: Los Angel... → Los Angeles, CA (Port) ✓"
    },
    {
      icon: Edit3,
      title: "Complete Trip Management",
      badge: "ENHANCED",
      highlights: [
        "Edit any trip detail after logging",
        "Change dates, locations, mileage, notes",
        "Delete incorrect or duplicate entries",
        "Perfect for post-delivery logging"
      ],
      description: "Professional drivers need flexibility. Edit trips when routes change, correct dates when logging after delivery, or update mileage for actual vs. planned routes.",
      demoText: "Edit Mode: Save Changes | Cancel ✏️ 🗑️"
    },
    {
      icon: AlertTriangle,
      title: "Kentucky KYU Compliance",
      badge: "COMPLIANCE",
      highlights: [
        "$0.0285 per mile automatic calculation",
        "Separate from IFTA - tracks independently", 
        "Quarterly reporting reminders",
        "Direct link to Kentucky KYU system"
      ],
      description: "Automatically calculates Kentucky Weight Distance Tax for vehicles over 59,999 lbs. Shows separate KYU obligations that can't be paid through IFTA.",
      demoText: "⚠️ KY KYU Tax: $142.50 (separate reporting required)"
    },
    {
      icon: Calendar,
      title: "Advanced Date Management",
      badge: "FLEXIBLE",
      highlights: [
        "Interactive calendar date picker",
        "Easy date corrections for past trips",
        "Bulk date editing capabilities",
        "Perfect for weekly trip logging"
      ],
      description: "Many drivers log trips weekly or after delivery. Our calendar picker makes it easy to select accurate dates and correct any mistakes.",
      demoText: "📅 Pick a date → Nov 15, 2024 → Save ✅"
    },
    {
      icon: Route,
      title: "Multi-State Route Detection",
      badge: "INTELLIGENT",
      highlights: [
        "Automatically identifies state crossings",
        "Shows pickup and delivery states clearly",
        "Highlights multi-state routes for IFTA",
        "State-by-state mileage breakdown"
      ],
      description: "Instantly see which states your routes cross. Critical for IFTA compliance and helps ensure you're tracking all required state taxes.",
      demoText: "🗺️ Multi-state route (3 states) → CA → AZ → NV"
    },
    {
      icon: Truck,
      title: "Built for Active Drivers",
      badge: "PRO",
      highlights: [
        "Optimized for 2-7+ loads per week",
        "Bulk trip management tools",
        "Professional driver workflows",
        "Real-world trucking scenarios"
      ],
      description: "Every feature designed for working drivers who need efficient, accurate tools that fit their actual workflow - not just basic hobbyist tracking.",
      demoText: "Weekly Summary: 5 loads logged, 2,847 miles, 3 states"
    }
  ];

  return (
    <section id="professional-features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full mb-6">
            <Truck className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Professional Driver Tools</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Built for Real Drivers,
            <span className="block text-primary">Real Workflows</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Advanced features designed for professional drivers running multiple loads per week. 
            Every tool built to handle real-world trucking scenarios and compliance requirements.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {["Smart Auto-Complete", "Trip Editing", "KYU Compliance", "Date Management"].map((feature) => (
              <Badge key={feature} variant="outline" className="px-3 py-1 text-sm">
                ✅ {feature}
              </Badge>
            ))}
          </div>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {professionalFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="h-full"
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <Badge 
                        variant={feature.badge === 'NEW' ? 'default' : feature.badge === 'COMPLIANCE' ? 'destructive' : 'secondary'} 
                        className="text-xs"
                      >
                        {feature.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {/* Demo Preview */}
                    <div className="bg-muted/50 rounded-md p-3 mb-4 font-mono text-sm text-muted-foreground">
                      {feature.demoText}
                    </div>
                    
                    {/* Feature Highlights */}
                    <ul className="space-y-2">
                      {feature.highlights.map((highlight, i) => (
                        <li key={i} className="flex items-start text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Call to Action */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Card className="max-w-4xl mx-auto bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">
                Ready to Experience Professional IFTA Management?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Join thousands of professional drivers who've upgraded from basic tracking to professional-grade IFTA compliance tools.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg"
                  className="px-8 py-3 h-12"
                  onClick={() => navigate('/auth?mode=signup')}
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  className="px-8 py-3 h-12"
                  onClick={() => navigate('/demo')}
                >
                  <MapIcon className="mr-2 h-4 w-4" />
                  Try Live Demo
                </Button>
                <Button 
                  variant="ghost"
                  size="lg"
                  className="px-8 py-3 h-12"
                  onClick={() => {
                    const pricingElement = document.getElementById('pricing');
                    if (pricingElement) {
                      pricingElement.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  View Pricing Plans
                </Button>
              </div>
              
              <div className="mt-6 text-sm text-muted-foreground">
                💳 No credit card required • 📱 Works on all devices • 🔒 Bank-level security
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default ProfessionalFeatures;