import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Truck, Building2, Calculator, Users, MapPin, Clock } from 'lucide-react';

interface StoreListingContent {
  audience: string;
  icon: React.ReactNode;
  title: string;
  shortDescription: string;
  fullDescription: string;
  keyFeatures: string[];
  valueProposition: string;
  targetPain: string;
  callToAction: string;
  keywords: string[];
  screenshots: string[];
}

const storeListings: StoreListingContent[] = [
  {
    audience: 'owner-operators',
    icon: <Truck className="h-6 w-6" />,
    title: 'TrueTrucker IFTA Pro - For Independent Drivers',
    shortDescription: 'Simplify IFTA compliance and maximize your profits as an owner-operator',
    fullDescription: 'Take control of your IFTA reporting with TrueTrucker Pro. Designed specifically for independent owner-operators who need accurate, efficient fuel tax reporting without the complexity. Track miles, manage receipts, and generate compliant reports in minutes, not hours.',
    keyFeatures: [
      'Automatic mileage tracking across all 48 states',
      'Receipt scanning with OCR technology',
      'Quarterly IFTA report generation',
      'Fuel tax calculations for maximum deductions',
      'Trip-based expense tracking',
      'Simple dashboard for quick insights'
    ],
    valueProposition: 'Save 10+ hours per quarter on IFTA paperwork and never miss a deduction again',
    targetPain: 'Tired of spending weekends doing IFTA paperwork instead of driving?',
    callToAction: 'Start Your Free Trial - Get Back to Driving',
    keywords: ['owner operator', 'independent trucker', 'IFTA', 'fuel tax', 'mileage tracking'],
    screenshots: ['app-screenshot-1.jpg', 'app-screenshot-2.jpg']
  },
  {
    audience: 'fleet-managers',
    icon: <Building2 className="h-6 w-6" />,
    title: 'TrueTrucker IFTA Pro - Fleet Management Solution',
    shortDescription: 'Streamline IFTA compliance for your entire fleet with centralized reporting',
    fullDescription: 'Manage IFTA compliance across your entire fleet with powerful centralized tools. Monitor driver compliance, generate consolidated reports, and ensure audit readiness for fleets of any size. Reduce administrative overhead while maintaining perfect compliance records.',
    keyFeatures: [
      'Multi-driver fleet dashboard',
      'Consolidated IFTA reporting',
      'Driver compliance monitoring',
      'Bulk receipt processing',
      'Audit trail management',
      'Fleet-wide analytics and insights',
      'Role-based access controls',
      'Integration with fleet management systems'
    ],
    valueProposition: 'Reduce fleet IFTA administration time by 75% while ensuring 100% compliance',
    targetPain: 'Managing IFTA for multiple drivers is eating into your operational efficiency?',
    callToAction: 'Request Fleet Demo - See ROI Calculator',
    keywords: ['fleet management', 'trucking company', 'IFTA compliance', 'multi-driver', 'fleet reporting'],
    screenshots: ['app-screenshot-1.jpg', 'app-screenshot-3.jpg']
  },
  {
    audience: 'accounting-firms',
    icon: <Calculator className="h-6 w-6" />,
    title: 'TrueTrucker IFTA Pro - For Trucking Accountants',
    shortDescription: 'Professional IFTA preparation tools for accounting firms serving truckers',
    fullDescription: 'Serve your trucking clients more efficiently with professional-grade IFTA tools. Generate audit-ready reports, manage multiple client accounts, and provide value-added services that differentiate your firm in the trucking industry.',
    keyFeatures: [
      'Multi-client account management',
      'Professional report templates',
      'Audit documentation tools',
      'Client portal access',
      'Branded reports for your firm',
      'Advanced tax optimization features',
      'Integration with accounting software',
      'Compliance validation tools'
    ],
    valueProposition: 'Increase your trucking client capacity by 200% without adding staff',
    targetPain: 'IFTA preparation is taking too much time away from higher-value services?',
    callToAction: 'Schedule Professional Demo - CPA Pricing Available',
    keywords: ['accounting firm', 'CPA', 'trucking accountant', 'IFTA preparation', 'professional tools'],
    screenshots: ['app-screenshot-2.jpg', 'app-screenshot-3.jpg']
  },
  {
    audience: 'new-drivers',
    icon: <Users className="h-6 w-6" />,
    title: 'TrueTrucker IFTA Pro - New Driver Edition',
    shortDescription: 'Learn IFTA compliance the right way from day one of your trucking career',
    fullDescription: 'Starting your trucking career? Get IFTA compliance right from the beginning. Our beginner-friendly interface includes educational content, step-by-step guidance, and built-in compliance checks to help new drivers avoid costly mistakes.',
    keyFeatures: [
      'Beginner-friendly interface',
      'IFTA education center',
      'Step-by-step compliance guides',
      'Mistake prevention alerts',
      'Basic expense tracking',
      'Simple reporting tools',
      'Getting started tutorials',
      'Customer support for new drivers'
    ],
    valueProposition: 'Avoid the #1 mistake new truckers make - poor IFTA record keeping',
    targetPain: 'Confused about IFTA requirements and worried about making expensive mistakes?',
    callToAction: 'Start Learning - Free New Driver Guide',
    keywords: ['new truck driver', 'CDL', 'beginner trucker', 'IFTA basics', 'trucking startup'],
    screenshots: ['app-screenshot-1.jpg', 'app-screenshot-2.jpg']
  },
  {
    audience: 'regional-haulers',
    icon: <MapPin className="h-6 w-6" />,
    title: 'TrueTrucker IFTA Pro - Regional Specialists',
    shortDescription: 'Optimized for regional and local haulers with multi-state operations',
    fullDescription: 'Perfect for regional haulers who cross state lines regularly. Track complex multi-state routes, optimize fuel stops for tax efficiency, and manage the unique compliance challenges of regional operations with specialized tools.',
    keyFeatures: [
      'Regional route optimization',
      'Multi-state fuel stop planning',
      'Regional compliance tracking',
      'Local fuel price integration',
      'Short-haul mileage tracking',
      'State-specific tax calculations',
      'Regional carrier tools',
      'Local regulation updates'
    ],
    valueProposition: 'Maximize fuel tax savings on regional routes with smart stop planning',
    targetPain: 'Regional routes make IFTA tracking complex and fuel tax optimization difficult?',
    callToAction: 'Try Regional Tools - Route Optimizer Included',
    keywords: ['regional trucking', 'multi-state hauling', 'local delivery', 'regional carrier', 'short haul'],
    screenshots: ['app-screenshot-2.jpg', 'app-screenshot-3.jpg']
  },
  {
    audience: 'experienced-drivers',
    icon: <Clock className="h-6 w-6" />,
    title: 'TrueTrucker IFTA Pro - Veteran Driver Tools',
    shortDescription: 'Advanced features for experienced drivers who demand precision and efficiency',
    fullDescription: 'Built for veteran drivers who know exactly what they need. Advanced analytics, customizable reports, API integrations, and power-user features that give experienced professionals complete control over their IFTA compliance.',
    keyFeatures: [
      'Advanced analytics dashboard',
      'Custom report builder',
      'API integrations',
      'Historical data analysis',
      'Tax optimization algorithms',
      'Bulk data import/export',
      'Advanced filtering options',
      'Professional compliance tools'
    ],
    valueProposition: 'Leverage 10+ years of driving experience with data-driven IFTA optimization',
    targetPain: 'Basic IFTA tools lack the advanced features you need for complex operations?',
    callToAction: 'Upgrade to Pro - Advanced Features Included',
    keywords: ['experienced trucker', 'veteran driver', 'advanced IFTA', 'professional tools', 'power user'],
    screenshots: ['app-screenshot-1.jpg', 'app-screenshot-3.jpg']
  }
];

