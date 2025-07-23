import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plug, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  Settings, 
  Truck,
  DollarSign,
  FileText,
  MapPin,
  Fuel,
  Shield,
  Smartphone
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  category: string;
  description: string;
  status: 'connected' | 'available' | 'premium';
  icon: any;
  features: string[];
  benefit: string;
}

const integrations: Integration[] = [
  {
    id: 'eld',
    name: 'ELD Devices',
    category: 'Hardware',
    description: 'Connect with major ELD providers for automatic mileage tracking',
    status: 'connected',
    icon: Truck,
    features: ['Auto mileage import', 'Real-time tracking', 'HOS compliance'],
    benefit: 'Saves 5+ hours weekly'
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    category: 'Accounting',
    description: 'Sync fuel expenses and tax calculations with your accounting software',
    status: 'available',
    icon: DollarSign,
    features: ['Expense categorization', 'Tax reporting', 'Financial sync'],
    benefit: 'Eliminates double entry'
  },
  {
    id: 'fuel-cards',
    name: 'Fuel Card Networks',
    category: 'Payment',
    description: 'Import transactions from major fuel card providers automatically',
    status: 'connected',
    icon: Fuel,
    features: ['Transaction import', 'Receipt matching', 'Bulk processing'],
    benefit: 'Auto-processes 95% of receipts'
  },
  {
    id: 'permits',
    name: 'Permit Services',
    category: 'Compliance',
    description: 'Integrate with permit services for seamless route planning',
    status: 'premium',
    icon: Shield,
    features: ['Route optimization', 'Permit tracking', 'Compliance alerts'],
    benefit: 'Prevents $500+ in violations'
  },
  {
    id: 'mobile-scanner',
    name: 'Mobile Receipt Scanner',
    category: 'Mobile',
    description: 'AI-powered mobile app for instant receipt processing',
    status: 'connected',
    icon: Smartphone,
    features: ['Instant OCR', 'Cloud sync', 'Offline mode'],
    benefit: 'Process receipts in seconds'
  },
  {
    id: 'gps-tracking',
    name: 'GPS Fleet Tracking',
    category: 'Hardware',
    description: 'Connect with fleet tracking systems for precise mileage',
    status: 'available',
    icon: MapPin,
    features: ['Precise tracking', 'Route optimization', 'Geofencing'],
    benefit: 'Improves accuracy by 99%'
  }
];

export const IntegrationHub = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['all', 'Hardware', 'Accounting', 'Payment', 'Compliance', 'Mobile'];
  
  const filteredIntegrations = integrations.filter(integration => {
    const matchesCategory = activeCategory === 'all' || integration.category === activeCategory;
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'available': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'premium': return <Badge variant="outline" className="text-xs">Premium</Badge>;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'border-green-200 bg-green-50';
      case 'available': return 'border-blue-200 bg-blue-50';
      case 'premium': return 'border-purple-200 bg-purple-50';
      default: return 'border-border';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plug className="h-5 w-5 text-primary" />
          Integration Hub
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Connect your existing tools for a seamless trucking workflow
        </p>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="integrations" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="integrations">Available Integrations</TabsTrigger>
            <TabsTrigger value="connected">Connected Services</TabsTrigger>
          </TabsList>

          <TabsContent value="integrations" className="space-y-4">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={activeCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveCategory(category)}
                >
                  {category === 'all' ? 'All' : category}
                </Button>
              ))}
            </div>

            {/* Integration Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredIntegrations.map((integration, index) => (
                <motion.div
                  key={integration.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`p-4 transition-all hover:shadow-lg ${getStatusColor(integration.status)}`}>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <integration.icon className="h-6 w-6 text-primary" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{integration.name}</h3>
                          {getStatusIcon(integration.status)}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {integration.description}
                        </p>

                        <div className="space-y-2 mb-4">
                          <div className="flex flex-wrap gap-1">
                            {integration.features.map((feature) => (
                              <Badge key={feature} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="bg-primary/5 rounded p-2">
                            <p className="text-xs font-medium text-primary">
                              💡 {integration.benefit}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {integration.status === 'connected' ? (
                            <Button size="sm" variant="outline" className="flex-1">
                              <Settings className="h-4 w-4 mr-2" />
                              Configure
                            </Button>
                          ) : integration.status === 'premium' ? (
                            <Button size="sm" className="flex-1">
                              Upgrade to Connect
                            </Button>
                          ) : (
                            <Button size="sm" className="flex-1">
                              <ArrowRight className="h-4 w-4 mr-2" />
                              Connect Now
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="connected" className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold mb-4">Connected Services</h3>
              
              {integrations
                .filter(i => i.status === 'connected')
                .map((integration) => (
                  <div key={integration.id} className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
                    <div className="flex items-center gap-3">
                      <integration.icon className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{integration.name}</p>
                        <p className="text-sm text-muted-foreground">Last sync: 2 minutes ago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch checked />
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>

            <div className="bg-primary/10 rounded-lg p-4">
              <h4 className="font-semibold text-primary mb-2">Integration Benefits</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Time Saved Weekly</p>
                  <p className="text-2xl font-bold text-primary">12+ hours</p>
                </div>
                <div>
                  <p className="font-medium">Data Accuracy</p>
                  <p className="text-2xl font-bold text-primary">99.7%</p>
                </div>
                <div>
                  <p className="font-medium">Auto-Processed</p>
                  <p className="text-2xl font-bold text-primary">94%</p>
                </div>
                <div>
                  <p className="font-medium">Error Reduction</p>
                  <p className="text-2xl font-bold text-primary">85%</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};