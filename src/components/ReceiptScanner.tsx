import { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Camera, Upload, FileText, Save, Loader2, CloudOff, Zap, ThumbsUp, ThumbsDown, ListOrdered, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import Tesseract from 'tesseract.js';
import { receiptSchema, sanitizeInput, sanitizeOcrText } from '@/lib/validation';
import { validateFileUpload } from '@/lib/securityMonitoring';
import { TripAssignSelect, UNASSIGNED, useTrips, tripLabel } from '@/components/receipts/TripAssignSelect';
import { findBestTripMatch, rankTripMatches, confidenceLabel, type TripMatch } from '@/lib/tripMatch';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin, Fuel, Check, Minus, X, Wand2 } from 'lucide-react';
import { useMatchFeedback } from '@/hooks/useMatchFeedback';
import { useAutoAcceptMatch } from '@/hooks/useAutoAcceptMatch';
import { AutoAcceptSettings } from '@/components/receipts/AutoAcceptSettings';
import { logAssignment } from '@/hooks/useAssignmentHistory';


interface ReceiptData {
  date: string;
  time: string;
  location: string;
  vendor: string;
  gallons: string;
  pricePerGallon: string;
  totalAmount: string;
  fuelTax: string;
  stateCode: string;
  fuelType: string;
}

interface ConfidenceScores {
  date: number;
  time: number;
  location: number;
  vendor: number;
  gallons: number;
  pricePerGallon: number;
  totalAmount: number;
  fuelTax: number;
  stateCode: number;
  fuelType: number;
}

const LOW_CONFIDENCE_THRESHOLD = 0.7;

