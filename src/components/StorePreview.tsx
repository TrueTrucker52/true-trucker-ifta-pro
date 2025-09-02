import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Download, Share, Heart, MoreVertical, Smartphone, Monitor } from 'lucide-react';

interface StorePreviewData {
  title: string;
  developer: string;
  category: string;
  rating: number;
  reviews: number;
  downloads: string;
  description: string;
  features: string[];
  screenshots: string[];
  price: string;
  ageRating: string;
  size: string;
  version: string;
}

const audienceData: Record<string, StorePreviewData> = {
  'owner-operators': {
    title: 'TrueTrucker IFTA Pro',
    developer: 'TrueTrucker Solutions',
    category: 'Business',
    rating: 4.8,
    reviews: 2847,
    downloads: '10K+',
    description: 'Stop losing money on IFTA paperwork. Automatic tracking, instant reports, maximum deductions. Built specifically for independent owner-operators who value their time and money.',
    features: [
      'Automatic mileage tracking across all 48 states',
      'Receipt scanning with OCR technology',
      'Quarterly IFTA report generation in under 5 minutes',
      'Never miss a fuel tax deduction again',
      'Trip-based expense tracking',
      'Simple dashboard for quick insights'
    ],
    screenshots: ['Dashboard', 'Receipt Scanner', 'Reports', 'Trip Tracker'],
    price: 'Free with premium features',
    ageRating: '4+',
    size: '47.2 MB',
    version: '2.4.1'
  },
  'fleet-managers': {
    title: 'TrueTrucker Fleet Manager',
    developer: 'TrueTrucker Enterprise',
    category: 'Business',
    rating: 4.9,
    reviews: 892,
    downloads: '5K+',
    description: 'Scale IFTA compliance across your entire fleet. Centralized dashboard, automated reporting, driver compliance monitoring. Perfect for fleets of 5-500+ trucks.',
    features: [
      'Multi-driver fleet dashboard with real-time insights',
      'Consolidated IFTA reporting for entire fleet',
      'Driver compliance scoring and alerts',
      'Bulk receipt processing and validation',
      'Fleet-wide analytics and insights',
      'Role-based access controls'
    ],
    screenshots: ['Fleet Dashboard', 'Driver Management', 'Analytics', 'Compliance Reports'],
    price: 'Contact for pricing',
    ageRating: '4+',
    size: '52.1 MB',
    version: '2.4.1'
  },
  'new-drivers': {
    title: 'TrueTrucker: Learn IFTA',
    developer: 'TrueTrucker Education',
    category: 'Education',
    rating: 4.7,
    reviews: 1523,
    downloads: '15K+',
    description: 'Get IFTA right from day one. Beginner-friendly tools and step-by-step guidance help new drivers avoid costly mistakes and stay compliant from the start.',
    features: [
      'Beginner-friendly interface with tutorials',
      'IFTA education center with video guides',
      'Mistake prevention alerts and warnings',
      'Step-by-step compliance checklists',
      'Direct support from IFTA compliance experts',
      'Free new driver resources and guides'
    ],
    screenshots: ['Tutorial Mode', 'Education Center', 'Guided Setup', 'Help Center'],
    price: 'Free with premium support',
    ageRating: '4+',
    size: '38.9 MB',
    version: '1.8.3'
  }
};

