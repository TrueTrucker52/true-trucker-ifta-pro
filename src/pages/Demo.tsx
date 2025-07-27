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
        {/* Live Demo Hero */}
        <div className="mb-12">
          <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-background">
            <CardContent className="p-8 text-center">
              <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
                ✨ Live Interactive Demo
              </div>
              <h2 className="text-3xl font-bold mb-3">Experience TrueTrucker IFTA Pro</h2>
              <p className="text-muted-foreground text-lg mb-6 max-w-2xl mx-auto">
                See why 15,000+ truckers chose us over competitors. Test all features below - no signup required.
              </p>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Import from 30+ fuel cards
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  AI receipt scanning (99.8% accuracy)
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Driver performance scoring
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