import { 
  Shield, MapPin, Camera, CreditCard, Database, Cloud, 
  User, Truck, Receipt, FileText, Globe, Lock, Server,
  AlertTriangle, CheckCircle, Info
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface DataItem {
  name: string;
  purpose: string;
  retention: string;
  shared: boolean;
  optional: boolean;
}

interface PermissionItem {
  name: string;
  icon: React.ReactNode;
  purpose: string;
  whenCollected: string;
  userControl: string;
}

interface ThirdPartyService {
  name: string;
  dataShared: string[];
  purpose: string;
  privacyUrl: string;
}

const DataCollectionSummary = () => {
  const personalData: DataItem[] = [
    { name: 'Email Address', purpose: 'Account authentication & communications', retention: 'Until account deletion', shared: false, optional: false },
    { name: 'Company Name', purpose: 'Business profile & IFTA reporting', retention: 'Until account deletion', shared: false, optional: true },
    { name: 'Phone Number', purpose: 'Account recovery & support', retention: 'Until account deletion', shared: false, optional: true },
    { name: 'DOT Number', purpose: 'Regulatory compliance identification', retention: 'Until account deletion', shared: false, optional: true },
    { name: 'FEID/EIN', purpose: 'Tax reporting identification', retention: 'Until account deletion', shared: false, optional: true },
    { name: 'Company Address', purpose: 'Business profile & jurisdiction determination', retention: 'Until account deletion', shared: false, optional: true },
  ];

  const tripData: DataItem[] = [
    { name: 'Start/End Locations', purpose: 'Mileage tracking & state allocation', retention: 'Until account deletion', shared: false, optional: false },
    { name: 'Trip Dates', purpose: 'Quarterly IFTA reporting periods', retention: 'Until account deletion', shared: false, optional: false },
    { name: 'Miles Driven', purpose: 'IFTA tax calculation per jurisdiction', retention: 'Until account deletion', shared: false, optional: false },
    { name: 'Trip Purpose', purpose: 'Business vs personal classification', retention: 'Until account deletion', shared: false, optional: false },
    { name: 'Route Data', purpose: 'State-by-state mileage breakdown', retention: 'Until account deletion', shared: false, optional: false },
  ];

  const fuelData: DataItem[] = [
    { name: 'Fuel Purchase Amount', purpose: 'IFTA fuel tax credit calculation', retention: 'Until account deletion', shared: false, optional: false },
    { name: 'Gallons Purchased', purpose: 'MPG calculation & tax reporting', retention: 'Until account deletion', shared: false, optional: false },
    { name: 'Purchase Location/State', purpose: 'Fuel tax credit jurisdiction', retention: 'Until account deletion', shared: false, optional: false },
    { name: 'Vendor Name', purpose: 'Audit documentation', retention: 'Until account deletion', shared: false, optional: true },
    { name: 'Receipt Images', purpose: 'OCR scanning & audit documentation', retention: 'Until account deletion', shared: false, optional: true },
  ];

  const vehicleData: DataItem[] = [
    { name: 'Unit Number', purpose: 'Fleet identification', retention: 'Until account deletion', shared: false, optional: false },
    { name: 'VIN', purpose: 'Vehicle identification for compliance', retention: 'Until account deletion', shared: false, optional: true },
    { name: 'License Plate', purpose: 'Vehicle identification', retention: 'Until account deletion', shared: false, optional: true },
    { name: 'Make/Model/Year', purpose: 'Fleet management', retention: 'Until account deletion', shared: false, optional: true },
    { name: 'IFTA Account Number', purpose: 'Tax reporting credentials', retention: 'Until account deletion', shared: false, optional: true },
  ];

  const permissions: PermissionItem[] = [
    {
      name: 'Location (GPS)',
      icon: <MapPin className="h-5 w-5" />,
      purpose: 'Automatic mileage tracking, state-line detection, and route calculation',
      whenCollected: 'Only when actively logging trips with "Auto Track" enabled',
      userControl: 'Can switch to "Manual Entry" mode at any time in Settings',
    },
    {
      name: 'Camera',
      icon: <Camera className="h-5 w-5" />,
      purpose: 'Scanning fuel receipts and Bills of Lading for OCR data extraction',
      whenCollected: 'Only when user initiates a scan',
      userControl: 'Can manually enter receipt data instead',
    },
    {
      name: 'Photo Library',
      icon: <FileText className="h-5 w-5" />,
      purpose: 'Upload existing receipt photos for scanning',
      whenCollected: 'Only when user selects photos to upload',
      userControl: 'Optional - can use camera capture instead',
    },
  ];

  const thirdParties: ThirdPartyService[] = [
    {
      name: 'Supabase (Database & Auth)',
      dataShared: ['All user data stored', 'Authentication credentials'],
      purpose: 'Secure cloud database and user authentication',
      privacyUrl: 'https://supabase.com/privacy',
    },
    {
      name: 'Stripe (Payments)',
      dataShared: ['Email', 'Payment method', 'Billing address'],
      purpose: 'Subscription billing and payment processing',
      privacyUrl: 'https://stripe.com/privacy',
    },
    {
      name: 'OpenAI',
      dataShared: ['Receipt OCR text (anonymized)', 'No PII transmitted'],
      purpose: 'AI-powered receipt data extraction enhancement',
      privacyUrl: 'https://openai.com/policies/privacy-policy',
    },
    {
      name: 'Mapbox/Distance APIs',
      dataShared: ['Start/end locations (addresses only)', 'No user identifiers'],
      purpose: 'Route calculation and distance estimation',
      privacyUrl: 'https://www.mapbox.com/legal/privacy',
    },
  ];

  const securityMeasures = [
    'All data encrypted in transit (TLS 1.3) and at rest (AES-256)',
    'Row-Level Security (RLS) ensures users only access their own data',
    'Sensitive identifiers (VIN, plates, DOT) masked in UI by default',
    'No data sold to third parties or used for advertising',
    'SOC 2 Type II compliant infrastructure (Supabase)',
    'Regular security audits and penetration testing',
  ];

  const DataTable = ({ data, title, icon }: { data: DataItem[]; title: string; icon: React.ReactNode }) => (
    <div className="space-y-3">
      <h4 className="font-semibold flex items-center gap-2">
        {icon}
        {title}
      </h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 pr-4">Data Type</th>
              <th className="text-left py-2 pr-4">Purpose</th>
              <th className="text-left py-2 pr-4">Retention</th>
              <th className="text-center py-2">Optional</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className="border-b border-muted">
                <td className="py-2 pr-4 font-medium">{item.name}</td>
                <td className="py-2 pr-4 text-muted-foreground">{item.purpose}</td>
                <td className="py-2 pr-4 text-muted-foreground">{item.retention}</td>
                <td className="py-2 text-center">
                  {item.optional ? (
                    <Badge variant="outline" className="text-xs">Optional</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">Required</Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      {/* Header */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Shield className="h-6 w-6 text-primary" />
            Technical Data Collection Summary
          </CardTitle>
          <CardDescription className="text-base">
            Complete documentation of data collection practices for TrueTrucker IFTA Pro.
            Prepared for Google Play Data Safety compliance and regulatory requirements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4 text-center">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-3xl font-bold text-primary">0</div>
              <div className="text-sm text-muted-foreground">Data sold to third parties</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-3xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground">User-controlled data deletion</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-3xl font-bold text-primary">AES-256</div>
              <div className="text-sm text-muted-foreground">Encryption standard</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Categories */}
      <Accordion type="multiple" className="space-y-4">
        <AccordionItem value="personal" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <span className="font-semibold">Personal & Business Information</span>
              <Badge variant="outline" className="ml-2">{personalData.length} items</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <DataTable data={personalData} title="" icon={null} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="trips" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <span className="font-semibold">Trip & Mileage Data</span>
              <Badge variant="outline" className="ml-2">{tripData.length} items</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <DataTable data={tripData} title="" icon={null} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="fuel" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              <span className="font-semibold">Fuel & Receipt Data</span>
              <Badge variant="outline" className="ml-2">{fuelData.length} items</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <DataTable data={fuelData} title="" icon={null} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="vehicles" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              <span className="font-semibold">Vehicle & Fleet Data</span>
              <Badge variant="outline" className="ml-2">{vehicleData.length} items</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <DataTable data={vehicleData} title="" icon={null} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Device Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Device Permissions
          </CardTitle>
          <CardDescription>
            Permissions requested and how they are used
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {permissions.map((permission, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="text-primary">{permission.icon}</div>
                <h4 className="font-semibold">{permission.name}</h4>
              </div>
              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Purpose</p>
                  <p>{permission.purpose}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">When Collected</p>
                  <p>{permission.whenCollected}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">User Control</p>
                  <p>{permission.userControl}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Third-Party Services */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-primary" />
            Third-Party Data Sharing
          </CardTitle>
          <CardDescription>
            External services that receive or process user data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {thirdParties.map((service, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">{service.name}</h4>
                  <p className="text-sm text-muted-foreground">{service.purpose}</p>
                  <div className="flex flex-wrap gap-2">
                    {service.dataShared.map((data, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{data}</Badge>
                    ))}
                  </div>
                </div>
                <a 
                  href={service.privacyUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline whitespace-nowrap"
                >
                  Privacy Policy →
                </a>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Security Measures */}
      <Card className="border-2 border-green-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Security Measures
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {securityMeasures.map((measure, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{measure}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Data Deletion */}
      <Card className="border-2 border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Data Deletion & User Rights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-semibold">Account Deletion Process</h4>
            <p className="text-muted-foreground">
              Users can request complete account deletion from Settings → Security & Privacy → Delete Account.
              Upon confirmation, the following data is permanently removed within 24 hours:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>User profile and authentication records</li>
              <li>All trip logs and mileage records</li>
              <li>Fuel receipts and scanned images</li>
              <li>Vehicle and fleet information</li>
              <li>Bills of lading and freight records</li>
              <li>Subscription and billing history</li>
            </ul>
          </div>
          <Separator />
          <div className="space-y-2">
            <h4 className="font-semibold">GDPR & CCPA Compliance</h4>
            <p className="text-muted-foreground">
              Users have the right to access, export, correct, or delete their personal data.
              Contact support@truetrucker.app for data export requests or compliance inquiries.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Google Play Data Safety Format */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Google Play Data Safety Declaration
          </CardTitle>
          <CardDescription>
            Copy-ready responses for Play Console Data Safety form
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm font-mono">
          <div className="bg-background rounded-lg p-4 space-y-3">
            <div>
              <span className="text-muted-foreground">Data collection:</span>
              <span className="ml-2">Yes, this app collects data</span>
            </div>
            <div>
              <span className="text-muted-foreground">Data shared with third parties:</span>
              <span className="ml-2">Yes (Stripe for payments, infrastructure providers)</span>
            </div>
            <div>
              <span className="text-muted-foreground">Data encrypted in transit:</span>
              <span className="ml-2">Yes</span>
            </div>
            <div>
              <span className="text-muted-foreground">Users can request data deletion:</span>
              <span className="ml-2">Yes (in-app and via email)</span>
            </div>
            <div>
              <span className="text-muted-foreground">Committed to Play Families Policy:</span>
              <span className="ml-2">N/A (not a children's app)</span>
            </div>
            <Separator />
            <div className="text-xs text-muted-foreground">
              Data types collected: Location (approximate & precise), Personal info (name, email, phone, address), 
              Financial info (purchase history), Photos (user-uploaded receipts), App activity, Device identifiers
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataCollectionSummary;
