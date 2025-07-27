import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Video } from 'lucide-react';
import IFTALogo from '@/components/IFTALogo';
import IFTADemo from '@/components/IFTADemo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import demoThumbnail from '@/assets/ifta-app-demo-screenshot.jpg';

const Demo = () => {
  const navigate = useNavigate();

  const handleVideoPlay = () => {
    console.log('Video play clicked');
    // For now, scroll to the interactive demo
    const demoElement = document.querySelector('[data-demo-section]');
    if (demoElement) {
      demoElement.scrollIntoView({ behavior: 'smooth' });
    }
    // You can replace this with actual video functionality later
    alert('Demo video coming soon! For now, try the interactive demo below.');
  };

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
                <IFTALogo size="md" className="text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">TrueTrucker IFTA Pro</h1>
                <p className="text-sm text-muted-foreground">Interactive Demo Experience</p>
              </div>
            </div>
            <Button onClick={() => navigate('/#pricing')}>
              Order Now
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
              <div className="relative aspect-video bg-muted overflow-hidden">
                {/* Demo Screenshot */}
                <img 
                  src={demoThumbnail} 
                  alt="TrueTrucker IFTA Pro Demo Screenshot"
                  className="w-full h-full object-cover"
                />
                
                {/* Demo Info Overlay */}
                <div className="absolute bottom-4 left-4 text-white">
                  <div className="bg-black/70 backdrop-blur px-3 py-1 rounded-full text-sm font-medium">
                    📊 Interactive Demo Below
                  </div>
                </div>
              </div>
              
              {/* Video Description */}
              <div className="p-6 bg-muted/30">
                <h4 className="font-semibold text-foreground mb-2">What you'll see in this demo:</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div className="space-y-1">
                    <div>• Dashboard overview and key metrics</div>
                    <div>• Adding and managing vehicles</div>
                    <div>• Recording trip mileage</div>
                    <div>• Receipt scanning with OCR</div>
                  </div>
                  <div className="space-y-1">
                    <div>• Fuel tax calculations by state</div>
                    <div>• Generating IFTA quarterly reports</div>
                    <div>• Fleet management features</div>
                    <div>• Mobile app functionality</div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="text-sm text-primary font-medium">
                    💡 To record your own demo video: Use screen recording software to capture the interactive demo below, 
                    showing each tab and feature with voice narration explaining the benefits.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Demo */}
        <div data-demo-section>
          <IFTADemo />
        </div>
        
        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="bg-primary/5 p-8 rounded-lg border border-primary/20">
            <h3 className="text-2xl font-bold mb-4">Ready to streamline your IFTA reporting?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join thousands of truckers who have simplified their fuel tax compliance with TrueTrucker IFTA Pro. 
              Start your free trial today and experience the difference.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/#pricing')}>
                Order Now
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