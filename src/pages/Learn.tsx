import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  BookOpen, 
  Calculator, 
  FileText, 
  Clock, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  DollarSign,
  MapPin,
  Truck,
  Calendar,
  Award,
  Users
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Learn = () => {
  const navigate = useNavigate();

  const learningModules = [
    {
      id: 1,
      title: "IFTA Basics & Requirements",
      description: "Understanding IFTA fundamentals, jurisdictions, and compliance requirements",
      duration: "15 min",
      difficulty: "Beginner",
      icon: BookOpen,
      topics: [
        "What is IFTA and why it matters",
        "IFTA member jurisdictions",
        "Licensing requirements",
        "Record keeping obligations"
      ]
    },
    {
      id: 2,
      title: "Fuel Tax Calculations",
      description: "Master the math behind IFTA fuel tax calculations and quarterly returns",
      duration: "25 min",
      difficulty: "Intermediate",
      icon: Calculator,
      topics: [
        "Miles per gallon calculations",
        "State-by-state tax rates",
        "Quarterly return formulas",
        "Common calculation errors to avoid"
      ]
    },
    {
      id: 3,
      title: "Record Keeping Best Practices",
      description: "Learn proper documentation and record management for IFTA compliance",
      duration: "20 min",
      difficulty: "Beginner",
      icon: FileText,
      topics: [
        "Required documentation",
        "Receipt organization",
        "Digital vs. paper records",
        "Audit preparation"
      ]
    },
    {
      id: 4,
      title: "Quarterly Filing Process",
      description: "Step-by-step guide to filing quarterly IFTA returns accurately and on time",
      duration: "30 min",
      difficulty: "Intermediate",
      icon: Calendar,
      topics: [
        "Filing deadlines and schedules",
        "Form completion walkthrough",
        "Payment processing",
        "Late filing penalties"
      ]
    },
    {
      id: 5,
      title: "Audit Defense Strategies",
      description: "Prepare for and handle IFTA audits with confidence",
      duration: "35 min",
      difficulty: "Advanced",
      icon: Shield,
      topics: [
        "Audit triggers and selection",
        "Documentation requirements",
        "Responding to audit requests",
        "Appeal processes"
      ]
    },
    {
      id: 6,
      title: "Cost Optimization Tips",
      description: "Strategies to minimize fuel costs and maximize tax efficiency",
      duration: "20 min",
      difficulty: "Intermediate",
      icon: DollarSign,
      topics: [
        "Fuel-efficient routing",
        "Tax-advantaged fuel stops",
        "Bulk fuel purchasing",
        "Fleet fuel management"
      ]
    }
  ];

  const quickTips = [
    {
      icon: AlertTriangle,
      title: "Common Mistake",
      tip: "Always keep fuel receipts for purchases over $25 - they're required for IFTA compliance!"
    },
    {
      icon: CheckCircle,
      title: "Pro Tip",
      tip: "File your quarterly returns early to avoid last-minute stress and potential penalties."
    },
    {
      icon: MapPin,
      title: "Route Planning",
      tip: "Use fuel-efficient routes that consider both distance and favorable tax jurisdictions."
    },
    {
      icon: Clock,
      title: "Time Saver",
      tip: "Record trip details immediately - don't wait until the end of the quarter!"
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-success text-success-foreground';
      case 'Intermediate': return 'bg-secondary text-secondary-foreground';
      case 'Advanced': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-12 bg-gradient-primary text-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(-1)}
                className="mr-4 border-white/30 text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                IFTA Education Center
              </h1>
              <p className="text-xl text-white/90 mb-6">
                Master IFTA compliance with expert-designed courses and practical tips from experienced truckers.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  <span>15,000+ Students</span>
                </div>
                <div className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  <span>Industry Certified</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  <span>2-3 Hours Total</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Quick Tips Section */}
        <section className="py-12 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8">Quick Tips for Success</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickTips.map((tip, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <tip.icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-sm mb-1">{tip.title}</div>
                          <div className="text-sm text-muted-foreground">{tip.tip}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Learning Modules */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4">Complete Learning Path</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                From IFTA basics to advanced audit defense, everything you need to know for successful compliance.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {learningModules.map((module, index) => (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300 group">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-4">
                        <div className="bg-gradient-primary p-3 rounded-lg group-hover:scale-110 transition-transform">
                          <module.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Badge variant="outline" className="text-xs">
                            {module.duration}
                          </Badge>
                          <Badge className={`text-xs ${getDifficultyColor(module.difficulty)}`}>
                            {module.difficulty}
                          </Badge>
                        </div>
                      </div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {module.title}
                      </CardTitle>
                      <CardDescription>
                        {module.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <div className="text-sm font-medium text-foreground">You'll Learn:</div>
                        <ul className="space-y-1">
                          {module.topics.map((topic, topicIndex) => (
                            <li key={topicIndex} className="text-sm text-muted-foreground flex items-start">
                              <CheckCircle className="h-3 w-3 text-success mr-2 mt-1 flex-shrink-0" />
                              {topic}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Button 
                        className="w-full group-hover:bg-primary group-hover:text-white transition-colors"
                        variant="outline"
                        onClick={() => navigate('/demo')}
                      >
                        Start Learning
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-gradient-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-4">
                Ready to Master IFTA Compliance?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Start your free trial and get immediate access to our complete education center, 
                plus all the tools you need to manage your IFTA requirements.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="bg-white text-primary hover:bg-white/90"
                  onClick={() => navigate('/auth')}
                >
                  <BookOpen className="h-5 w-5 mr-2" />
                  Start Free Trial
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                  onClick={() => navigate('/demo')}
                >
                  <Truck className="h-5 w-5 mr-2" />
                  Try Interactive Demo
                </Button>
              </div>
              <p className="mt-4 text-sm text-white/80">
                ✓ No credit card required ✓ Full access to education center ✓ Cancel anytime
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Learn;