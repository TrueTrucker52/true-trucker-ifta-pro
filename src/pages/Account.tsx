import { useState } from 'react';
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

const Account = () => {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const { subscribed, subscription_tier, loading: subscriptionLoading } = useSubscription();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [copyPhysicalAddress, setCopyPhysicalAddress] = useState(false);

  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: user?.email || '',
    emailConfirm: '',
    phone: '',
    alternatePhone: '',
    
    // Company Information
    companyName: '',
    carrierType: '',
    feid: '',
    motorCarrier: '',
    dotNumber: '',
    
    // Physical Address
    physicalStreet: '',
    physicalCity: '',
    physicalCountry: 'United States',
    physicalState: '',
    physicalZip: '',
    
    // Mailing Address
    mailingStreet: '',
    mailingCity: '',
    mailingCountry: 'United States',
    mailingState: '',
    mailingZip: '',
    
    // Additional Information
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
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Copy physical address to mailing address if checkbox is checked
    if (copyPhysicalAddress && field.startsWith('physical')) {
      const mailingField = field.replace('physical', 'mailing');
      setFormData(prev => ({ ...prev, [mailingField]: value }));
    }
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

    // Validate required fields (note: custom Select components won't be enforced by native HTML validation)
    const requiredFieldsMissing =
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone ||
      !formData.carrierType ||
      !formData.feid ||
      !formData.physicalStreet ||
      !formData.physicalCity ||
      !formData.physicalState ||
      !formData.physicalZip ||
      !formData.mailingStreet ||
      !formData.mailingCity ||
      !formData.mailingState ||
      !formData.mailingZip;

    if (requiredFieldsMissing) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields before continuing.',
        variant: 'destructive',
      });
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

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                1
              </div>
              <span className="ml-2 text-sm font-medium text-primary">Account Information</span>
            </div>
            <div className="h-0.5 w-16 bg-muted"></div>
            <div className="flex items-center">
              <div className="bg-muted text-muted-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                2
              </div>
              <span className="ml-2 text-sm text-muted-foreground">Billing Information & Checkout</span>
            </div>
            <div className="flex items-center ml-4">
              <Lock className="h-5 w-5 text-green-600" />
              <span className="ml-2 text-sm font-medium text-green-600">100% Secure Checkout</span>
            </div>
          </div>
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
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    required
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    required
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="emailConfirm">Repeat Email Address *</Label>
                  <Input
                    id="emailConfirm"
                    type="email"
                    required
                    value={formData.emailConfirm}
                    onChange={(e) => handleInputChange('emailConfirm', e.target.value)}
                  />
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
                  <Label htmlFor="carrierType">Carrier Type *</Label>
                  <Select value={formData.carrierType} onValueChange={(value) => handleInputChange('carrierType', value)}>
                    <SelectTrigger>
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
                </div>
                <div>
                  <Label htmlFor="feid">FEID # * (Use SSN if no FEID #)</Label>
                  <Input
                    id="feid"
                    required
                    value={formData.feid}
                    onChange={(e) => handleInputChange('feid', e.target.value)}
                  />
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
                  <Label htmlFor="physicalStreet">Street Address *</Label>
                  <Input
                    id="physicalStreet"
                    required
                    value={formData.physicalStreet}
                    onChange={(e) => handleInputChange('physicalStreet', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="physicalCity">City *</Label>
                  <Input
                    id="physicalCity"
                    required
                    value={formData.physicalCity}
                    onChange={(e) => handleInputChange('physicalCity', e.target.value)}
                  />
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
                  <Label htmlFor="physicalState">State/Region *</Label>
                  <Select value={formData.physicalState} onValueChange={(value) => handleInputChange('physicalState', value)}>
                    <SelectTrigger>
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
                </div>
                <div>
                  <Label htmlFor="physicalZip">Postal Code *</Label>
                  <Input
                    id="physicalZip"
                    required
                    value={formData.physicalZip}
                    onChange={(e) => handleInputChange('physicalZip', e.target.value)}
                  />
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
                  <Label htmlFor="mailingStreet">Street Address *</Label>
                  <Input
                    id="mailingStreet"
                    required
                    value={formData.mailingStreet}
                    onChange={(e) => handleInputChange('mailingStreet', e.target.value)}
                    disabled={copyPhysicalAddress}
                  />
                </div>
                <div>
                  <Label htmlFor="mailingCity">City *</Label>
                  <Input
                    id="mailingCity"
                    required
                    value={formData.mailingCity}
                    onChange={(e) => handleInputChange('mailingCity', e.target.value)}
                    disabled={copyPhysicalAddress}
                  />
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
                  <Label htmlFor="mailingState">State/Region *</Label>
                  <Select 
                    value={formData.mailingState} 
                    onValueChange={(value) => handleInputChange('mailingState', value)}
                    disabled={copyPhysicalAddress}
                  >
                    <SelectTrigger>
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
                </div>
                <div>
                  <Label htmlFor="mailingZip">Postal Code *</Label>
                  <Input
                    id="mailingZip"
                    required
                    value={formData.mailingZip}
                    onChange={(e) => handleInputChange('mailingZip', e.target.value)}
                    disabled={copyPhysicalAddress}
                  />
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