export default function StoreListings() {
  const [selectedListing, setSelectedListing] = useState(storeListings[0]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Custom Store Listings</h1>
        <p className="text-muted-foreground text-lg">
          Tailored content for different trucking industry audiences
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Audience Selector */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Target Audiences</CardTitle>
              <CardDescription>
                Select an audience to view customized store listing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {storeListings.map((listing) => (
                  <Button
                    key={listing.audience}
                    variant={selectedListing.audience === listing.audience ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setSelectedListing(listing)}
                  >
                    {listing.icon}
                    <span className="ml-2 capitalize">
                      {listing.audience.replace('-', ' ')}
                    </span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selected Listing Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                {selectedListing.icon}
                <div>
                  <CardTitle className="text-xl">{selectedListing.title}</CardTitle>
                  <CardDescription>{selectedListing.shortDescription}</CardDescription>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedListing.keywords.map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="features">Features</TabsTrigger>
                  <TabsTrigger value="messaging">Messaging</TabsTrigger>
                  <TabsTrigger value="metadata">Metadata</TabsTrigger>
                </TabsList>

                <TabsContent value="description" className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Full Description</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedListing.fullDescription}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Value Proposition</h4>
                    <p className="text-primary font-medium">
                      {selectedListing.valueProposition}
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="features" className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3">Key Features</h4>
                    <ul className="space-y-2">
                      {selectedListing.keyFeatures.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="messaging" className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Target Pain Point</h4>
                    <p className="text-destructive font-medium">
                      {selectedListing.targetPain}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Call to Action</h4>
                    <Button size="lg" className="w-full">
                      {selectedListing.callToAction}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="metadata" className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">SEO Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedListing.keywords.map((keyword) => (
                        <Badge key={keyword} variant="outline">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Recommended Screenshots</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedListing.screenshots.map((screenshot, index) => (
                        <div key={index} className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                          <span className="text-sm text-muted-foreground">{screenshot}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Export Options */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Export & Implementation</CardTitle>
          <CardDescription>
            Use these customized listings across different platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Button variant="outline" className="w-full">
              Export Google Play Listing
            </Button>
            <Button variant="outline" className="w-full">
              Export App Store Listing
            </Button>
            <Button variant="outline" className="w-full">
              Generate Marketing Copy
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}