export const ReceiptScanner = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { saveWithOfflineSupport, isOnline } = useOfflineSync();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mobileCameraRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string>(UNASSIGNED);
  const [addToTripFuel, setAddToTripFuel] = useState(true);
  const [tripSuggestion, setTripSuggestion] = useState<TripMatch | null>(null);
  const [suggestionDismissed, setSuggestionDismissed] = useState(false);
  const [feedbackByTrip, setFeedbackByTrip] = useState<Record<string, boolean>>({});
  const [autoAccepted, setAutoAccepted] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [editingMatchFields, setEditingMatchFields] = useState(false);
  /** Manual corrections to the fields used for matching (OCR can misread them) */
  const [matchOverrides, setMatchOverrides] = useState<{ date?: string; stateCode?: string; gallons?: string }>({});
  const { weights, submitFeedback } = useMatchFeedback();
  const { settings: autoAccept } = useAutoAcceptMatch();
  const { trips } = useTrips();

  
  const [receiptData, setReceiptData] = useState<ReceiptData>({
    date: '',
    time: '',
    location: '',
    vendor: '',
    gallons: '',
    pricePerGallon: '',
    totalAmount: '',
    fuelTax: '',
    stateCode: '',
    fuelType: ''
  });
  
  const [confidenceScores, setConfidenceScores] = useState<ConfidenceScores>({
    date: 1,
    time: 1,
    location: 1,
    vendor: 1,
    gallons: 1,
    pricePerGallon: 1,
    totalAmount: 1,
    fuelTax: 1,
    stateCode: 1,
    fuelType: 1
  });

  /** Fields the matcher uses — manual overrides win over the OCR values */
  const matchInput = useMemo(
    () => ({
      date: matchOverrides.date ?? receiptData.date,
      stateCode: matchOverrides.stateCode ?? receiptData.stateCode,
      gallons: matchOverrides.gallons ?? receiptData.gallons,
    }),
    [matchOverrides, receiptData.date, receiptData.stateCode, receiptData.gallons]
  );

  const matchFieldsEdited =
    matchOverrides.date !== undefined ||
    matchOverrides.stateCode !== undefined ||
    matchOverrides.gallons !== undefined;

  // Auto-match: suggest (and preselect) the most likely trip from date/state/gallons
  useEffect(() => {
    if (!trips.length || !matchInput.date) {
      setTripSuggestion(null);
      setAutoAccepted(false);
      return;
    }
    const match = findBestTripMatch(matchInput, trips, weights);
    setTripSuggestion(match);
    if (match && !suggestionDismissed && selectedTripId === UNASSIGNED) {
      setSelectedTripId(match.trip.id);
    }
    const accepted =
      !!match && !suggestionDismissed && autoAccept.enabled && match.score >= autoAccept.threshold;
    setAutoAccepted(accepted);
  }, [
    trips,
    weights,
    matchInput,
    suggestionDismissed,
    selectedTripId,
    autoAccept.enabled,
    autoAccept.threshold,
  ]);

  /** Runner-up trips, offered when the top suggestion isn't the right one */
  const alternatives = useMemo(() => {
    if (!trips.length || !matchInput.date) return [];
    return rankTripMatches(matchInput, trips, weights, 4).filter(
      (m) => m.trip.id !== tripSuggestion?.trip.id
    );
  }, [trips, matchInput, weights, tripSuggestion?.trip.id]);




  const isLowConfidence = (field: keyof ConfidenceScores): boolean => {
    return confidenceScores[field] < LOW_CONFIDENCE_THRESHOLD;
  };

  const getLowConfidenceStyle = (field: keyof ConfidenceScores): string => {
    return isLowConfidence(field) 
      ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-600 ring-2 ring-yellow-300 dark:ring-yellow-700' 
      : '';
  };

  const isMobileDevice = () => {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      ('ontouchstart' in window && window.innerWidth < 1024) ||
      (navigator.maxTouchPoints > 0 && window.innerWidth < 1024);
  };

  const startCamera = async () => {
    // On mobile, use native file input with capture attribute for photo mode
    if (isMobileDevice()) {
      mobileCameraRef.current?.click();
      return;
    }

    // Desktop: use getUserMedia for live viewfinder
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please use file upload instead.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageData);
        stopCamera();
        processImage(imageData);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file before processing
      const validation = validateFileUpload(file);
      if (!validation.valid) {
        toast({
          title: "File Validation Failed",
          description: validation.error,
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setCapturedImage(imageData);
        processImage(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (imageData: string) => {
    setIsScanning(true);
    setScanProgress(0);
    
    try {
      const { data: { text } } = await Tesseract.recognize(
        imageData,
        'eng',
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              setScanProgress(Math.round(m.progress * 100));
            }
          }
        }
      );
      
      const sanitizedText = sanitizeOcrText(text);
      setOcrText(sanitizedText);
      await extractReceiptData(sanitizedText);
      
      toast({
        title: "Receipt Scanned",
        description: "Text extracted successfully. Please review and edit the details.",
      });
    } catch (error) {
      toast({
        title: "Scanning Failed",
        description: "Could not process the receipt image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
      setScanProgress(0);
    }
  };

  /**
   * Strips potential PII from OCR text before sending to AI.
   * Ensures user privacy by removing emails, phone numbers, card numbers, etc.
   */
  const stripPotentialPII = (text: string): string => {
    let cleaned = text;
    
    // Remove potential email addresses
    cleaned = cleaned.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '');
    
    // Remove potential phone numbers
    cleaned = cleaned.replace(/(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, '');
    
    // Remove potential credit card numbers
    cleaned = cleaned.replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '');
    
    // Remove loyalty member names (common patterns)
    cleaned = cleaned.replace(/(?:member|customer|name|cardholder)[:\s]+[A-Z][a-z]+\s+[A-Z][a-z]+/gi, '');
    
    return cleaned;
  };

  const extractReceiptData = async (text: string) => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    
    // Basic pattern matching for initial extraction
    const datePattern = /(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}-\d{1,2}-\d{2,4})/;
    const timePattern = /(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)/i;
    const gallonPattern = /(\d+\.?\d*)\s*(?:gal|gallon|gallons)/i;
    const pricePattern = /\$?(\d+\.\d{2,3})\/gal/i;
    const totalPattern = /(?:total|amount).*?\$?(\d+\.\d{2})/i;
    
    let basicExtractedData: Partial<ReceiptData> = {};
    
    lines.forEach(line => {
      const dateMatch = line.match(datePattern);
      if (dateMatch && !basicExtractedData.date) {
        basicExtractedData.date = dateMatch[1];
      }
      
      const timeMatch = line.match(timePattern);
      if (timeMatch && !basicExtractedData.time) {
        basicExtractedData.time = timeMatch[1];
      }
      
      const gallonMatch = line.match(gallonPattern);
      if (gallonMatch && !basicExtractedData.gallons) {
        basicExtractedData.gallons = gallonMatch[1];
      }
      
      const priceMatch = line.match(pricePattern);
      if (priceMatch && !basicExtractedData.pricePerGallon) {
        basicExtractedData.pricePerGallon = priceMatch[1];
      }
      
      const totalMatch = line.match(totalPattern);
      if (totalMatch && !basicExtractedData.totalAmount) {
        basicExtractedData.totalAmount = totalMatch[1];
      }
    });
    
    // PRIVACY: Strip any potential PII before sending to AI
    // Only receipt-specific data (dates, amounts, vendor, location) is sent
    const piiStrippedText = stripPotentialPII(text);
    
    // Use AI to enhance the extraction - only sending receipt data, no user info
    try {
      const { data, error } = await supabase.functions.invoke('enhance-receipt-data', {
        body: {
          // Only send sanitized OCR text with PII removed
          ocrText: piiStrippedText,
          // Only send receipt-specific extracted fields
          extractedData: {
            date: basicExtractedData.date,
            time: basicExtractedData.time,
            gallons: basicExtractedData.gallons,
            pricePerGallon: basicExtractedData.pricePerGallon,
            totalAmount: basicExtractedData.totalAmount,
            // Note: No user ID, email, or name is included
          }
        }
      });
      
      if (error) throw error;
      
      if (data?.enhancedData) {
        const { confidence, ...extractedFields } = data.enhancedData;
        setReceiptData(prev => ({ ...prev, ...extractedFields }));
        
        // Set confidence scores if available
        if (confidence) {
          setConfidenceScores(prev => ({ ...prev, ...confidence }));
        }
      } else {
        setReceiptData(prev => ({ ...prev, ...basicExtractedData }));
      }
    } catch (error) {
      console.error('AI enhancement failed, using basic extraction:', error);
      setReceiptData(prev => ({ ...prev, ...basicExtractedData }));
    }
  };

  const saveReceipt = async (options?: { quick?: boolean }) => {
    const quick = options?.quick === true;

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save receipts.",
        variant: "destructive",
      });
      return;
    }

    if (quick && selectedTripId === UNASSIGNED) {
      toast({
        title: "Pick a trip first",
        description: "Choose the trip this receipt belongs to, then quick save.",
        variant: "destructive",
      });
      return;
    }

    // Validate receipt data
    const validationResult = receiptSchema.safeParse({
      receiptDate: receiptData.date || new Date().toISOString().split('T')[0],
      vendor: receiptData.vendor,
      location: receiptData.location,
      totalAmount: receiptData.totalAmount ? parseFloat(receiptData.totalAmount) : undefined,
      gallons: receiptData.gallons ? parseFloat(receiptData.gallons) : undefined,
      pricePerGallon: receiptData.pricePerGallon ? parseFloat(receiptData.pricePerGallon) : undefined,
      stateCode: receiptData.stateCode,
      rawOcrText: ocrText
    });

    if (!validationResult.success) {
      toast({
        title: "Validation Error",
        description: validationResult.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    if (quick && (!receiptData.gallons || !receiptData.totalAmount)) {
      toast({
        title: "Missing fuel amounts",
        description: "Quick save needs gallons and total amount from the receipt.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    const tripId = selectedTripId === UNASSIGNED ? null : selectedTripId;
    const gallonsValue = receiptData.gallons ? parseFloat(receiptData.gallons) : null;
    const totalValue = receiptData.totalAmount ? parseFloat(receiptData.totalAmount) : null;

    const receiptDbData = {
      user_id: user.id,
      trip_id: tripId,
      receipt_date: receiptData.date || new Date().toISOString().split('T')[0],
      receipt_time: receiptData.time || null,
      location: receiptData.location ? sanitizeInput(receiptData.location) : null,
      vendor: receiptData.vendor ? sanitizeInput(receiptData.vendor) : null,
      gallons: gallonsValue,
      price_per_gallon: receiptData.pricePerGallon ? parseFloat(receiptData.pricePerGallon) : null,
      total_amount: totalValue,
      fuel_tax: receiptData.fuelTax ? parseFloat(receiptData.fuelTax) : null,
      state_code: receiptData.stateCode ? receiptData.stateCode.toUpperCase().substring(0, 2) : null,
      raw_ocr_text: sanitizeOcrText(ocrText),
      // Flag auto-accepted matches so they show up in the review list later
      trip_auto_assigned: !!tripId && autoAccepted && tripSuggestion?.trip.id === tripId,
      trip_match_score:
        tripSuggestion && tripSuggestion.trip.id === tripId ? tripSuggestion.score : null,
    };

    const result = await saveWithOfflineSupport(
      'receipt',
      receiptDbData,
      async () => {
        let imageUrl = '';
        
        // Upload image to storage if captured (only when online)
        if (capturedImage) {
          const response = await fetch(capturedImage);
          const blob = await response.blob();
          const fileName = `${user.id}/${Date.now()}.jpg`;
          
          const { error: uploadError } = await supabase.storage
            .from('receipts')
            .upload(fileName, blob);
            
          if (uploadError) throw uploadError;
          imageUrl = fileName;
        }
        
        // Save receipt data to database with sanitized inputs
        const { data: inserted, error } = await supabase
          .from('receipts')
          .insert({
            ...receiptDbData,
            receipt_image_url: imageUrl,
          })
          .select('id')
          .single();
        
        if (error) throw error;

        // Audit trail so the assignment can be reviewed or undone later
        if (inserted?.id) {
          await logAssignment(user.id, {
            receiptId: inserted.id,
            tripId,
            source: receiptDbData.trip_auto_assigned ? 'auto' : 'manual',
            matchScore: receiptDbData.trip_match_score,
          });
        }


        // Roll the fuel purchase into the trip's fuel line
        if (tripId && addToTripFuel) {
          const trip = trips.find(t => t.id === tripId);
          const { error: tripError } = await supabase
            .from('trips')
            .update({
              fuel_gallons: Number(((trip?.fuel_gallons || 0) + (gallonsValue || 0)).toFixed(3)),
              fuel_cost: Number(((trip?.fuel_cost || 0) + (totalValue || 0)).toFixed(2)),
            })
            .eq('id', tripId);
          if (tripError) throw tripError;
        }

        return { success: true };
      }
    );
    
    setIsSaving(false);

    if (result.success) {
      const trip = trips.find(t => t.id === tripId);
      toast({
        title: result.offline ? "Saved Offline" : trip ? "Receipt Assigned to Trip" : "Receipt Saved",
        description: result.offline 
          ? "Your receipt has been saved locally and will sync when online."
          : trip
            ? `Filed to ${tripLabel(trip)}${addToTripFuel ? ' and added to its fuel line.' : '.'}`
            : "Your fuel receipt has been saved successfully.",
      });
      
      // Reset form
      setReceiptData({
        date: '',
        time: '',
        location: '',
        vendor: '',
        gallons: '',
        pricePerGallon: '',
        totalAmount: '',
        fuelTax: '',
        stateCode: '',
        fuelType: ''
      });
      setConfidenceScores({
        date: 1,
        time: 1,
        location: 1,
        vendor: 1,
        gallons: 1,
        pricePerGallon: 1,
        totalAmount: 1,
        fuelTax: 1,
        stateCode: 1,
        fuelType: 1
      });
      setCapturedImage(null);
      setOcrText('');
      setMatchOverrides({});
      setEditingMatchFields(false);
      setShowAlternatives(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Receipt Scanner
          </CardTitle>
          <CardDescription>
            Scan or upload fuel receipts to automatically extract transaction details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!capturedImage && (
            <div className="flex gap-4">
              <Button onClick={startCamera} disabled={isCameraActive}>
                <Camera className="h-4 w-4 mr-2" />
                Use Camera
              </Button>
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <input
                ref={mobileCameraRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}
          
          {isCameraActive && (
            <div className="space-y-4">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full max-w-md rounded-lg"
              />
              <div className="flex gap-2">
                <Button onClick={capturePhoto}>
                  <Camera className="h-4 w-4 mr-2" />
                  Capture
                </Button>
                <Button variant="outline" onClick={stopCamera}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
          
          {capturedImage && (
            <div className="space-y-4">
              <img 
                src={capturedImage} 
                alt="Captured receipt" 
                className="w-full max-w-md rounded-lg border"
              />
              <Button 
                variant="outline" 
                onClick={() => {
                  setCapturedImage(null);
                  setOcrText('');
                  setReceiptData({
                    date: '',
                    time: '',
                    location: '',
                    vendor: '',
                    gallons: '',
                    pricePerGallon: '',
                    totalAmount: '',
                    fuelTax: '',
                    stateCode: '',
                    fuelType: ''
                  });
                  setConfidenceScores({
                    date: 1,
                    time: 1,
                    location: 1,
                    vendor: 1,
                    gallons: 1,
                    pricePerGallon: 1,
                    totalAmount: 1,
                    fuelTax: 1,
                    stateCode: 1,
                    fuelType: 1
                  });
                }}
              >
                Take New Photo
              </Button>
            </div>
          )}
          
          {isScanning && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing receipt...</span>
              </div>
              <Progress value={scanProgress} className="w-full" />
            </div>
          )}
          
          <canvas ref={canvasRef} className="hidden" />
        </CardContent>
      </Card>

      {ocrText && (
        <Card>
          <CardHeader>
            <CardTitle>Receipt Details</CardTitle>
            <CardDescription>
              Review and edit the extracted information. 
              <span className="text-yellow-600 dark:text-yellow-400 font-medium ml-1">
                Yellow highlighted fields have low AI confidence — please double-check.
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date" className="flex items-center gap-1">
                  Date
                  {isLowConfidence('date') && <span className="text-yellow-600 text-xs">(verify)</span>}
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={receiptData.date}
                  onChange={(e) => setReceiptData(prev => ({ ...prev, date: e.target.value }))}
                  className={getLowConfidenceStyle('date')}
                />
              </div>
              <div>
                <Label htmlFor="time" className="flex items-center gap-1">
                  Time
                  {isLowConfidence('time') && <span className="text-yellow-600 text-xs">(verify)</span>}
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={receiptData.time}
                  onChange={(e) => setReceiptData(prev => ({ ...prev, time: e.target.value }))}
                  className={getLowConfidenceStyle('time')}
                />
              </div>
              <div>
                <Label htmlFor="vendor" className="flex items-center gap-1">
                  Vendor/Station
                  {isLowConfidence('vendor') && <span className="text-yellow-600 text-xs">(verify)</span>}
                </Label>
                <Input
                  id="vendor"
                  value={receiptData.vendor}
                  onChange={(e) => setReceiptData(prev => ({ ...prev, vendor: e.target.value }))}
                  placeholder="e.g., Shell, BP, Exxon"
                  className={getLowConfidenceStyle('vendor')}
                />
              </div>
              <div>
                <Label htmlFor="location" className="flex items-center gap-1">
                  Location
                  {isLowConfidence('location') && <span className="text-yellow-600 text-xs">(verify)</span>}
                </Label>
                <Input
                  id="location"
                  value={receiptData.location}
                  onChange={(e) => setReceiptData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="City, State"
                  className={getLowConfidenceStyle('location')}
                />
              </div>
              <div>
                <Label htmlFor="fuelType" className="flex items-center gap-1">
                  Fuel Type
                  {isLowConfidence('fuelType') && <span className="text-yellow-600 text-xs">(verify)</span>}
                </Label>
                <Input
                  id="fuelType"
                  value={receiptData.fuelType}
                  onChange={(e) => setReceiptData(prev => ({ ...prev, fuelType: e.target.value }))}
                  placeholder="Diesel, Regular, Premium..."
                  className={getLowConfidenceStyle('fuelType')}
                />
              </div>
              <div>
                <Label htmlFor="gallons" className="flex items-center gap-1">
                  Gallons
                  {isLowConfidence('gallons') && <span className="text-yellow-600 text-xs">(verify)</span>}
                </Label>
                <Input
                  id="gallons"
                  type="number"
                  step="0.001"
                  value={receiptData.gallons}
                  onChange={(e) => setReceiptData(prev => ({ ...prev, gallons: e.target.value }))}
                  placeholder="0.000"
                  className={getLowConfidenceStyle('gallons')}
                />
              </div>
              <div>
                <Label htmlFor="pricePerGallon" className="flex items-center gap-1">
                  Price per Gallon
                  {isLowConfidence('pricePerGallon') && <span className="text-yellow-600 text-xs">(verify)</span>}
                </Label>
                <Input
                  id="pricePerGallon"
                  type="number"
                  step="0.001"
                  value={receiptData.pricePerGallon}
                  onChange={(e) => setReceiptData(prev => ({ ...prev, pricePerGallon: e.target.value }))}
                  placeholder="0.000"
                  className={getLowConfidenceStyle('pricePerGallon')}
                />
              </div>
              <div>
                <Label htmlFor="totalAmount" className="flex items-center gap-1">
                  Total Amount
                  {isLowConfidence('totalAmount') && <span className="text-yellow-600 text-xs">(verify)</span>}
                </Label>
                <Input
                  id="totalAmount"
                  type="number"
                  step="0.01"
                  value={receiptData.totalAmount}
                  onChange={(e) => setReceiptData(prev => ({ ...prev, totalAmount: e.target.value }))}
                  placeholder="0.00"
                  className={getLowConfidenceStyle('totalAmount')}
                />
              </div>
              <div>
                <Label htmlFor="fuelTax" className="flex items-center gap-1">
                  Fuel Tax
                  {isLowConfidence('fuelTax') && <span className="text-yellow-600 text-xs">(verify)</span>}
                </Label>
                <Input
                  id="fuelTax"
                  type="number"
                  step="0.01"
                  value={receiptData.fuelTax}
                  onChange={(e) => setReceiptData(prev => ({ ...prev, fuelTax: e.target.value }))}
                  placeholder="0.00"
                  className={getLowConfidenceStyle('fuelTax')}
                />
              </div>
              <div>
                <Label htmlFor="stateCode" className="flex items-center gap-1">
                  State Code
                  {isLowConfidence('stateCode') && <span className="text-yellow-600 text-xs">(verify)</span>}
                </Label>
                <Input
                  id="stateCode"
                  maxLength={2}
                  value={receiptData.stateCode}
                  onChange={(e) => setReceiptData(prev => ({ ...prev, stateCode: e.target.value.toUpperCase() }))}
                  placeholder="CA, TX, NY..."
                  className={getLowConfidenceStyle('stateCode')}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="ocrText">Raw OCR Text</Label>
              <Textarea
                id="ocrText"
                value={ocrText}
                onChange={(e) => setOcrText(e.target.value)}
                rows={6}
                className="font-mono text-sm"
              />
            </div>
            
            {!isOnline && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300 text-sm">
                <CloudOff className="h-4 w-4 flex-shrink-0" />
                <span>You're offline. Receipt will be saved locally and synced when connection is restored.</span>
              </div>
            )}
            <div className="space-y-3 p-3 rounded-lg border border-border bg-muted/30">
              <AutoAcceptSettings />
              {autoAccepted && tripSuggestion && (
                <div className="rounded-md border border-primary/40 bg-primary/10 p-3 text-sm flex items-start gap-2">
                  <Wand2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">
                      Auto-accepted at {tripSuggestion.score}% — above your {autoAccept.threshold}% threshold
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Saved to {tripLabel(tripSuggestion.trip)}. It's flagged under "Review auto-matched" so you
                      can change it later.
                    </p>
                  </div>
                </div>
              )}
              {tripSuggestion && (
                <div className="rounded-md border border-primary/40 bg-primary/5 p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <div className="text-sm flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">Suggested trip</p>
                        <Badge
                          variant={
                            tripSuggestion.confidence === 'high'
                              ? 'default'
                              : tripSuggestion.confidence === 'medium'
                                ? 'secondary'
                                : 'outline'
                          }
                        >
                          {tripSuggestion.score}% · {confidenceLabel(tripSuggestion.confidence)}
                        </Badge>
                        {selectedTripId === tripSuggestion.trip.id && (
                          <span className="text-xs text-muted-foreground">preselected</span>
                        )}
                      </div>
                      <p className="text-muted-foreground">{tripLabel(tripSuggestion.trip)}</p>
                      <Progress value={tripSuggestion.score} className="h-1.5 mt-2" />
                      <ul className="mt-2 space-y-1">
                        {tripSuggestion.signalDetails.map((s) => {
                          const SignalIcon =
                            s.key === 'date' ? CalendarDays : s.key === 'state' ? MapPin : Fuel;
                          const StatusIcon =
                            s.strength === 'strong' ? Check : s.strength === 'partial' ? Minus : X;
                          return (
                            <li key={s.key} className="flex items-center gap-2 text-xs">
                              <SignalIcon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                              <span className="font-medium w-16 flex-shrink-0">{s.label}</span>
                              <StatusIcon
                                className={`h-3.5 w-3.5 flex-shrink-0 ${
                                  s.strength === 'strong'
                                    ? 'text-primary'
                                    : s.strength === 'partial'
                                      ? 'text-muted-foreground'
                                      : 'text-destructive'
                                }`}
                              />
                              <span className="text-muted-foreground truncate">{s.detail}</span>
                              <span className="ml-auto text-muted-foreground tabular-nums flex-shrink-0">
                                +{s.points}/{s.max}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedTripId !== tripSuggestion.trip.id && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSuggestionDismissed(false);
                          setSelectedTripId(tripSuggestion.trip.id);
                        }}
                      >
                        Use suggestion
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSuggestionDismissed(true);
                        if (selectedTripId === tripSuggestion.trip.id) setSelectedTripId(UNASSIGNED);
                      }}
                    >
                      Not this trip
                    </Button>
                    {alternatives.length > 0 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowAlternatives((v) => !v)}
                      >
                        <ListOrdered className="h-4 w-4 mr-2" />
                        {showAlternatives ? 'Hide alternatives' : `Show top alternatives (${alternatives.length})`}
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => setEditingMatchFields((v) => !v)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      {editingMatchFields ? 'Done editing' : 'Edit suggested match fields'}
                    </Button>
                  </div>

                  {editingMatchFields && (
                    <div className="rounded-md border border-border bg-background p-3 space-y-3">
                      <p className="text-xs text-muted-foreground">
                        Correct what the matcher uses. Changes here re-score the suggestion but don't touch the
                        receipt fields above.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="match-date" className="text-xs">Fuel date</Label>
                          <Input
                            id="match-date"
                            type="date"
                            value={matchInput.date}
                            onChange={(e) => setMatchOverrides((p) => ({ ...p, date: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="match-state" className="text-xs">State</Label>
                          <Input
                            id="match-state"
                            value={matchInput.stateCode}
                            maxLength={2}
                            onChange={(e) =>
                              setMatchOverrides((p) => ({ ...p, stateCode: e.target.value.toUpperCase() }))
                            }
                            placeholder="TX"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="match-gallons" className="text-xs">Gallons</Label>
                          <Input
                            id="match-gallons"
                            type="number"
                            step="0.01"
                            value={matchInput.gallons}
                            onChange={(e) => setMatchOverrides((p) => ({ ...p, gallons: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!matchFieldsEdited}
                          onClick={() => setMatchOverrides({})}
                        >
                          Reset to scanned values
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={!matchFieldsEdited}
                          onClick={() => {
                            setReceiptData((prev) => ({
                              ...prev,
                              date: matchInput.date,
                              stateCode: matchInput.stateCode,
                              gallons: matchInput.gallons,
                            }));
                            setMatchOverrides({});
                            toast({ title: 'Receipt fields updated', description: 'Your corrections were copied onto the receipt.' });
                          }}
                        >
                          Apply to receipt fields
                        </Button>
                      </div>
                    </div>
                  )}

                  {showAlternatives && alternatives.length > 0 && (
                    <div className="rounded-md border border-border bg-background p-3 space-y-2">
                      <p className="text-xs font-medium">Other close trips</p>
                      {alternatives.map((alt) => (
                        <div key={alt.trip.id} className="flex flex-wrap items-center gap-2 text-xs">
                          <Badge variant={alt.confidence === 'high' ? 'default' : 'secondary'}>
                            {alt.score}%
                          </Badge>
                          <span className="text-muted-foreground truncate">{tripLabel(alt.trip)}</span>
                          <span className="text-muted-foreground">
                            {alt.signalDetails.map((s) => `${s.label} +${s.points}`).join(' · ')}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="ml-auto h-7"
                            disabled={selectedTripId === alt.trip.id}
                            onClick={() => {
                              setSuggestionDismissed(true);
                              setSelectedTripId(alt.trip.id);
                              toast({ title: 'Trip changed', description: tripLabel(alt.trip) });
                            }}
                          >
                            {selectedTripId === alt.trip.id ? 'Selected' : 'Use this trip'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1 border-t border-primary/20">
                    <span className="text-xs text-muted-foreground">Was this match right?</span>
                    <Button
                      size="sm"
                      variant={feedbackByTrip[tripSuggestion.trip.id] === true ? 'default' : 'ghost'}
                      className="h-7 px-2"
                      aria-label="Good match"
                      disabled={tripSuggestion.trip.id in feedbackByTrip}
                      onClick={async () => {
                        setFeedbackByTrip((p) => ({ ...p, [tripSuggestion.trip.id]: true }));
                        await submitFeedback({
                          helpful: true,
                          suggestedTripId: tripSuggestion.trip.id,
                          chosenTripId: selectedTripId === UNASSIGNED ? null : selectedTripId,
                          matchScore: tripSuggestion.score,
                          signals: tripSuggestion.signals,
                        });
                        toast({ title: 'Thanks — noted', description: 'Future suggestions will lean on these signals more.' });
                      }}
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={feedbackByTrip[tripSuggestion.trip.id] === false ? 'default' : 'ghost'}
                      className="h-7 px-2"
                      aria-label="Bad match"
                      disabled={tripSuggestion.trip.id in feedbackByTrip}
                      onClick={async () => {
                        setFeedbackByTrip((p) => ({ ...p, [tripSuggestion.trip.id]: false }));
                        await submitFeedback({
                          helpful: false,
                          suggestedTripId: tripSuggestion.trip.id,
                          chosenTripId: selectedTripId === UNASSIGNED ? null : selectedTripId,
                          matchScore: tripSuggestion.score,
                          signals: tripSuggestion.signals,
                        });
                        toast({ title: 'Got it', description: 'This kind of match will be suggested less often.' });
                      }}
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </Button>
                    {tripSuggestion.trip.id in feedbackByTrip && (
                      <span className="text-xs text-muted-foreground">Feedback saved</span>
                    )}
                  </div>
                </div>
              )}
              <TripAssignSelect
                trips={trips}
                value={selectedTripId}
                onChange={(v) => {
                  setSuggestionDismissed(true);
                  setSelectedTripId(v);
                }}
              />

              {selectedTripId !== UNASSIGNED && (
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={addToTripFuel}
                    onChange={(e) => setAddToTripFuel(e.target.checked)}
                    className="h-4 w-4 accent-primary"
                  />
                  Add gallons and cost to this trip's fuel line
                </label>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={() => saveReceipt()}
                disabled={isSaving}
                variant={selectedTripId === UNASSIGNED ? 'default' : 'outline'}
                className="w-full"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : !isOnline ? (
                  <>
                    <CloudOff className="h-4 w-4 mr-2" />
                    Save Offline
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Receipt
                  </>
                )}
              </Button>

              {selectedTripId !== UNASSIGNED && (
                <Button
                  onClick={() => saveReceipt({ quick: true })}
                  disabled={isSaving}
                  className="w-full"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Quick Save to Trip
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};