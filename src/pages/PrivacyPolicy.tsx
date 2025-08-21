import { Shield, Database, Eye, Lock, Phone, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Shield className="h-4 w-4" />
              Privacy & Security
            </div>
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-xl text-muted-foreground">
              Your privacy and data security are our top priorities at TrueTrucker IFTA Pro
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Privacy Overview */}
          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Eye className="h-6 w-6 text-primary" />
              What We Collect
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Account Information</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Email address and password</li>
                  <li>• Company and vehicle information</li>
                  <li>• IFTA registration details</li>
                  <li>• Payment and billing information</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">IFTA Data</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Trip mileage and route information</li>
                  <li>• Fuel purchase receipts and records</li>
                  <li>• Tax calculations and reports</li>
                  <li>• GPS tracking data (when enabled)</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* How We Use Data */}
          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Database className="h-6 w-6 text-primary" />
              How We Use Your Data
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">IFTA Compliance & Reporting</h3>
                <p className="text-sm text-muted-foreground">
                  We process your trip and fuel data to calculate accurate IFTA taxes, generate quarterly reports, 
                  and ensure compliance with state and federal regulations.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Service Improvement</h3>
                <p className="text-sm text-muted-foreground">
                  We analyze aggregated, anonymized data to improve our tax calculation algorithms, 
                  enhance fuel stop recommendations, and develop new features.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Audit Defense</h3>
                <p className="text-sm text-muted-foreground">
                  Your data is organized and maintained to provide comprehensive audit defense documentation 
                  and legal support when needed.
                </p>
              </div>
            </div>
          </Card>

          {/* Data Security */}
          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Lock className="h-6 w-6 text-primary" />
              Data Security & Protection
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Encryption</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption.
                </p>
                <h3 className="font-semibold mb-2">Access Control</h3>
                <p className="text-sm text-muted-foreground">
                  Strict role-based access controls ensure only authorized personnel can access your data.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Data Backup</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Regular automated backups ensure your IFTA data is always protected and recoverable.
                </p>
                <h3 className="font-semibold mb-2">Compliance</h3>
                <p className="text-sm text-muted-foreground">
                  We maintain SOC 2 Type II compliance and follow industry best practices for data protection.
                </p>
              </div>
            </div>
          </Card>

          {/* Data Sharing */}
          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data Sharing & Third Parties</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">We DO NOT sell your data</h3>
                <p className="text-sm text-muted-foreground">
                  Your IFTA and business data is never sold to third parties or used for advertising purposes.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Limited Sharing</h3>
                <p className="text-sm text-muted-foreground">
                  We only share data when required by law, for IFTA compliance reporting to tax authorities, 
                  or with your explicit consent for audit defense purposes.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Service Providers</h3>
                <p className="text-sm text-muted-foreground">
                  We work with trusted service providers (payment processing, cloud hosting) who are 
                  contractually bound to protect your data with the same standards we maintain.
                </p>
              </div>
            </div>
          </Card>

          {/* Your Rights */}
          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Your Rights & Controls</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Access & Export</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Download all your IFTA data</li>
                  <li>• Export reports and calculations</li>
                  <li>• Access audit trail logs</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Control & Deletion</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Update or correct your information</li>
                  <li>• Delete specific records</li>
                  <li>• Close your account entirely</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Cookies & Tracking */}
          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Cookies & Tracking</h2>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We use essential cookies to maintain your login session and app functionality. 
                We also use analytics cookies to understand how our service is used and improve performance.
              </p>
              <div>
                <h3 className="font-semibold mb-2">Cookie Types</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Essential:</strong> Required for login and core functionality</li>
                  <li>• <strong>Analytics:</strong> Anonymous usage statistics (opt-out available)</li>
                  <li>• <strong>Performance:</strong> Error tracking and performance monitoring</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Contact */}
          <Card className="p-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="text-muted-foreground mb-6">
              Have questions about this privacy policy or how we handle your data? We're here to help.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Privacy Questions</p>
                  <p className="text-sm text-muted-foreground">support@true-trucker-ifta-pro.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Support Line</p>
                  <p className="text-sm text-muted-foreground">1-800-IFTA-PRO</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Back to Home */}
          <div className="text-center mt-12">
            <a 
              href="/" 
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              ← Back to TrueTrucker IFTA Pro
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;