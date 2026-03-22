import React, { useState, useEffect, useMemo } from 'react';
import DOMPurify from 'dompurify';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { HELP_CATEGORIES, HELP_ARTICLES } from '@/lib/helpContent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Search, ArrowLeft, ThumbsUp, ThumbsDown, ChevronRight,
  MessageCircle, Mail, Phone, Ticket, HelpCircle, Star, ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type View = 'home' | 'category' | 'article' | 'contact' | 'ticket' | 'my-tickets';

const HelpCenter: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [view, setView] = useState<View>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticleSlug, setSelectedArticleSlug] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'up' | 'down'>>({});

  // Ticket form state
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketCategory, setTicketCategory] = useState('other');
  const [ticketPriority, setTicketPriority] = useState('medium');
  const [submittingTicket, setSubmittingTicket] = useState(false);

  // My tickets
  const [myTickets, setMyTickets] = useState<any[]>([]);

  // Handle URL params
  useEffect(() => {
    const cat = searchParams.get('category');
    const article = searchParams.get('article');
    if (article) {
      setSelectedArticleSlug(article);
      setView('article');
    } else if (cat) {
      setSelectedCategory(cat);
      setView('category');
    } else if (searchParams.get('view') === 'contact') {
      setView('contact');
    } else if (searchParams.get('view') === 'tickets') {
      setView('my-tickets');
    }
  }, [searchParams]);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return HELP_ARTICLES.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.tags.some(t => t.toLowerCase().includes(q)) ||
      a.content.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [searchQuery]);

  const featuredArticles = HELP_ARTICLES.filter(a => a.isFeatured);
  const selectedArticle = HELP_ARTICLES.find(a => a.slug === selectedArticleSlug);
  const categoryArticles = selectedCategory
    ? HELP_ARTICLES.filter(a => a.categorySlug === selectedCategory)
    : [];
  const currentCategory = HELP_CATEGORIES.find(c => c.slug === selectedCategory);

  const relatedArticles = selectedArticle
    ? HELP_ARTICLES.filter(a => a.categorySlug === selectedArticle.categorySlug && a.slug !== selectedArticle.slug).slice(0, 4)
    : [];

  const goHome = () => {
    setView('home');
    setSelectedCategory(null);
    setSelectedArticleSlug(null);
    setSearchQuery('');
    setSearchParams({});
  };

  const openCategory = (slug: string) => {
    setSelectedCategory(slug);
    setView('category');
    setSearchParams({ category: slug });
  };

  const openArticle = (slug: string) => {
    setSelectedArticleSlug(slug);
    setView('article');
    setSearchParams({ article: slug });
    setSearchQuery('');
  };

  const handleFeedback = (slug: string, type: 'up' | 'down') => {
    setFeedbackGiven(prev => ({ ...prev, [slug]: type }));
    toast({
      title: type === 'up' ? 'Thanks for the feedback! 👍' : 'Sorry to hear that',
      description: type === 'down' ? "We'll work on improving this article." : undefined,
    });
  };

  const loadMyTickets = async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setMyTickets(data || []);
  };

  const submitTicket = async () => {
    if (!user?.id || !ticketSubject.trim()) return;
    setSubmittingTicket(true);

    const ticketNum = `TT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const { error } = await supabase.from('support_tickets').insert({
      user_id: user.id,
      ticket_number: ticketNum,
      subject: ticketSubject,
      description: ticketDescription,
      category: ticketCategory,
      priority: ticketPriority,
    });

    setSubmittingTicket(false);

    if (error) {
      toast({ title: 'Error', description: 'Failed to submit ticket. Please try again.', variant: 'destructive' });
    } else {
      toast({ title: '✅ Ticket Submitted!', description: `Ticket ${ticketNum} — we'll reply within 24 hours.` });
      setTicketSubject('');
      setTicketDescription('');
      setView('home');
    }
  };

  // Escape HTML special characters to prevent XSS
  const escapeHtml = (str: string) =>
    str.replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c]!));

  const sanitizeArticleHtml = (html: string) =>
    DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['a', 'br', 'code', 'em', 'li', 'p', 'pre', 'strong', 'ul', 'ol'],
      ALLOWED_ATTR: ['href', 'class', 'target', 'rel'],
      FORBID_TAGS: ['form', 'iframe', 'input', 'object', 'script', 'style'],
      FORBID_ATTR: ['onerror', 'onclick', 'onload', 'onmouseover', 'onfocus'],
      ALLOW_DATA_ATTR: false,
    });

  // Render markdown-like content with sanitized links
  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-bold text-foreground mb-4">{line.slice(2)}</h1>;
      if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-semibold text-foreground mt-6 mb-3">{line.slice(3)}</h2>;
      if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-semibold text-foreground mb-1">{line.slice(2, -2)}</p>;
      if (line.startsWith('- ')) return <li key={i} className="ml-4 text-muted-foreground mb-1">{line.slice(2)}</li>;
      if (line.startsWith('|')) return <p key={i} className="text-sm text-muted-foreground font-mono mb-1">{line}</p>;
      if (line.trim() === '') return <br key={i} />;
      const escapedLine = escapeHtml(line);

      // Handle inline links with sanitized URLs and escaped labels
      const withLinks = escapedLine.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        (_, label, url) => {
          const safeUrl = /^https?:\/\//i.test(url) ? escapeHtml(url) : '#';
          const safeLabel = escapeHtml(label);
          return `<a href="${safeUrl}" class="text-primary underline" target="_blank" rel="noopener noreferrer">${safeLabel}</a>`;
        }
      );
      const sanitizedHtml = sanitizeArticleHtml(withLinks);

      return <p key={i} className="text-muted-foreground mb-2" dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
        <AnimatePresence mode="wait">
          {/* HOME VIEW */}
          {view === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">❓ TrueTrucker Help Center</h1>
                <p className="text-muted-foreground">Find answers, guides, and support</p>
              </div>

              {/* Search */}
              <div className="relative mb-8 max-w-xl mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for answers..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base"
                />

                {searchQuery && (
                  <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-lg max-h-80 overflow-auto">
                    <CardContent className="p-2">
                      {searchResults.length > 0 ? (
                        searchResults.map(a => {
                          const cat = HELP_CATEGORIES.find(c => c.slug === a.categorySlug);
                          return (
                            <button key={a.slug} onClick={() => openArticle(a.slug)}
                              className="w-full text-left px-3 py-2 rounded-md hover:bg-muted/50 transition-colors">
                              <p className="text-sm font-medium text-foreground">{a.title}</p>
                              <p className="text-xs text-muted-foreground">{cat?.name} — {a.readTimeMinutes} min read</p>
                            </button>
                          );
                        })
                      ) : (
                        <div className="p-4 text-center">
                          <p className="text-sm text-muted-foreground mb-2">🔍 No results for "{searchQuery}"</p>
                          <p className="text-xs text-muted-foreground">Try searching for "IFTA", "BOL", or "fleet"</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Categories */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-4 text-center">👋 Browse by Category</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {HELP_CATEGORIES.map(cat => (
                    <Card key={cat.slug} className="cursor-pointer hover:border-primary transition-colors hover:shadow-md"
                      onClick={() => openCategory(cat.slug)}>
                      <CardContent className="p-4 text-center">
                        <span className="text-3xl">{cat.icon}</span>
                        <p className="font-semibold text-foreground text-sm mt-2">{cat.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{cat.description}</p>
                        <p className="text-xs text-primary mt-2">{HELP_ARTICLES.filter(a => a.categorySlug === cat.slug).length} articles</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Featured */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5 text-secondary" /> Featured Articles
                </h2>
                <div className="space-y-2">
                  {featuredArticles.map(a => (
                    <button key={a.slug} onClick={() => openArticle(a.slug)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors text-left">
                      <ChevronRight className="h-4 w-4 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{a.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {HELP_CATEGORIES.find(c => c.slug === a.categorySlug)?.name} — {a.readTimeMinutes} min read
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact CTA */}
              <Card className="bg-muted/30 border-dashed">
                <CardContent className="p-6 text-center">
                  <p className="font-semibold text-foreground mb-2">Still need help?</p>
                  <div className="flex gap-3 justify-center flex-wrap">
                    <Button variant="outline" size="sm" onClick={() => { setView('contact'); setSearchParams({ view: 'contact' }); }}>
                      <Mail className="h-4 w-4 mr-1" /> Contact Support
                    </Button>
                    {user && (
                      <Button variant="outline" size="sm" onClick={() => { setView('my-tickets'); setSearchParams({ view: 'tickets' }); loadMyTickets(); }}>
                        <Ticket className="h-4 w-4 mr-1" /> My Tickets
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* CATEGORY VIEW */}
          {view === 'category' && currentCategory && (
            <motion.div key="category" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button onClick={goHome} className="flex items-center gap-1 text-sm text-primary mb-4 hover:underline">
                <ArrowLeft className="h-4 w-4" /> Back to Help Center
              </button>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <span className="text-3xl">{currentCategory.icon}</span> {currentCategory.name}
                </h1>
                <p className="text-muted-foreground mt-1">{currentCategory.description}</p>
                <p className="text-sm text-muted-foreground mt-1">{categoryArticles.length} articles</p>
              </div>
              <div className="space-y-2">
                {categoryArticles.map(a => (
                  <button key={a.slug} onClick={() => openArticle(a.slug)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors text-left border border-transparent hover:border-border">
                    <ChevronRight className="h-4 w-4 text-primary flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{a.readTimeMinutes} min read</p>
                    </div>
                    {a.isFeatured && <Star className="h-3 w-3 text-secondary" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ARTICLE VIEW */}
          {view === 'article' && selectedArticle && (
            <motion.div key="article" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button onClick={() => {
                if (selectedArticle.categorySlug) {
                  openCategory(selectedArticle.categorySlug);
                } else {
                  goHome();
                }
              }} className="flex items-center gap-1 text-sm text-primary mb-4 hover:underline">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>

              <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <span>{HELP_CATEGORIES.find(c => c.slug === selectedArticle.categorySlug)?.icon}</span>
                  <span>{HELP_CATEGORIES.find(c => c.slug === selectedArticle.categorySlug)?.name}</span>
                  <span>•</span>
                  <span>⏱️ {selectedArticle.readTimeMinutes} min read</span>
                </div>
              </div>

              <Card>
                <CardContent className="p-6 prose prose-sm max-w-none">
                  {renderContent(selectedArticle.content)}
                </CardContent>
              </Card>

              {/* Feedback */}
              <Card className="mt-6">
                <CardContent className="p-4 text-center">
                  {feedbackGiven[selectedArticle.slug] ? (
                    <p className="text-sm text-muted-foreground">
                      {feedbackGiven[selectedArticle.slug] === 'up'
                        ? '👍 Thanks for the feedback!'
                        : '🙏 We\'ll improve this article. Contact support if you need more help.'}
                    </p>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-foreground mb-3">Was this article helpful?</p>
                      <div className="flex gap-3 justify-center">
                        <Button variant="outline" size="sm" onClick={() => handleFeedback(selectedArticle.slug, 'up')}>
                          <ThumbsUp className="h-4 w-4 mr-1" /> Yes, thanks!
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleFeedback(selectedArticle.slug, 'down')}>
                          <ThumbsDown className="h-4 w-4 mr-1" /> Not really
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Related */}
              {relatedArticles.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Related Articles</h3>
                  <div className="space-y-1">
                    {relatedArticles.map(a => (
                      <button key={a.slug} onClick={() => openArticle(a.slug)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted/50 transition-colors text-left">
                        <ChevronRight className="h-3 w-3 text-primary" />
                        <span className="text-sm text-foreground">{a.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact CTA */}
              <Card className="mt-6 bg-muted/30 border-dashed">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-2">Still need help?</p>
                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" size="sm" onClick={() => { setView('contact'); setSearchParams({ view: 'contact' }); }}>
                      <Mail className="h-4 w-4 mr-1" /> Contact Support
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* CONTACT VIEW */}
          {view === 'contact' && (
            <motion.div key="contact" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button onClick={goHome} className="flex items-center gap-1 text-sm text-primary mb-4 hover:underline">
                <ArrowLeft className="h-4 w-4" /> Back to Help Center
              </button>
              <h1 className="text-2xl font-bold text-foreground mb-6">💬 Contact Support</h1>

              <div className="grid gap-4 md:grid-cols-2 mb-8">
                {[
                  { icon: Mail, title: 'Email Support', desc: 'We reply within 24 hours', detail: 'support@truetrucker.com', action: () => window.open('mailto:support@truetrucker.com') },
                  { icon: Phone, title: 'Phone Support', desc: 'Mon-Fri 9AM-5PM EST', detail: '1-800-TRUCKER', action: () => window.open('tel:1-800-8782537') },
                ].map((opt, i) => (
                  <Card key={i} className="cursor-pointer hover:border-primary transition-colors" onClick={opt.action}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg"><opt.icon className="h-5 w-5 text-primary" /></div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">{opt.title}</p>
                          <p className="text-xs text-muted-foreground">{opt.desc}</p>
                          <p className="text-xs text-primary mt-1">{opt.detail}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Ticket Form */}
              {user ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Ticket className="h-5 w-5" /> Submit a Support Ticket
                    </CardTitle>
                    <CardDescription>Track your issue and get a response within 24 hours</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div><Label>Subject</Label><Input value={ticketSubject} onChange={e => setTicketSubject(e.target.value)} placeholder="What do you need help with?" /></div>
                    <div>
                      <Label>Category</Label>
                      <select value={ticketCategory} onChange={e => setTicketCategory(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option value="ifta">IFTA Filing Question</option>
                        <option value="bol">BOL Scanner Issue</option>
                        <option value="mileage">Mileage Tracking Problem</option>
                        <option value="fleet">Fleet Management Help</option>
                        <option value="billing">Billing Question</option>
                        <option value="account">Account Issue</option>
                        <option value="technical">Technical Problem</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <Label>Priority</Label>
                      <select value={ticketPriority} onChange={e => setTicketPriority(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option value="low">Low — General question</option>
                        <option value="medium">Medium — Something not working</option>
                        <option value="high">High — Cannot use the app</option>
                        <option value="urgent">Urgent — Affecting my filing</option>
                      </select>
                    </div>
                    <div><Label>Describe your issue</Label><Textarea value={ticketDescription} onChange={e => setTicketDescription(e.target.value)} placeholder="Tell us what happened..." rows={4} /></div>
                    <Button onClick={submitTicket} disabled={!ticketSubject.trim() || submittingTicket} className="w-full">
                      {submittingTicket ? 'Submitting...' : 'Submit Ticket →'}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-muted/30">
                  <CardContent className="p-6 text-center">
                    <p className="text-sm text-muted-foreground mb-3">Log in to submit a support ticket</p>
                    <Button onClick={() => navigate('/auth')}>Log In</Button>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {/* MY TICKETS VIEW */}
          {view === 'my-tickets' && (
            <motion.div key="tickets" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button onClick={goHome} className="flex items-center gap-1 text-sm text-primary mb-4 hover:underline">
                <ArrowLeft className="h-4 w-4" /> Back to Help Center
              </button>
              <h1 className="text-2xl font-bold text-foreground mb-6">🎫 My Support Tickets</h1>

              {myTickets.length === 0 ? (
                <Card className="bg-muted/30">
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">No tickets yet. Need help?</p>
                    <Button variant="outline" className="mt-3" onClick={() => { setView('contact'); setSearchParams({ view: 'contact' }); }}>
                      Submit a Ticket
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {myTickets.map(t => (
                    <Card key={t.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-foreground text-sm">{t.subject}</p>
                            <p className="text-xs text-muted-foreground mt-1">{t.ticket_number} • {new Date(t.created_at).toLocaleDateString()}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            t.status === 'open' ? 'bg-destructive/10 text-destructive' :
                            t.status === 'in_progress' ? 'bg-secondary/10 text-secondary' :
                            'bg-accent/10 text-accent'
                          }`}>
                            {t.status === 'in_progress' ? 'In Progress' : t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                          </span>
                        </div>
                        {t.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{t.description}</p>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  );
};

export default HelpCenter;
