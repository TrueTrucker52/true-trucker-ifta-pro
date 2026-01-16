import { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink, X, Calendar, AlertTriangle, Bell, Newspaper, ChevronRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from '@/components/BottomNavigation';

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  date: string;
  category: 'regulation' | 'industry' | 'fuel' | 'technology';
}

interface FeaturedAlert {
  id: string;
  title: string;
  description: string;
  type: 'deadline' | 'rate-change' | 'announcement';
  date: string;
  priority: 'high' | 'medium' | 'low';
}

// Featured IFTA alerts - can be managed by admin
const featuredAlerts: FeaturedAlert[] = [
  {
    id: '1',
    title: 'Q4 2025 IFTA Filing Deadline',
    description: 'File your Q4 IFTA return by January 31, 2026. Late filings may result in penalties and interest charges.',
    type: 'deadline',
    date: '2026-01-31',
    priority: 'high',
  },
  {
    id: '2',
    title: 'Oregon Fuel Tax Rate Change',
    description: 'Oregon diesel fuel tax increases to $0.40/gallon effective January 1, 2026. Update your calculations accordingly.',
    type: 'rate-change',
    date: '2026-01-01',
    priority: 'high',
  },
  {
    id: '3',
    title: 'New IFTA Reporting Requirements',
    description: 'IFTA Inc. announces enhanced electronic filing requirements for 2026. Ensure your software is up to date.',
    type: 'announcement',
    date: '2026-01-15',
    priority: 'medium',
  },
];

// Curated industry news sources
const newsArticles: NewsArticle[] = [
  {
    id: '1',
    title: 'EPA Proposes New Emission Standards for Heavy-Duty Trucks',
    summary: 'The Environmental Protection Agency has proposed stricter emission standards for Class 8 trucks, potentially affecting fleet operations and fuel costs.',
    source: 'Transport Topics',
    url: 'https://www.ttnews.com',
    date: '2026-01-15',
    category: 'regulation',
  },
  {
    id: '2',
    title: 'Diesel Prices Drop Amid Increased Domestic Production',
    summary: 'National average diesel prices fell 8 cents this week as U.S. refiners ramp up production ahead of winter demand.',
    source: 'Overdrive Magazine',
    url: 'https://www.overdriveonline.com',
    date: '2026-01-14',
    category: 'fuel',
  },
  {
    id: '3',
    title: 'FMCSA Updates Hours of Service Electronic Logging Rules',
    summary: 'Federal Motor Carrier Safety Administration clarifies ELD compliance requirements for short-haul drivers.',
    source: 'FMCSA',
    url: 'https://www.fmcsa.dot.gov',
    date: '2026-01-13',
    category: 'regulation',
  },
  {
    id: '4',
    title: 'Trucking Industry Sees Record Freight Volumes in Q4',
    summary: 'American Trucking Associations reports freight tonnage index reached all-time high in December 2025.',
    source: 'FreightWaves',
    url: 'https://www.freightwaves.com',
    date: '2026-01-12',
    category: 'industry',
  },
  {
    id: '5',
    title: 'New Fleet Management App Integrates Real-Time IFTA Tracking',
    summary: 'Tech startup launches AI-powered solution for automatic state mileage tracking and fuel tax calculations.',
    source: 'Commercial Carrier Journal',
    url: 'https://www.ccjdigital.com',
    date: '2026-01-11',
    category: 'technology',
  },
  {
    id: '6',
    title: 'California Implements New Clean Truck Check Program',
    summary: 'Heavy-duty vehicles must now pass emissions inspections at California weigh stations starting this month.',
    source: 'Land Line Magazine',
    url: 'https://landline.media',
    date: '2026-01-10',
    category: 'regulation',
  },
];

const TruckingNews = () => {
  const navigate = useNavigate();
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | NewsArticle['category']>('all');

  const filteredNews = filter === 'all' 
    ? newsArticles 
    : newsArticles.filter(a => a.category === filter);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const getAlertIcon = (type: FeaturedAlert['type']) => {
    switch (type) {
      case 'deadline': return <Calendar className="h-5 w-5" />;
      case 'rate-change': return <AlertTriangle className="h-5 w-5" />;
      case 'announcement': return <Bell className="h-5 w-5" />;
    }
  };

  const getAlertColor = (priority: FeaturedAlert['priority']) => {
    switch (priority) {
      case 'high': return 'bg-destructive/10 border-destructive/30 text-destructive';
      case 'medium': return 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400';
      case 'low': return 'bg-primary/10 border-primary/30 text-primary';
    }
  };

  const getCategoryBadge = (category: NewsArticle['category']) => {
    const colors = {
      regulation: 'bg-destructive/10 text-destructive',
      industry: 'bg-primary/10 text-primary',
      fuel: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      technology: 'bg-success/10 text-success',
    };
    return colors[category];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="bg-primary/10 p-2 rounded-lg">
                <Newspaper className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Trucking News</h1>
                <p className="text-sm text-muted-foreground">Industry updates & IFTA alerts</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Featured IFTA Alerts */}
        <section>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            IFTA Alerts & Deadlines
          </h2>
          <div className="space-y-3">
            {featuredAlerts.map((alert) => (
              <Card 
                key={alert.id} 
                className={`border-2 ${getAlertColor(alert.priority)}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-foreground">{alert.title}</h3>
                        {alert.priority === 'high' && (
                          <Badge variant="destructive" className="text-xs">Urgent</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                      <p className="text-xs font-medium">
                        📅 {formatDate(alert.date)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(['all', 'regulation', 'industry', 'fuel', 'technology'] as const).map((cat) => (
            <Button
              key={cat}
              variant={filter === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(cat)}
              className="whitespace-nowrap"
            >
              {cat === 'all' ? 'All News' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Button>
          ))}
        </div>

        {/* News Feed */}
        <section>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-primary" />
            Latest Industry News
          </h2>
          <div className="space-y-4">
            {filteredNews.map((article) => (
              <Card 
                key={article.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSelectedArticle(article)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getCategoryBadge(article.category)}>
                          {article.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(article.date)}
                        </span>
                      </div>
                      <h3 className="font-bold text-foreground mb-1 line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {article.summary}
                      </p>
                      <p className="text-xs text-primary mt-2 font-medium">
                        {article.source}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* In-App Browser Overlay */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-background">
          {/* Browser Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
            <Button variant="ghost" size="icon" onClick={() => setSelectedArticle(null)}>
              <X className="h-5 w-5" />
            </Button>
            <div className="flex-1 mx-4 text-center">
              <p className="text-sm font-medium truncate">{selectedArticle.title}</p>
              <p className="text-xs text-muted-foreground">{selectedArticle.source}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => window.open(selectedArticle.url, '_blank')}
            >
              <ExternalLink className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Browser Content */}
          <div className="flex-1 overflow-auto p-6">
            <Card>
              <CardHeader>
                <Badge className={getCategoryBadge(selectedArticle.category)}>
                  {selectedArticle.category}
                </Badge>
                <CardTitle className="text-2xl mt-2">{selectedArticle.title}</CardTitle>
                <CardDescription>
                  {selectedArticle.source} • {formatDate(selectedArticle.date)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground leading-relaxed">
                  {selectedArticle.summary}
                </p>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    This is a preview. For the full article, open in external browser.
                  </p>
                  <Button 
                    onClick={() => window.open(selectedArticle.url, '_blank')}
                    className="w-full"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Read Full Article
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Bottom Navigation - Mobile */}
      <div className="md:hidden">
        <BottomNavigation />
      </div>
    </div>
  );
};

export default TruckingNews;
