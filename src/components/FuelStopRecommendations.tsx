import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Fuel, MapPin, DollarSign, Clock, Navigation, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FuelStop {
  id: string;
  name: string;
  location: string;
  distance: number;
  price: number;
  savings: number;
  features: string[];
  rating: number;
  state: string;
  taxRate: number;
}

const mockFuelStops: FuelStop[] = [
  {
    id: '1',
    name: 'TA Travel Center',
    location: 'Denver, CO',
    distance: 5.2,
    price: 3.89,
    savings: 0.15,
    features: ['Truck Parking', 'Showers', 'Restaurant', 'WiFi'],
    rating: 4.5,
    state: 'CO',
    taxRate: 0.205
  },
  {
    id: '2',
    name: 'Pilot Flying J',
    location: 'Limon, CO',
    distance: 87.3,
    price: 3.76,
    savings: 0.28,
    features: ['24/7', 'Truck Parking', 'Food Court'],
    rating: 4.2,
    state: 'CO',
    taxRate: 0.205
  },
  {
    id: '3',
    name: 'Loves Travel Stop',
    location: 'Sterling, CO',
    distance: 125.8,
    price: 3.71,
    savings: 0.33,
    features: ['Truck Parking', 'Subway', 'Laundry'],
    rating: 4.3,
    state: 'CO',
    taxRate: 0.205
  }
];

export const FuelStopRecommendations = () => {
  const [selectedStop, setSelectedStop] = useState<string | null>(null);
  const [route, setRoute] = useState('Denver, CO → Chicago, IL');

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="h-5 w-5 text-primary" />
          AI Fuel Stop Recommendations
        </CardTitle>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Route: {route}
          </p>
          <Badge variant="secondary">Tax-Optimized</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {mockFuelStops.map((stop, index) => (
          <motion.div
            key={stop.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedStop === stop.id 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => setSelectedStop(selectedStop === stop.id ? null : stop.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">{stop.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{stop.rating}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{stop.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-muted-foreground" />
                    <span>{stop.distance} miles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Fuel className="h-4 w-4 text-muted-foreground" />
                    <span>${stop.price}/gal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <span className="text-green-600">Save ${stop.savings}/gal</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mt-3">
                  {stop.features.map((feature) => (
                    <Badge key={feature} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="text-right">
                <Badge variant={index === 0 ? 'default' : 'secondary'}>
                  {index === 0 ? 'Best Value' : `#${index + 1}`}
                </Badge>
              </div>
            </div>

            {selectedStop === stop.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 pt-4 border-t border-border"
              >
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Tax Details:</strong>
                    <p>State Rate: {(stop.taxRate * 100).toFixed(1)}%</p>
                    <p>Est. Tax: ${(stop.price * stop.taxRate).toFixed(3)}/gal</p>
                  </div>
                  <div>
                    <strong>Route Impact:</strong>
                    <p>Time Added: ~{Math.round(stop.distance / 60 * 60)} min</p>
                    <p>Fuel Needed: ~{Math.round(stop.distance / 6)} gal</p>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button size="sm" className="flex-1">
                    <Navigation className="h-4 w-4 mr-2" />
                    Get Directions
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Fuel className="h-4 w-4 mr-2" />
                    Add to Route
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}

        <div className="bg-muted/50 rounded-lg p-4 mt-6">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-500" />
            Trip Savings Summary
          </h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Potential Savings</p>
              <p className="font-semibold text-green-600">$47.50</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tax Optimization</p>
              <p className="font-semibold">$12.30</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Benefit</p>
              <p className="font-semibold text-primary">$59.80</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};