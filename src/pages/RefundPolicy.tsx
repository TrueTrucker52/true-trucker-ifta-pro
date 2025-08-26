import { CreditCard, Calendar, RefreshCw, AlertCircle, Mail, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const RefundPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <CreditCard className="h-4 w-4" />
              Billing & Refunds
            </div>
            <h1 className="text-4xl font-bold mb-4">Refund & Trial Policy</h1>
            <p className="text-xl text-muted-foreground">
              Clear terms for trials, billing, and refunds
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Free Trial */}
          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              14-Day Free Trial
            </h2>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                New users can try TrueTrucker IFTA Pro free for 14 days with full access to all features.
              </p>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-800 dark:text-green-200">Trial Benefits</h3>
                    <ul className="text-sm text-green-700 dark:text-green-300 mt-2 space-y-1">
                      <li>• Full access to all IFTA calculation tools</li>
                      <li>• Unlimited mileage tracking</li>
                      <li>• Receipt scanning and management</li>
                      <li>• Report generation capabilities</li>
                      <li>• No credit card required to start</li>
                    </ul>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Your trial will automatically convert to a paid subscription unless cancelled before the trial period ends.
              </p>
            </div>
          </Card>

          {/* Billing Policy */}
          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Billing Policy</h2>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Subscription Billing</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Monthly subscriptions: $19.99/month</li>
                    <li>• Annual subscriptions: $199.99/year (save 17%)</li>
                    <li>• Automatic renewal unless cancelled</li>
                    <li>• Secure payment processing via Stripe</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Payment Methods</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Credit cards (Visa, MasterCard, Amex)</li>
                    <li>• Debit cards</li>
                    <li>• ACH bank transfers (annual plans)</li>
                    <li>• Business accounts supported</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          {/* Refund Policy */}
          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <RefreshCw className="h-6 w-6 text-primary" />
              Refund Policy
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">30-Day Money-Back Guarantee</h3>
                <p className="text-muted-foreground mb-4">
                  We offer a full refund within 30 days of your first paid subscription if you're not satisfied with our service.
                </p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-800 dark:text-amber-200">Refund Conditions</h3>
                    <ul className="text-sm text-amber-700 dark:text-amber-300 mt-2 space-y-1">
                      <li>• Refunds available within 30 days of initial payment</li>
                      <li>• Must contact support to request refund</li>
                      <li>• Partial refunds not available for partial months</li>
                      <li>• Refunds processed within 5-10 business days</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Cancellation Policy</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Cancel anytime from your account settings</li>
                  <li>• Access continues until end of current billing period</li>
                  <li>• No cancellation fees or penalties</li>
                  <li>• Data export available for 90 days after cancellation</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Contact */}
          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Mail className="h-6 w-6 text-primary" />
              Billing Support
            </h2>
            <p className="text-muted-foreground mb-4">
              Have questions about billing, refunds, or need to cancel your subscription? We're here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-primary" />
                <a href="mailto:billing@true-trucker-ifta-pro.com" className="text-primary hover:underline">
                  billing@true-trucker-ifta-pro.com
                </a>
              </div>
              <div className="text-sm text-muted-foreground">
                Response within 24 hours
              </div>
            </div>
          </Card>

          {/* Back to Home */}
          <div className="text-center">
            <Button onClick={() => navigate('/')} variant="outline">
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;