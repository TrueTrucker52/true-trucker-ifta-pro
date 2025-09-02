import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { FileText, Users, Eye, Target, Smartphone, TrendingUp } from 'lucide-react';

export default function MarketingHub() {
  const navigate = useNavigate();

  const tools = [
    {
      title: 'Store Listings Manager',
      description: 'Create and manage custom store listings tailored for different trucking industry audiences',
      icon: <FileText className="h-8 w-8" />,
      route: '/store-listings',
      features: [
        'Audience-specific content templates',
        'SEO keyword optimization',
        'Feature highlighting for different user types',
        'Export ready listings'
      ],
      badge: 'Content Creation',
      color: 'from-blue-500 to-blue-700'
    },
    {
      title: 'Audience-Targeted Landing Pages',
      description: 'Dynamic landing pages that adapt content based on your target audience segment',
      icon: <Target className="h-8 w-8" />,
      route: '/audience-landing',
      features: [
        'Owner-operator focused messaging',
        'Fleet manager enterprise features',
        'New driver educational content',
        'Dynamic testimonials and pricing'
      ],
      badge: 'Landing Pages',
      color: 'from-green-500 to-green-700'
    },
    {
      title: 'Store Preview Generator',
      description: 'Preview how your listings will look on Google Play Store and Apple App Store',
      icon: <Eye className="h-8 w-8" />,
      route: '/store-preview',
      features: [
        'Google Play Store preview',
        'Apple App Store preview',
        'Mobile and desktop views',
        'Screenshot mockups'
      ],
      badge: 'Preview Tool',
      color: 'from-purple-500 to-purple-700'
    }
  ];

  const audienceSegments = [
    {
      name: 'Independent Owner-Operators',
      icon: <Users className="h-5 w-5" />,
      description: 'Focus on time-saving and profit maximization',
      keyMessages: ['Save 10+ hours per quarter', 'Never miss deductions', 'Simple, powerful tools']
    },
    {
      name: 'Fleet Managers',
      icon: <TrendingUp className="h-5 w-5" />,
      description: 'Emphasize scalability and compliance management',
      keyMessages: ['75% reduction in admin time', 'Multi-driver dashboards', 'Enterprise features']
    },
    {
      name: 'New Drivers',
      icon: <Smartphone className="h-5 w-5" />,
      description: 'Educational approach with mistake prevention',
      keyMessages: ['Learn from day one', 'Avoid costly mistakes', 'Step-by-step guidance']
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Marketing Hub</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Create targeted store listings and marketing content for different trucking industry audiences. 
          Optimize your app store presence with audience-specific messaging and previews.
        </p>
      </div>

      {/* Main Tools */}
      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        {tools.map((tool, index) => (
          <Card key={index} className="group hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => navigate(tool.route)}>
            <CardHeader>
              <div className={`w-16 h-16 bg-gradient-to-r ${tool.color} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                {tool.icon}
              </div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary">{tool.badge}</Badge>
              </div>
              <CardTitle className="text-xl">{tool.title}</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                {tool.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                {tool.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-2 text-sm">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full group-hover:bg-primary/90 transition-colors">
                Open Tool
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Audience Segments Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">Target Audience Segments</CardTitle>
          <CardDescription>
            Understanding your different user types helps create more effective marketing messages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {audienceSegments.map((segment, index) => (
              <div key={index} className="p-6 border rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    {segment.icon}
                  </div>
                  <h4 className="font-semibold">{segment.name}</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{segment.description}</p>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Key Messages:</p>
                  {segment.keyMessages.map((message, msgIndex) => (
                    <div key={msgIndex} className="flex items-start gap-2">
                      <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-xs text-muted-foreground">{message}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Jump straight to creating content for specific audiences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="justify-start h-auto p-4"
              onClick={() => navigate('/store-listings')}
            >
              <div className="text-left">
                <div className="font-medium">Owner-Operator Listing</div>
                <div className="text-xs text-muted-foreground">Focus on time-saving</div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="justify-start h-auto p-4"
              onClick={() => navigate('/store-listings')}
            >
              <div className="text-left">
                <div className="font-medium">Fleet Manager Content</div>
                <div className="text-xs text-muted-foreground">Enterprise features</div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="justify-start h-auto p-4"
              onClick={() => navigate('/audience-landing')}
            >
              <div className="text-left">
                <div className="font-medium">Landing Page Preview</div>
                <div className="text-xs text-muted-foreground">Test different audiences</div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="justify-start h-auto p-4"
              onClick={() => navigate('/store-preview')}
            >
              <div className="text-left">
                <div className="font-medium">Store Preview</div>
                <div className="text-xs text-muted-foreground">See final result</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}