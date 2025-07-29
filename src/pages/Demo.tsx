import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Video, X } from 'lucide-react';
import { useState } from 'react';
import IFTALogo from '@/components/IFTALogo';
import IFTADemo from '@/components/IFTADemo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import demoThumbnail from '@/assets/ifta-app-demo-screenshot.jpg';

const Demo = () => {
  const navigate = useNavigate();

  const [showVideo, setShowVideo] = useState(false);

  const handleVideoPlay = () => {
    setShowVideo(true);
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

        {/* Video Demo Section */}
        <div className="mb-12">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              {!showVideo ? (
                <div className="relative cursor-pointer" onClick={handleVideoPlay}>
                  <img 
                    src={demoThumbnail} 
                    alt="TrueTrucker IFTA Pro Demo Video"
                    className="w-full aspect-video object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group hover:bg-black/30 transition-colors">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-6 group-hover:scale-110 transition-transform">
                      <Video className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded">
                    <span className="text-sm font-medium">▶ Watch Demo Video</span>
                  </div>
                </div>
              ) : (
                <div className="relative aspect-video">
                  <iframe
                    src="https://www.youtube.com/embed/qdilYcOkrPI?autoplay=1"
                    title="TrueTrucker IFTA Pro Demo"
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                    onClick={() => setShowVideo(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Interactive Demo */}
        <div data-demo-section>
          <IFTADemo />
        </div>
      </main>
    </div>
  );
};

export default Demo;