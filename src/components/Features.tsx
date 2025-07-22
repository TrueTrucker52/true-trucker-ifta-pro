import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Award
} from "lucide-react";

const Features = () => {
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
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Everything You Need for
            <span className="block text-primary">IFTA Success</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Built specifically for professional truckers who need reliable, accurate, and easy-to-use IFTA management.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg group"
            >
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-primary p-3 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-foreground">
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
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-primary p-8 rounded-2xl text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Simplify Your IFTA?</h3>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Join thousands of truckers who've already made the switch to TrueTrucker IFTA Pro. 
              Start your free trial today and see the difference.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;