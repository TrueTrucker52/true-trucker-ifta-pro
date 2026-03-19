import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { User, Building, MapPin, Mail, Phone, FileText, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { sanitizeInput } from '@/lib/validation';
import DataSafetySection from '@/components/DataSafetySection';
import FormProgressBar from '@/components/FormProgressBar';

const Account = () => {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const { subscribed, subscription_tier, loading: subscriptionLoading } = useSubscription();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [copyPhysicalAddress, setCopyPhysicalAddress] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const requiredFields = [
    'firstName', 'lastName', 'email', 'emailConfirm', 'phone',
    'carrierType', 'feid',
    'physicalStreet', 'physicalCity', 'physicalState', 'physicalZip',
    'mailingStreet', 'mailingCity', 'mailingState', 'mailingZip',
  ] as const;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    emailConfirm: '',
    phone: '',
    alternatePhone: '',
    companyName: '',
    carrierType: '',
    feid: '',
    motorCarrier: '',
    dotNumber: '',
    physicalStreet: '',
    physicalCity: '',
    physicalCountry: 'United States',
    physicalState: '',
    physicalZip: '',
    mailingStreet: '',
    mailingCity: '',
    mailingCountry: 'United States',
    mailingState: '',
    mailingZip: '',
    irpJurisdiction: '',
    irpAccount: '',
    irpRenewalMonth: '',
    otherEmail: '',
    iftaJurisdiction: '',
    iftaAccount: '',
    kyuNumber: '',
    newMexicoMtd: '',
    newYorkHut: '',
    oregonAccount: '',
  });

  const isFieldEmpty = (field: string) => !formData[field as keyof typeof formData];
  const hasError = (field: string) => showValidation && isFieldEmpty(field);

  const states = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 
    'Delaware', 'District of Columbia', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 
    'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 
    'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 
    'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 
    'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 
    'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 
    'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
  ];

  const carrierTypes = [
    { value: 'private', label: 'Private' },
    { value: 'exempt', label: 'Exempt' },
    { value: 'icc-common', label: 'ICC Common' },
    { value: 'icc-contract', label: 'ICC Contract' },
  ];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (copyPhysicalAddress && field.startsWith('physical')) {
        const mailingField = field.replace('physical', 'mailing');
        return { ...updated, [mailingField]: value };
      }
      return updated;
    });
  };

  const handleCopyAddress = (checked: boolean) => {
    setCopyPhysicalAddress(checked);
    if (checked) {
      setFormData(prev => ({
        ...prev,
        mailingStreet: prev.physicalStreet,
        mailingCity: prev.physicalCity,
        mailingCountry: prev.physicalCountry,
        mailingState: prev.physicalState,
        mailingZip: prev.physicalZip,
      }));
    }
  };

  // Helper components for validation styling
  const FieldError = ({ field }: { field: string }) => {
    if (!hasError(field)) return null;
    return <p className="text-sm text-destructive mt-1">This field is required</p>;
  };

  const fieldLabelClass = (field: string) =>
    hasError(field) ? 'text-destructive' : '';

  const fieldInputClass = (field: string) =>
    hasError(field) ? 'border-destructive focus-visible:ring-destructive' : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!user?.id) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in again to save your company information.',
        variant: 'destructive',
      });
      navigate('/auth');
      setLoading(false);
      return;
    }

    const emptyRequired = requiredFields.filter(f => isFieldEmpty(f));

    if (emptyRequired.length > 0) {
      setShowValidation(true);
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields before continuing.',
        variant: 'destructive',
      });
      setTimeout(() => {
        const el = document.getElementById(emptyRequired[0]);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      setLoading(false);
      return;
    }

    if (formData.email !== formData.emailConfirm) {
      toast({
        title: 'Email mismatch',
        description: 'Email addresses do not match.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    try {
      const companyAddress = [
        formData.physicalStreet,
        formData.physicalCity,
        formData.physicalState,
        formData.physicalZip,
      ]
        .filter(Boolean)
        .join(', ');

      const { error } = await supabase
        .from('profiles')
        .update({
          company_setup_completed: true,
          company_name: sanitizeInput(formData.companyName) || null,
          company_address: sanitizeInput(companyAddress) || null,
          dot_number: sanitizeInput(formData.dotNumber) || null,
          feid_number: sanitizeInput(formData.feid) || null,
          phone: sanitizeInput(formData.phone) || null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await refreshProfile();

      toast({
        title: 'Company setup saved',
        description: 'Your information was saved successfully.',
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error saving account information:', error);
      toast({
        title: 'Could not save',
        description: error?.message || 'There was an error saving your information. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="absolute top-8 left-8"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <div className="bg-primary/10 p-3 rounded-full">
              <User className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Account Information</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Complete your account setup to access our IFTA compliance platform
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <FormProgressBar
            steps={[
              { label: 'Driver Information', fields: ['firstName', 'lastName', 'email', 'emailConfirm', 'phone'] },
              { label: 'Company & Address', fields: ['carrierType', 'feid', 'physicalStreet', 'physicalCity', 'physicalState', 'physicalZip'] },
              { label: 'Mailing Address', fields: ['mailingStreet', 'mailingCity', 'mailingState', 'mailingZip'] },
              { label: 'Review & Billing', fields: [] },
            ]}
            formData={formData}
            hasAttemptedSubmit={showValidation}
          />
        </div>

        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-8">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Enter your personal contact details</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="firstName" className={fieldLabelClass('firstName')}>First Name *</Label>
                  <Input
                    id="firstName"
                    required
                    className={fieldInputClass('firstName')}
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                  />
                  <FieldError field="firstName" />
                </div>
                <div>
                  <Label htmlFor="lastName" className={fieldLabelClass('lastName')}>Last Name *</Label>
                  <Input
                    id="lastName"
                    required
                    className={fieldInputClass('lastName')}
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                  />
                  <FieldError field="lastName" />
                </div>
                <div>
                  <Label htmlFor="phone" className={fieldLabelClass('phone')}>Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    className={fieldInputClass('phone')}
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                  <FieldError field="phone" />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className={fieldLabelClass('email')}>Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    className={fieldInputClass('email')}
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                  <FieldError field="email" />
                </div>
                <div>
                  <Label htmlFor="emailConfirm" className={fieldLabelClass('emailConfirm')}>Repeat Email Address *</Label>
                  <Input
                    id="emailConfirm"
                    type="email"
                    required
                    className={fieldInputClass('emailConfirm')}
                    value={formData.emailConfirm}
                    onChange={(e) => handleInputChange('emailConfirm', e.target.value)}
                  />
                  <FieldError field="emailConfirm" />
                </div>
                <div>
                  <Label htmlFor="alternatePhone">Alternate Phone Number</Label>
                  <Input
                    id="alternatePhone"
                    type="tel"
                    value={formData.alternatePhone}
                    onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Company Information
              </CardTitle>
              <CardDescription>Enter your business and regulatory details</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="carrierType" className={fieldLabelClass('carrierType')}>Carrier Type *</Label>
                  <Select value={formData.carrierType} onValueChange={(value) => handleInputChange('carrierType', value)}>
                    <SelectTrigger id="carrierType" className={fieldInputClass('carrierType')}>
                      <SelectValue placeholder="Select carrier type" />
                    </SelectTrigger>
                    <SelectContent>
                      {carrierTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError field="carrierType" />
                </div>
                <div>
                  <Label htmlFor="feid" className={fieldLabelClass('feid')}>FEID # * (Use SSN if no FEID #)</Label>
                  <Input
                    id="feid"
                    required
                    className={fieldInputClass('feid')}
                    value={formData.feid}
                    onChange={(e) => handleInputChange('feid', e.target.value)}
                  />
                  <FieldError field="feid" />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="motorCarrier">Motor Carrier #</Label>
                  <Input
                    id="motorCarrier"
                    value={formData.motorCarrier}
                    onChange={(e) => handleInputChange('motorCarrier', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="dotNumber">Department of Transportation #</Label>
                  <Input
                    id="dotNumber"
                    value={formData.dotNumber}
                    onChange={(e) => handleInputChange('dotNumber', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Physical Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Physical Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="physicalStreet" className={fieldLabelClass('physicalStreet')}>Street Address *</Label>
                  <Input
                    id="physicalStreet"
                    required
                    className={fieldInputClass('physicalStreet')}
                    value={formData.physicalStreet}
                    onChange={(e) => handleInputChange('physicalStreet', e.target.value)}
                  />
                  <FieldError field="physicalStreet" />
                </div>
                <div>
                  <Label htmlFor="physicalCity" className={fieldLabelClass('physicalCity')}>City *</Label>
                  <Input
                    id="physicalCity"
                    required
                    className={fieldInputClass('physicalCity')}
                    value={formData.physicalCity}
                    onChange={(e) => handleInputChange('physicalCity', e.target.value)}
                  />
                  <FieldError field="physicalCity" />
                </div>
                <div>
                  <Label htmlFor="physicalCountry">Country *</Label>
                  <Select value={formData.physicalCountry} onValueChange={(value) => handleInputChange('physicalCountry', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="United States">United States</SelectItem>
                      <SelectItem value="Mexico">Mexico</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="physicalState" className={fieldLabelClass('physicalState')}>State/Region *</Label>
                  <Select value={formData.physicalState} onValueChange={(value) => handleInputChange('physicalState', value)}>
                    <SelectTrigger id="physicalState" className={fieldInputClass('physicalState')}>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError field="physicalState" />
                </div>
                <div>
                  <Label htmlFor="physicalZip" className={fieldLabelClass('physicalZip')}>Postal Code *</Label>
                  <Input
                    id="physicalZip"
                    required
                    className={fieldInputClass('physicalZip')}
                    value={formData.physicalZip}
                    onChange={(e) => handleInputChange('physicalZip', e.target.value)}
                  />
                  <FieldError field="physicalZip" />
                </div>
              </CardContent>
            </Card>

            {/* Mailing Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Mailing Address
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="copyAddress"
                    checked={copyPhysicalAddress}
                    onCheckedChange={handleCopyAddress}
                  />
                  <Label htmlFor="copyAddress" className="text-sm">Copy from physical address</Label>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="mailingStreet" className={fieldLabelClass('mailingStreet')}>Street Address *</Label>
                  <Input
                    id="mailingStreet"
                    required
                    className={fieldInputClass('mailingStreet')}
                    value={formData.mailingStreet}
                    onChange={(e) => handleInputChange('mailingStreet', e.target.value)}
                    disabled={copyPhysicalAddress}
                  />
                  <FieldError field="mailingStreet" />
                </div>
                <div>
                  <Label htmlFor="mailingCity" className={fieldLabelClass('mailingCity')}>City *</Label>
                  <Input
                    id="mailingCity"
                    required
                    className={fieldInputClass('mailingCity')}
                    value={formData.mailingCity}
                    onChange={(e) => handleInputChange('mailingCity', e.target.value)}
                    disabled={copyPhysicalAddress}
                  />
                  <FieldError field="mailingCity" />
                </div>
                <div>
                  <Label htmlFor="mailingCountry">Country *</Label>
                  <Select 
                    value={formData.mailingCountry} 
                    onValueChange={(value) => handleInputChange('mailingCountry', value)}
                    disabled={copyPhysicalAddress}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="United States">United States</SelectItem>
                      <SelectItem value="Mexico">Mexico</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="mailingState" className={fieldLabelClass('mailingState')}>State/Region *</Label>
                  <Select 
                    value={formData.mailingState} 
                    onValueChange={(value) => handleInputChange('mailingState', value)}
                    disabled={copyPhysicalAddress}
                  >
                    <SelectTrigger id="mailingState" className={fieldInputClass('mailingState')}>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError field="mailingState" />
                </div>
                <div>
                  <Label htmlFor="mailingZip" className={fieldLabelClass('mailingZip')}>Postal Code *</Label>
                  <Input
                    id="mailingZip"
                    required
                    className={fieldInputClass('mailingZip')}
                    value={formData.mailingZip}
                    onChange={(e) => handleInputChange('mailingZip', e.target.value)}
                    disabled={copyPhysicalAddress}
                  />
                  <FieldError field="mailingZip" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Additional Information (Optional)
              </CardTitle>
              <CardDescription>
                Regulatory and account details. You can operate with just your home state - 
                multi-state jurisdictions are not required to proceed.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="irpJurisdiction">IRP Base Jurisdiction</Label>
                  <p className="text-xs text-muted-foreground mb-1">Your home state (optional if intrastate only)</p>
                  <Select value={formData.irpJurisdiction} onValueChange={(value) => handleInputChange('irpJurisdiction', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your base state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="irpAccount">IRP Account #</Label>
                  <Input
                    id="irpAccount"
                    value={formData.irpAccount}
                    onChange={(e) => handleInputChange('irpAccount', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="irpRenewalMonth">IRP Renewal Month</Label>
                  <Select value={formData.irpRenewalMonth} onValueChange={(value) => handleInputChange('irpRenewalMonth', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="otherEmail">Other Email To Receive Documents</Label>
                  <Input
                    id="otherEmail"
                    type="email"
                    value={formData.otherEmail}
                    onChange={(e) => handleInputChange('otherEmail', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="iftaJurisdiction">IFTA Base Jurisdiction</Label>
                  <p className="text-xs text-muted-foreground mb-1">Your home state for IFTA reporting</p>
                  <Select value={formData.iftaJurisdiction} onValueChange={(value) => handleInputChange('iftaJurisdiction', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your base state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="iftaAccount">IFTA Account #</Label>
                  <Input
                    id="iftaAccount"
                    value={formData.iftaAccount}
                    onChange={(e) => handleInputChange('iftaAccount', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="kyuNumber">Kentucky KYU #</Label>
                  <Input
                    id="kyuNumber"
                    value={formData.kyuNumber}
                    onChange={(e) => handleInputChange('kyuNumber', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="newMexicoMtd">New Mexico MTD #</Label>
                  <Input
                    id="newMexicoMtd"
                    value={formData.newMexicoMtd}
                    onChange={(e) => handleInputChange('newMexicoMtd', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="newYorkHut">New York HUT #</Label>
                  <Input
                    id="newYorkHut"
                    value={formData.newYorkHut}
                    onChange={(e) => handleInputChange('newYorkHut', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="oregonAccount">Oregon Account #</Label>
                  <Input
                    id="oregonAccount"
                    value={formData.oregonAccount}
                    onChange={(e) => handleInputChange('oregonAccount', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security & Privacy Section */}
          <DataSafetySection />

          {/* Submit Buttons */}
          <div className="flex justify-between items-center">
            <Button type="button" variant="outline" onClick={() => navigate('/')}>
              ← Back to Home
            </Button>
            <Button type="submit" disabled={loading} className="px-8">
              {loading ? 'Processing...' : 'Continue to Billing →'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Account;