import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Truck, Building2, Calculator, Users, MapPin, Clock, Star, Download, Play } from 'lucide-react';
import { motion } from 'framer-motion';

interface AudienceConfig {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  hero: {
    headline: string;
    subheadline: string;
    cta: string;
    image: string;
  };
  features: string[];
  testimonial: {
    text: string;
    author: string;
    role: string;
  };
  pricing: {
    highlight: string;
    offer: string;
  };
}

const audienceConfigs: AudienceConfig[] = [
  {
    id: 'owner-operators',
    name: 'Independent Owner-Operators',
    icon: <Truck className="h-5 w-5" />,
    color: 'from-blue-600 to-blue-800',
    hero: {
      headline: 'Stop Losing Money on IFTA Paperwork',
      subheadline: 'Spend more time driving, less time on compliance. Automatic tracking, instant reports, maximum deductions.',
      cta: 'Start Free Trial - No Credit Card Required',
      image: 'hero-truck.jpg'
    },
    features: [
      'Automatic mileage tracking across all states',
      'Snap photos of receipts - OCR does the rest',
      'Generate quarterly reports in under 5 minutes',
      'Never miss a fuel tax deduction again'
    ],
    testimonial: {
      text: "Saved me 12 hours last quarter and found $400 in missed deductions. This app pays for itself.",
      author: "Mike Rodriguez",
      role: "Owner-Operator, 15 years"
    },
    pricing: {
      highlight: "ROI Guarantee",
      offer: "Save 10+ hours per quarter or your money back"
    }
  },
  {
    id: 'fleet-managers',
    name: 'Fleet Managers',
    icon: <Building2 className="h-5 w-5" />,
    color: 'from-green-600 to-green-800',
    hero: {
      headline: 'Scale IFTA Compliance Across Your Fleet',
      subheadline: 'Centralized dashboard, automated reporting, driver compliance monitoring. Perfect for fleets of 5-500+ trucks.',
      cta: 'Schedule Fleet Demo - See ROI Calculator',
      image: 'hero-truck.jpg'
    },
    features: [
      'Multi-driver fleet dashboard with real-time insights',
      'Consolidated IFTA reporting for entire fleet',
      'Driver compliance scoring and alerts',
      'Bulk receipt processing and validation'
    ],
    testimonial: {
      text: "Reduced our IFTA admin costs by 75% and eliminated compliance issues. ROI was immediate.",
      author: "Sarah Chen",
      role: "Fleet Operations Manager"
    },
    pricing: {
      highlight: "Volume Discounts",
      offer: "Starting at $15/truck/month for 10+ vehicles"
    }
  },
  {
    id: 'accounting-firms',
    name: 'Accounting Professionals',
    icon: <Calculator className="h-5 w-5" />,
    color: 'from-purple-600 to-purple-800',
    hero: {
      headline: 'Professional IFTA Tools for CPAs',
      subheadline: 'Serve more trucking clients with less effort. White-label reports, multi-client management, audit trails.',
      cta: 'Request Professional Demo - CPA Pricing',
      image: 'hero-truck.jpg'
    },
    features: [
      'Multi-client dashboard with branded reports',
      'Professional audit documentation tools',
      'Integration with QuickBooks and other accounting software',
      'Advanced tax optimization algorithms'
    ],
    testimonial: {
      text: "Doubled our trucking client capacity without hiring additional staff. The ROI is incredible.",
      author: "David Thompson, CPA",
      role: "Managing Partner, Thompson & Associates"
    },
    pricing: {
      highlight: "Professional Pricing",
      offer: "Special rates for CPAs and accounting firms"
    }
  },
  {
    id: 'new-drivers',
    name: 'New Drivers',
    icon: <Users className="h-5 w-5" />,
    color: 'from-orange-600 to-orange-800',
    hero: {
      headline: 'Get IFTA Right From Day One',
      subheadline: 'New to trucking? Avoid costly mistakes with beginner-friendly tools and step-by-step guidance.',
      cta: 'Start Learning - Free New Driver Guide',
      image: 'hero-truck.jpg'
    },
    features: [
      'Beginner-friendly interface with tutorials',
      'IFTA education center with video guides',
      'Mistake prevention alerts and warnings',
      'Direct support from IFTA compliance experts'
    ],
    testimonial: {
      text: "As a new driver, this app taught me everything about IFTA and kept me compliant from day one.",
      author: "Jennifer Adams",
      role: "CDL Driver, 6 months"
    },
    pricing: {
      highlight: "New Driver Special",
      offer: "50% off first year + free compliance consultation"
    }
  }
];

