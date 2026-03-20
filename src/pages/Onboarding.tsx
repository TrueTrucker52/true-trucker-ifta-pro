import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/hooks/useOnboarding';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { OptimizedLoadingState } from '@/components/OptimizedLoadingState';
import { US_STATES } from '@/lib/usStates';
import {
  Truck, User, Users, MapPin, Camera, Bell, Map,
  ChevronRight, Check, Sparkles, HelpCircle, Phone
} from 'lucide-react';

const TOTAL_STEPS = 7;

const Onboarding: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const onboarding = useOnboarding();
  const [currentStep, setCurrentStep] = useState(1);
  const [stepTimeoutVisible, setStepTimeoutVisible] = useState(false);

  // Step 2 state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseState, setLicenseState] = useState('');

  // Step 3 state
  const [operationType, setOperationType] = useState<'solo' | 'fleet_driver' | 'fleet_owner' | null>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [fleetJoined, setFleetJoined] = useState<string | null>(null);

  // Step 4 state
  const [truckNumber, setTruckNumber] = useState('');
  const [truckMake, setTruckMake] = useState('');
  const [truckModel, setTruckModel] = useState('');
  const [truckYear, setTruckYear] = useState('');
  const [vin, setVin] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [plateState, setPlateState] = useState('');
  const [fuelType, setFuelType] = useState('diesel');

  // Step 5 state
  const [trackingMethod, setTrackingMethod] = useState<'gps' | 'manual' | null>(null);

  // Step 6 state
  const [cameraWorking, setCameraWorking] = useState<boolean | null>(null);
  const [cameraTesting, setCameraTesting] = useState(false);
  const [cameraPreviewActive, setCameraPreviewActive] = useState(false);
  const [cameraMessage, setCameraMessage] = useState('');

  // Step 7 state
  const [notificationStatus, setNotificationStatus] = useState<'idle' | 'granted' | 'denied' | 'unsupported' | 'install_required'>('idle');
  const [notificationLoading, setNotificationLoading] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!onboarding.loading && onboarding.isComplete) {
      navigate('/dashboard', { replace: true });
      return;
    }
    if (!onboarding.loading && !onboarding.id && user?.id) {
      onboarding.initOnboarding();
    }
    if (!onboarding.loading && onboarding.stepCompleted > 0) {
      setCurrentStep(Math.min(onboarding.stepCompleted + 1, TOTAL_STEPS));
    }
  }, [onboarding.loading, onboarding.isComplete, onboarding.id, onboarding.stepCompleted, user?.id, navigate]);

  useEffect(() => {
    setStepTimeoutVisible(false);
    const timeout = window.setTimeout(() => setStepTimeoutVisible(true), 60000);

    return () => window.clearTimeout(timeout);
  }, [currentStep]);

  useEffect(() => {
    if (!cameraPreviewActive || !videoRef.current || !streamRef.current) return;

    videoRef.current.srcObject = streamRef.current;
    videoRef.current.play().catch(() => undefined);
  }, [cameraPreviewActive]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    };
  }, []);

  if (onboarding.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <OptimizedLoadingState size="lg" message="Loading your setup..." />
      </div>
    );
  }

  const progressPercent = Math.round((currentStep / TOTAL_STEPS) * 100);

  const stopCameraStream = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    setCameraPreviewActive(false);
  };

  const finishAndGoToDashboard = async () => {
    stopCameraStream();
    await onboarding.completeStep(TOTAL_STEPS);
    await onboarding.finishOnboarding();
    navigate('/dashboard', { replace: true });
  };

  const handleNext = async () => {
    await onboarding.completeStep(currentStep);
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
      return;
    }

    await finishAndGoToDashboard();
  };

  const handleSkip = async () => {
    if (currentStep === 6) {
      localStorage.setItem('camera_not_tested', 'true');
      stopCameraStream();
      setCameraWorking(false);
      setCameraMessage('Camera test skipped for now. You can test it later from the dashboard.');
    }

    if (currentStep === 7) {
      localStorage.setItem('notifications_enabled', 'false');
      setNotificationStatus('denied');
    }

    await onboarding.skipStep(currentStep);
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
      return;
    }

    await finishAndGoToDashboard();
  };

  const handleFinish = async () => {
    await finishAndGoToDashboard();
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    try {
      await supabase
        .from('profiles')
        .update({
          phone,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
    } catch {
      // Never trap onboarding progress on profile save issues
    }
    await handleNext();
  };

  const handleSaveTruck = async () => {
    if (!user?.id || !truckNumber) return;
    try {
      await supabase.from('trucks').insert({
        user_id: user.id,
        unit_number: truckNumber,
        make: truckMake || null,
        model: truckModel || null,
        year: truckYear ? parseInt(truckYear) : null,
        vin: vin || null,
        license_plate: licensePlate || null,
        registration_state: plateState || null,
        fuel_type: fuelType,
      });
    } catch {
      // Never trap onboarding progress on truck save issues
    }
    await handleNext();
  };

  const handleJoinFleet = async () => {
    if (!user?.id || !inviteCode) return;
    try {
      const code = inviteCode.toUpperCase().trim();
      const { data: fleet } = await supabase
        .from('fleets')
        .select('id, company_name')
        .eq('invite_code', code)
        .maybeSingle();

      if (fleet) {
        await supabase.from('fleet_members').insert({
          fleet_id: fleet.id,
          driver_id: user.id,
          status: 'active',
          invitation_status: 'accepted',
        });
        setFleetJoined(fleet.company_name);
      }
    } catch {
      // Drivers can still continue even if fleet join fails right now
    }
  };

  const openSystemSettings = () => {
    window.open('app-settings:', '_blank');
  };

  const handleTestCamera = async () => {
    stopCameraStream();
    setCameraTesting(true);
    setCameraWorking(null);
    setCameraMessage('');

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('camera_not_supported');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });

      streamRef.current = stream;
      setCameraPreviewActive(true);
      setCameraMessage('Camera is live — take a quick test photo to confirm everything works.');
    } catch {
      setCameraWorking(false);
      setCameraPreviewActive(false);
      localStorage.setItem('camera_not_tested', 'true');
      setCameraMessage('Camera access is blocked right now. You can allow it in iPhone Settings or skip this step and continue.');
    } finally {
      setCameraTesting(false);
    }
  };

  const handleCaptureCameraTest = () => {
    const video = videoRef.current;

    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const context = canvas.getContext('2d');

    if (!context) return;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    stopCameraStream();
    setCameraWorking(true);
    setCameraMessage('Camera working perfectly! Your BOL scanner is ready.');
    localStorage.removeItem('camera_not_tested');
  };

  const handleRequestNotifications = async () => {
    setNotificationLoading(true);

    try {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone;

      if (!('Notification' in window)) {
        setNotificationStatus('unsupported');
        localStorage.setItem('notifications_enabled', 'false');
      } else if (isIOS && !isStandalone) {
        setNotificationStatus('install_required');
        localStorage.setItem('notifications_enabled', 'false');
      } else {
        const permission = await Notification.requestPermission();

        if (permission === 'granted') {
          setNotificationStatus('granted');
          localStorage.setItem('notifications_enabled', 'true');
        } else {
          setNotificationStatus('denied');
          localStorage.setItem('notifications_enabled', 'false');
        }
      }
    } catch {
      setNotificationStatus('unsupported');
      localStorage.setItem('notifications_enabled', 'false');
    } finally {
      setNotificationLoading(false);
    }

    await handleNext();
  };

  const driverName = profile?.company_name || user?.email?.split('@')[0] || 'Driver';

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="bg-primary/10 p-6 rounded-full">
                <Truck className="h-16 w-16 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Welcome to TrueTrucker IFTA Pro!</h1>
            <p className="text-lg text-muted-foreground">Hi {driverName}! 👋</p>
            <p className="text-muted-foreground max-w-md mx-auto">
              You're about to set up the easiest IFTA tracking system on the road.
            </p>
            <div className="text-left max-w-sm mx-auto space-y-2">
              {['Set up your driver profile', 'Configure your truck details', 'Connect to your fleet', 'Set up mileage tracking', 'Test your BOL camera scanner', 'Set up notifications', 'Take a quick app tour'].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-accent" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">⏱️ Takes about 5 minutes</p>
            <div className="space-y-3">
              <Button size="lg" className="w-full max-w-xs" onClick={handleNext}>
                Let's Get Started! 🚀
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { onboarding.finishOnboarding(); navigate('/dashboard'); }}>
                I'll Set Up Later
              </Button>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-full"><User className="h-6 w-6 text-primary" /></div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Tell Us About Yourself</h2>
                <p className="text-sm text-muted-foreground">Your info helps auto-fill IFTA reports</p>
              </div>
            </div>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>First Name</Label><Input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="John" /></div>
                <div><Label>Last Name</Label><Input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Smith" /></div>
              </div>
              <div><Label>Phone Number</Label><Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 123-4567" type="tel" /></div>
              <div><Label>License Number</Label><Input value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} placeholder="DL-12345678" /></div>
              <div>
                <Label>License State</Label>
                <select value={licenseState} onChange={e => setLicenseState(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Select State</option>
                  {US_STATES.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button className="flex-1" onClick={handleSaveProfile}>Save & Continue <ChevronRight className="h-4 w-4 ml-1" /></Button>
              <Button variant="outline" onClick={handleSkip}>Skip Step</Button>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-full"><Users className="h-6 w-6 text-primary" /></div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">How Do You Operate?</h2>
                <p className="text-sm text-muted-foreground">This determines your dashboard experience</p>
              </div>
            </div>

            {!operationType ? (
              <div className="space-y-3">
                {[
                  { type: 'solo' as const, icon: User, title: "I'm an Independent Owner Operator", desc: 'I own my truck and operate independently' },
                  { type: 'fleet_driver' as const, icon: Truck, title: 'I Drive for a Fleet', desc: 'My employer will give me a Fleet Invite Code' },
                  { type: 'fleet_owner' as const, icon: Users, title: 'I Own a Fleet', desc: 'I manage multiple trucks and drivers' },
                ].map(opt => (
                  <Card key={opt.type} className="cursor-pointer hover:border-primary transition-colors" onClick={() => setOperationType(opt.type)}>
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="bg-primary/10 p-3 rounded-lg"><opt.icon className="h-6 w-6 text-primary" /></div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{opt.title}</p>
                        <p className="text-sm text-muted-foreground">{opt.desc}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : operationType === 'fleet_driver' ? (
              <div className="space-y-4">
                <Card><CardContent className="p-4 space-y-4">
                  <Label className="text-base font-semibold">Enter Your Fleet Invite Code</Label>
                  <Input value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())} placeholder="MIKE42" maxLength={6} className="text-center text-2xl tracking-widest font-mono" />
                  {fleetJoined && (
                    <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 text-center">
                      <Check className="h-5 w-5 text-accent mx-auto mb-1" />
                      <p className="font-semibold text-foreground">You joined {fleetJoined}!</p>
                    </div>
                  )}
                  {!fleetJoined && <Button onClick={handleJoinFleet} disabled={inviteCode.length < 4} className="w-full">Join Fleet</Button>}
                </CardContent></Card>
                <div className="flex gap-3">
                  <Button className="flex-1" onClick={handleNext} disabled={!fleetJoined}>Continue <ChevronRight className="h-4 w-4 ml-1" /></Button>
                  <Button variant="outline" onClick={() => setOperationType(null)}>Back</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Card><CardContent className="p-4 text-center">
                  <Check className="h-8 w-8 text-accent mx-auto mb-2" />
                  <p className="font-semibold text-foreground">
                    {operationType === 'solo' ? 'Independent Owner Operator' : 'Fleet Owner'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {operationType === 'solo' ? "We'll set up your personal dashboard" : "We'll configure your fleet management tools"}
                  </p>
                </CardContent></Card>
                <Button className="w-full" onClick={handleNext}>Continue <ChevronRight className="h-4 w-4 ml-1" /></Button>
              </div>
            )}
          </motion.div>
        );

      case 4:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-full"><Truck className="h-6 w-6 text-primary" /></div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Tell Us About Your Truck</h2>
                <p className="text-sm text-muted-foreground">Required for accurate IFTA calculations</p>
              </div>
            </div>
            <div className="grid gap-4">
              <div><Label>Truck/Unit Number *</Label><Input value={truckNumber} onChange={e => setTruckNumber(e.target.value)} placeholder="101" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Make</Label><Input value={truckMake} onChange={e => setTruckMake(e.target.value)} placeholder="Freightliner" /></div>
                <div><Label>Model</Label><Input value={truckModel} onChange={e => setTruckModel(e.target.value)} placeholder="Cascadia" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Year</Label><Input value={truckYear} onChange={e => setTruckYear(e.target.value)} placeholder="2024" type="number" /></div>
                <div><Label>VIN</Label><Input value={vin} onChange={e => setVin(e.target.value)} placeholder="1FUJGLDR..." /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>License Plate</Label><Input value={licensePlate} onChange={e => setLicensePlate(e.target.value)} /></div>
                <div>
                  <Label>Plate State</Label>
                  <select value={plateState} onChange={e => setPlateState(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="">Select</option>
                    {US_STATES.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <Label>Fuel Type</Label>
                <div className="flex gap-3 mt-1">
                  {['diesel', 'gasoline', 'natural_gas'].map(ft => (
                    <Button key={ft} variant={fuelType === ft ? 'default' : 'outline'} size="sm" onClick={() => setFuelType(ft)}>
                      {ft === 'natural_gas' ? 'Natural Gas' : ft.charAt(0).toUpperCase() + ft.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button className="flex-1" onClick={handleSaveTruck} disabled={!truckNumber}>Save & Continue <ChevronRight className="h-4 w-4 ml-1" /></Button>
              <Button variant="outline" onClick={handleSkip}>Skip Step</Button>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-full"><MapPin className="h-6 w-6 text-primary" /></div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Set Up Mileage Tracking</h2>
                <p className="text-sm text-muted-foreground">Choose how to track your miles</p>
              </div>
            </div>
            <div className="space-y-3">
              <Card className={`cursor-pointer transition-colors ${trackingMethod === 'gps' ? 'border-primary bg-primary/5' : 'hover:border-primary'}`} onClick={() => setTrackingMethod('gps')}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">Automatic GPS Tracking</p>
                        <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full font-medium">RECOMMENDED</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">App tracks miles automatically using GPS. Works in background.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className={`cursor-pointer transition-colors ${trackingMethod === 'manual' ? 'border-primary bg-primary/5' : 'hover:border-primary'}`} onClick={() => setTrackingMethod('manual')}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <User className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <p className="font-semibold text-foreground">Manual Entry</p>
                      <p className="text-sm text-muted-foreground mt-1">Enter odometer readings manually after each trip.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {trackingMethod === 'gps' && (
              <Card className="bg-muted/50 border-dashed">
                <CardContent className="p-4 text-center space-y-3">
                  <p className="text-sm text-muted-foreground">🔐 TrueTrucker needs location access to track miles. We only track when you start a trip.</p>
                  <Button onClick={async () => {
                    try { await navigator.geolocation.getCurrentPosition(() => {}); } catch {}
                    await handleNext();
                  }}>Allow Location Access</Button>
                </CardContent>
              </Card>
            )}
            {trackingMethod === 'manual' && (
              <Button className="w-full" onClick={handleNext}>Continue with Manual Entry <ChevronRight className="h-4 w-4 ml-1" /></Button>
            )}
            {!trackingMethod && (
              <Button variant="outline" onClick={handleSkip} className="w-full">Skip for Now</Button>
            )}
          </motion.div>
        );

      case 6:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-full"><Camera className="h-6 w-6 text-primary" /></div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Test Your Camera Scanner</h2>
                <p className="text-sm text-muted-foreground">Scan BOLs and fuel receipts with your camera</p>
              </div>
            </div>
            <Card>
              <CardContent className="p-6 text-center space-y-4">
                {cameraPreviewActive ? (
                  <>
                    <div className="overflow-hidden rounded-xl border border-border bg-muted">
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="aspect-video w-full object-cover"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">{cameraMessage}</p>
                    <Button size="lg" onClick={handleCaptureCameraTest}>
                      ✅ Take Test Photo
                    </Button>
                  </>
                ) : cameraWorking === null ? (
                  <>
                    <Camera className="h-16 w-16 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground">Point your camera at any document to test</p>
                    <div className="text-left text-sm text-muted-foreground space-y-1 max-w-xs mx-auto">
                      <p>💡 Tips for best results:</p>
                      <p>— Good lighting is key</p>
                      <p>— Hold phone steady</p>
                      <p>— Keep document flat</p>
                    </div>
                    {cameraMessage ? <p className="text-sm text-muted-foreground">{cameraMessage}</p> : null}
                    <Button size="lg" onClick={handleTestCamera} disabled={cameraTesting}>
                      {cameraTesting ? 'Opening Camera...' : '📷 Test Scan Now'}
                    </Button>
                  </>
                ) : cameraWorking ? (
                  <>
                    <div className="bg-accent/10 p-4 rounded-full inline-block"><Check className="h-10 w-10 text-accent" /></div>
                    <p className="font-semibold text-foreground">Camera working perfectly! ✅</p>
                    <p className="text-sm text-muted-foreground">{cameraMessage || 'Your BOL scanner is ready to use.'}</p>
                    <Button size="lg" onClick={handleNext}>
                      Continue to Step 7 <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="bg-destructive/10 p-4 rounded-full inline-block"><Camera className="h-10 w-10 text-destructive" /></div>
                    <p className="font-semibold text-foreground">⚠️ Camera access needed</p>
                    <p className="text-sm text-muted-foreground">To enable camera on iPhone: Settings → Safari → Camera → Allow</p>
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                      <Button variant="outline" onClick={openSystemSettings}>Open Settings</Button>
                      <Button onClick={handleSkip}>Skip Camera Test</Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            {!cameraPreviewActive && cameraWorking !== true ? (
              <div className="flex gap-3">
                <Button className="flex-1" onClick={handleTestCamera} disabled={cameraTesting}>
                  {cameraTesting ? 'Opening Camera...' : 'Try Camera Again'}
                </Button>
                <Button variant="outline" onClick={handleSkip}>Skip Step</Button>
              </div>
            ) : null}
          </motion.div>
        );

      case 7:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-full"><Bell className="h-6 w-6 text-primary" /></div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Stay on Top of Deadlines</h2>
                <p className="text-sm text-muted-foreground">Never miss an IFTA filing deadline</p>
              </div>
            </div>
            <Card>
              <CardContent className="p-4 space-y-3">
                {[
                  { label: 'IFTA filing deadlines', desc: 'Get reminded 30, 14, 7, and 1 day before' },
                  { label: 'Report status updates', desc: 'Know when reports are approved' },
                  { label: 'Messages from fleet owner', desc: 'Never miss an important message' },
                  { label: 'Auto-save confirmations', desc: 'Know your work is always saved' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-accent mt-1" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}

                {notificationStatus === 'install_required' ? (
                  <div className="rounded-lg border border-border bg-muted/50 p-3 text-sm text-muted-foreground">
                    To get notifications on iPhone, install TrueTrucker to your home screen first.
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                      <Button variant="outline" size="sm" onClick={() => navigate('/install')}>How to Install</Button>
                      <Button size="sm" onClick={handleSkip}>Skip for Now</Button>
                    </div>
                  </div>
                ) : null}

                {notificationStatus === 'granted' ? <p className="text-sm text-accent">✅ Notifications enabled — heading to your dashboard.</p> : null}
                {notificationStatus === 'denied' ? <p className="text-sm text-muted-foreground">Notifications skipped — you can enable them later in settings.</p> : null}
                {notificationStatus === 'unsupported' ? <p className="text-sm text-muted-foreground">Notifications are not available here, but you can still continue now.</p> : null}
              </CardContent>
            </Card>
            <div className="space-y-3">
              <Button size="lg" className="w-full" onClick={handleRequestNotifications} disabled={notificationLoading}>
                🔔 Enable Notifications
              </Button>
              <Button variant="outline" className="w-full" onClick={handleSkip}>Skip Notifications</Button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  // Completion screen after step 7
  if (currentStep > TOTAL_STEPS || onboarding.isComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full text-center space-y-6">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
            <Sparkles className="h-16 w-16 text-secondary mx-auto" />
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground">🎉 You're All Set!</h1>
          <p className="text-muted-foreground">Welcome to TrueTrucker IFTA Pro, {driverName}!</p>
          <Card>
            <CardContent className="p-4 space-y-2 text-left">
              {['Profile complete', 'Truck configured', trackingMethod === 'gps' ? 'GPS tracking enabled' : 'Manual tracking selected', 'Camera scanner tested', 'Notifications configured'].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-accent" />
                  <span className="text-foreground">{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Your next IFTA deadline:</p>
            <p className="font-semibold text-foreground">📅 Q1 2026 — Due April 30, 2026</p>
          </div>
          <Button size="lg" className="w-full" onClick={handleFinish}>
            🚛 Go to My Dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Progress Header */}
      <div className="sticky top-0 z-50 bg-card border-b p-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-foreground">🚛 Getting You Set Up!</p>
            <button onClick={finishAndGoToDashboard} className="text-xs text-muted-foreground hover:text-foreground">
              Skip Setup — Go to Dashboard
            </button>
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            Step {currentStep} of {TOTAL_STEPS}
            {currentStep <= 2 && ' — Let\'s get started!'}
            {currentStep === 3 && ' — Almost halfway there! 💪'}
            {currentStep === 4 && ' — You\'re doing great!'}
            {currentStep >= 5 && ' — Almost done! 🎉'}
          </p>
          <Progress value={progressPercent} className="h-2" />
          <div className="flex justify-between mt-2">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div key={i} className={`h-2 w-2 rounded-full ${i < currentStep ? 'bg-primary' : 'bg-muted'}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-lg mx-auto p-4 pb-20">
        <AnimatePresence mode="wait">
          <div key={currentStep}>
            {renderStep()}
          </div>
        </AnimatePresence>

        <div className="mt-6 space-y-3 text-center">
          <Button variant="ghost" size="sm" onClick={currentStep === TOTAL_STEPS ? finishAndGoToDashboard : handleSkip}>
            <HelpCircle className="mr-2 h-4 w-4" />
            Having trouble? Skip this step
          </Button>

          {stepTimeoutVisible ? (
            <Button variant="outline" size="sm" onClick={finishAndGoToDashboard}>
              Taking longer than expected? Skip to Dashboard
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
