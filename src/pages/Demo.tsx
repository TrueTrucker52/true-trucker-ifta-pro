import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Truck, Play, Video } from 'lucide-react';
import IFTADemo from '@/components/IFTADemo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Demo = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="bg-primary/10 p-2 rounded-lg">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">TrueTrucker IFTA Pro</h1>
                <p className="text-sm text-muted-foreground">Interactive Demo Experience</p>
              </div>
            </div>
            <Button onClick={() => navigate('/auth')}>
              Start Free Trial
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Video Demo Section */}
        <div className="mb-12">
          <Card className="overflow-hidden">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold flex items-center justify-center gap-3">
                <Video className="h-6 w-6 text-primary" />
                App Demo Video
              </CardTitle>
              <CardDescription>
                Watch a complete walkthrough of TrueTrucker IFTA Pro features
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative aspect-video bg-muted">
                {/* Video Player */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                  <div className="text-center">
                    <div className="bg-primary/10 border-2 border-primary/20 rounded-full p-6 mb-4 inline-block hover:bg-primary/20 transition-colors cursor-pointer group">
                      <Play className="h-12 w-12 text-primary group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Complete App Walkthrough
                    </h3>
                    <p className="text-muted-foreground max-w-md">
                      See how easy it is to track mileage, scan receipts, and generate IFTA reports
                    </p>
                    {/* Video would be embedded here */}
                    <div className="mt-4 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full inline-block">
                      📹 Demo video coming soon - placeholder for now
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Demo */}
        <IFTADemo />
        
        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="bg-primary/5 p-8 rounded-lg border border-primary/20">
            <h3 className="text-2xl font-bold mb-4">Ready to streamline your IFTA reporting?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join thousands of truckers who have simplified their fuel tax compliance with TrueTrucker IFTA Pro. 
              Start your free trial today and experience the difference.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/auth')}>
                Start Free Trial
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/')}>
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Demo;