export default function AudienceTargetedLanding() {
  const [selectedAudience, setSelectedAudience] = useState(audienceConfigs[0]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Audience Selector */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto text-center mb-8">
          <h1 className="text-2xl font-semibold mb-4">Audience-Targeted Landing Pages</h1>
          <Select value={selectedAudience.id} onValueChange={(value) => {
            const config = audienceConfigs.find(c => c.id === value);
            if (config) setSelectedAudience(config);
          }}>
            <SelectTrigger className="w-full max-w-md mx-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {audienceConfigs.map((config) => (
                <SelectItem key={config.id} value={config.id}>
                  <div className="flex items-center gap-2">
                    {config.icon}
                    {config.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Dynamic Landing Page Content */}
        <motion.div
          key={selectedAudience.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-12"
        >
          {/* Hero Section */}
          <section className={`relative bg-gradient-to-r ${selectedAudience.color} text-white rounded-2xl overflow-hidden`}>
            <div className="relative px-8 py-12 lg:py-20">
              <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    {selectedAudience.icon}
                    <Badge variant="secondary" className="text-white bg-white/20">
                      {selectedAudience.name}
                    </Badge>
                  </div>
                  <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                    {selectedAudience.hero.headline}
                  </h2>
                  <p className="text-xl text-white/90 leading-relaxed">
                    {selectedAudience.hero.subheadline}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                      <Play className="mr-2 h-5 w-5" />
                      {selectedAudience.hero.cta}
                    </Button>
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                      <Download className="mr-2 h-5 w-5" />
                      Download App
                    </Button>
                  </div>
                </div>
                <div className="relative">
                  <div className="aspect-square bg-white/10 rounded-2xl flex items-center justify-center">
                    <Truck className="h-24 w-24 text-white/50" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-12">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-3xl font-bold text-center mb-12">
                Built Specifically for {selectedAudience.name}
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                {selectedAudience.features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div className={`bg-gradient-to-r ${selectedAudience.color} w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white font-bold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-lg font-medium text-foreground">
                        {feature}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonial Section */}
          <section className="py-12">
            <div className="max-w-4xl mx-auto">
              <Card className="border-2">
                <CardContent className="p-8">
                  <div className="flex items-center gap-2 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="text-xl italic text-muted-foreground mb-6">
                    "{selectedAudience.testimonial.text}"
                  </blockquote>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {selectedAudience.testimonial.author.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold">{selectedAudience.testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">{selectedAudience.testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Pricing Section */}
          <section className="py-12">
            <div className="max-w-2xl mx-auto">
              <Card className={`border-2 bg-gradient-to-r ${selectedAudience.color} text-white`}>
                <CardHeader className="text-center">
                  <Badge className="w-fit mx-auto mb-4 bg-white/20 text-white">
                    {selectedAudience.pricing.highlight}
                  </Badge>
                  <CardTitle className="text-2xl">Special Offer</CardTitle>
                  <CardDescription className="text-white/90 text-lg">
                    {selectedAudience.pricing.offer}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 w-full">
                    Claim This Offer Now
                  </Button>
                  <p className="text-sm text-white/70 mt-4">
                    30-day money-back guarantee • No setup fees • Cancel anytime
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}