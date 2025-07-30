import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import demoThumbnail from "@/assets/demo-video-thumbnail.jpg";

const Demo = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold text-foreground">IFTA Pro Demo</h1>
          <p className="text-muted-foreground mt-2">
            See how our IFTA management system simplifies your trucking business
          </p>
        </div>
      </header>

      {/* Demo Video Section */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative aspect-video bg-muted">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/qdilYcOkrPI"
                  title="IFTA Pro Demo Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            </CardContent>
          </Card>

          {/* Demo Features */}
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-3">What You'll See</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Complete IFTA calculation workflow</li>
                  <li>• Receipt scanning and data extraction</li>
                  <li>• State-by-state fuel tax breakdown</li>
                  <li>• Automated report generation</li>
                  <li>• Dashboard overview and analytics</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-3">Key Benefits</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Save 15+ hours per quarter</li>
                  <li>• 99.9% calculation accuracy</li>
                  <li>• Reduce audit risk significantly</li>
                  <li>• Mobile-friendly interface</li>
                  <li>• Expert support included</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="mt-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-6">
              Join thousands of truckers who've simplified their IFTA compliance
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/auth')}>
                Start Free Trial
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/pricing')}>
                View Pricing
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Demo;