export default function StorePreview() {
  const [selectedAudience, setSelectedAudience] = useState('owner-operators');
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');
  
  const data = audienceData[selectedAudience];

  const GooglePlayPreview = () => (
    <div className={`bg-white rounded-lg overflow-hidden shadow-lg ${viewMode === 'mobile' ? 'max-w-sm' : 'max-w-4xl'} mx-auto`}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">TT</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900">{data.title}</h3>
            <p className="text-sm text-green-600">{data.developer}</p>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1 text-sm">
                <span className="font-medium">{data.rating}</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-3 w-3 ${i < Math.floor(data.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-gray-600">({data.reviews.toLocaleString()})</span>
              </div>
              <span className="text-sm text-gray-600">{data.downloads} downloads</span>
            </div>
          </div>
          <MoreVertical className="h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-b">
        <div className="flex gap-2">
          <Button className="flex-1 bg-green-600 hover:bg-green-700">
            <Download className="mr-2 h-4 w-4" />
            Install
          </Button>
          <Button variant="outline" size="sm">
            <Heart className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Share className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
          <span>{data.ageRating}</span>
          <span>{data.size}</span>
          <span>Version {data.version}</span>
        </div>
      </div>

      {/* Screenshots */}
      <div className="p-4 border-b">
        <div className="flex gap-3 overflow-x-auto">
          {data.screenshots.map((screenshot, index) => (
            <div key={index} className="flex-shrink-0 w-32 h-56 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Smartphone className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <span className="text-xs text-gray-600">{screenshot}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="p-4">
        <h4 className="font-semibold mb-2">About this app</h4>
        <p className="text-sm text-gray-700 leading-relaxed mb-4">{data.description}</p>
        
        <div className="space-y-2">
          {data.features.slice(0, 3).map((feature, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0" />
              <span className="text-sm text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const AppStorePreview = () => (
    <div className={`bg-white rounded-lg overflow-hidden shadow-lg ${viewMode === 'mobile' ? 'max-w-sm' : 'max-w-4xl'} mx-auto`}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center">
            <span className="text-white font-bold text-2xl">TT</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-xl text-gray-900">{data.title}</h3>
            <p className="text-blue-500 text-sm">{data.developer}</p>
            <p className="text-gray-600 text-sm">{data.category}</p>
            
            <div className="flex items-center gap-4 mt-3">
              <div className="text-center">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-lg">{data.rating}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < Math.floor(data.rating) ? 'fill-blue-500 text-blue-500' : 'text-gray-300'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-600">{data.reviews.toLocaleString()} Ratings</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-lg">{data.ageRating}</p>
                <p className="text-xs text-gray-600">Age</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-lg">#{Math.floor(Math.random() * 50) + 1}</p>
                <p className="text-xs text-gray-600">in {data.category}</p>
              </div>
            </div>
          </div>
        </div>

        <Button className="w-full mt-4 bg-blue-500 hover:bg-blue-600 rounded-full">
          GET
        </Button>
      </div>

      {/* Screenshots */}
      <div className="px-4 pb-4">
        <div className="flex gap-3 overflow-x-auto">
          {data.screenshots.map((screenshot, index) => (
            <div key={index} className="flex-shrink-0 w-40 h-72 bg-gray-100 rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <span className="text-sm text-gray-600">{screenshot}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 p-4">
        <p className="text-sm text-gray-700 leading-relaxed">{data.description}</p>
        
        <div className="mt-4 space-y-2">
          {data.features.slice(0, 4).map((feature, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <span className="text-sm text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Store Preview Generator</h1>
        <p className="text-muted-foreground text-lg">
          See how your audience-targeted listings look on different app stores
        </p>
      </div>

      <div className="flex justify-center gap-4 mb-8">
        <Select value={selectedAudience} onValueChange={setSelectedAudience}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="owner-operators">Independent Owner-Operators</SelectItem>
            <SelectItem value="fleet-managers">Fleet Managers</SelectItem>
            <SelectItem value="new-drivers">New Drivers</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex rounded-lg border">
          <Button
            variant={viewMode === 'mobile' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('mobile')}
            className="rounded-r-none"
          >
            <Smartphone className="h-4 w-4 mr-2" />
            Mobile
          </Button>
          <Button
            variant={viewMode === 'desktop' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('desktop')}
            className="rounded-l-none"
          >
            <Monitor className="h-4 w-4 mr-2" />
            Desktop
          </Button>
        </div>
      </div>

      <Tabs defaultValue="google-play" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="google-play">Google Play</TabsTrigger>
          <TabsTrigger value="app-store">App Store</TabsTrigger>
        </TabsList>

        <div className="mt-8">
          <TabsContent value="google-play">
            <div className="space-y-4">
              <div className="text-center">
                <Badge variant="secondary" className="mb-4">Google Play Store Preview</Badge>
              </div>
              <GooglePlayPreview />
            </div>
          </TabsContent>

          <TabsContent value="app-store">
            <div className="space-y-4">
              <div className="text-center">
                <Badge variant="secondary" className="mb-4">Apple App Store Preview</Badge>
              </div>
              <AppStorePreview />
            </div>
          </TabsContent>
        </div>
      </Tabs>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
          <CardDescription>
            Generate store-ready assets and content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <Button variant="outline">Export Screenshots</Button>
            <Button variant="outline">Generate Description</Button>
            <Button variant="outline">Create Feature List</Button>
            <Button variant="outline">Download All Assets</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}