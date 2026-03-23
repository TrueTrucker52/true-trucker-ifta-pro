import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, Upload, Save, X, AlertTriangle, ScanLine, RotateCcw, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Tesseract from 'tesseract.js';

interface BOLData {
  bolNumber: string;
  pickupDate: string;
  deliveryDate: string;
  shipperName: string;
  shipperAddress: string;
  shipperCity: string;
  shipperState: string;
  shipperZip: string;
  consigneeName: string;
  consigneeAddress: string;
  consigneeCity: string;
  consigneeState: string;
  consigneeZip: string;
  commodityDescription: string;
  weight: string;
  pieces: string;
  freightCharges: string;
  status: string;
  notes: string;
}

const isMobileDevice = () => {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    ('ontouchstart' in window && window.innerWidth < 1024) ||
    (navigator.maxTouchPoints > 0 && window.innerWidth < 1024);
};

export const BOLScanner = () => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [bolData, setBolData] = useState<BOLData>({
    bolNumber: '',
    pickupDate: '',
    deliveryDate: '',
    shipperName: '',
    shipperAddress: '',
    shipperCity: '',
    shipperState: '',
    shipperZip: '',
    consigneeName: '',
    consigneeAddress: '',
    consigneeCity: '',
    consigneeState: '',
    consigneeZip: '',
    commodityDescription: '',
    weight: '',
    pieces: '',
    freightCharges: '',
    status: 'in_transit',
    notes: ''
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mobileCameraRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (isCameraActive) {
        stopCamera();
      }
    };
  }, [isCameraActive]);

  const startCamera = async () => {
    // On mobile, use the native file input with capture attribute instead
    if (isMobileDevice()) {
      mobileCameraRef.current?.click();
      return;
    }

    // Desktop: use getUserMedia for live viewfinder
    try {
      setPermissionDenied(false);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setPermissionDenied(true);
      } else {
        toast({
          title: "Camera Error",
          description: "Unable to access camera. Please try uploading an image instead.",
          variant: "destructive"
        });
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedImage(imageDataUrl);
        stopCamera();
        processImage(imageDataUrl);
      }
    }
  };

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image under 10MB.",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageDataUrl = e.target?.result as string;
      setCapturedImage(imageDataUrl);
      processImage(imageDataUrl);
    };
    reader.readAsDataURL(file);

    // Reset input so the same file can be selected again
    event.target.value = '';
  }, []);

  const processImage = async (imageDataUrl: string) => {
    setIsProcessing(true);
    setOcrProgress(0);

    try {
      const result = await Tesseract.recognize(imageDataUrl, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setOcrProgress(Math.round(m.progress * 100));
          }
        }
      });

      const ocrText = result.data.text;
      extractBOLData(ocrText);
    } catch (error) {
      console.error('OCR Error:', error);
      toast({
        title: "OCR Failed",
        description: "Failed to extract text from image. You can still fill out the form manually.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setOcrProgress(0);
    }
  };

  const extractBOLData = (ocrText: string) => {
    const bolNumberMatch = ocrText.match(/(?:BOL|B\/L|BILL\s*OF\s*LADING)[\s#:]*([A-Z0-9-]+)/i);
    const dateMatch = ocrText.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
    const weightMatch = ocrText.match(/(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:LBS?|POUNDS?)/i);
    const piecesMatch = ocrText.match(/(\d+)\s*(?:PIECES?|PCS?|UNITS?)/i);

    setBolData(prev => ({
      ...prev,
      bolNumber: bolNumberMatch?.[1] || prev.bolNumber,
      pickupDate: dateMatch?.[1] ? formatDate(dateMatch[1]) : prev.pickupDate,
      weight: weightMatch?.[1]?.replace(/,/g, '') || prev.weight,
      pieces: piecesMatch?.[1] || prev.pieces,
    }));

    toast({
      title: "OCR Complete",
      description: "Text extracted from image. Please review and complete the form.",
    });
  };

  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const saveBOL = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save BOL data.",
        variant: "destructive"
      });
      return;
    }

    if (!bolData.bolNumber || !bolData.pickupDate || !bolData.shipperName || !bolData.consigneeName) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in BOL number, pickup date, shipper name, and consignee name.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);

    try {
      let imageUrl = null;

      if (capturedImage) {
        const response = await fetch(capturedImage);
        const blob = await response.blob();
        const fileName = `${user.id}/bol_${crypto.randomUUID()}.jpg`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(fileName, blob);

        if (uploadError) throw uploadError;
        imageUrl = `receipts/${uploadData.path}`;
      }

      const { error } = await supabase.from('bills_of_lading').insert({
        user_id: user.id,
        bol_number: bolData.bolNumber,
        pickup_date: bolData.pickupDate,
        delivery_date: bolData.deliveryDate || null,
        shipper_name: bolData.shipperName,
        shipper_address: bolData.shipperAddress,
        shipper_city: bolData.shipperCity,
        shipper_state: bolData.shipperState,
        shipper_zip: bolData.shipperZip,
        consignee_name: bolData.consigneeName,
        consignee_address: bolData.consigneeAddress,
        consignee_city: bolData.consigneeCity,
        consignee_state: bolData.consigneeState,
        consignee_zip: bolData.consigneeZip,
        commodity_description: bolData.commodityDescription,
        weight: bolData.weight ? parseFloat(bolData.weight) : null,
        pieces: bolData.pieces ? parseInt(bolData.pieces) : null,
        freight_charges: bolData.freightCharges ? parseFloat(bolData.freightCharges) : null,
        bol_image_url: imageUrl,
        status: bolData.status,
        notes: bolData.notes
      });

      if (error) throw error;

      toast({
        title: "BOL Saved",
        description: "Bill of Lading has been saved successfully.",
      });

      resetForm();
    } catch (error: any) {
      console.error('Error saving BOL:', error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save BOL. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setBolData({
      bolNumber: '',
      pickupDate: '',
      deliveryDate: '',
      shipperName: '',
      shipperAddress: '',
      shipperCity: '',
      shipperState: '',
      shipperZip: '',
      consigneeName: '',
      consigneeAddress: '',
      consigneeCity: '',
      consigneeState: '',
      consigneeZip: '',
      commodityDescription: '',
      weight: '',
      pieces: '',
      freightCharges: '',
      status: 'in_transit',
      notes: ''
    });
    setCapturedImage(null);
    setIsProcessing(false);
    setOcrProgress(0);
    setPermissionDenied(false);
  };

  return (
    <div className="space-y-6">
      {/* Camera/Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScanLine className="h-5 w-5" />
            Scan Bill of Lading
          </CardTitle>
          <CardDescription>
            Point your camera at the Bill of Lading and hold steady for best results.
            The document should be well-lit and flat.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Permission Denied Banner */}
          {permissionDenied && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-destructive">Camera Permission Denied</p>
                  <p className="text-sm text-muted-foreground">
                    To use the camera scanner, please enable camera access:
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                    <li><strong>iPhone/iPad:</strong> Go to Settings → Safari → Camera → Allow</li>
                    <li><strong>Android:</strong> Tap the lock icon in the address bar → Permissions → Camera → Allow</li>
                    <li><strong>Desktop:</strong> Click the camera icon in the address bar and allow access</li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-2">
                    After enabling, tap "Try Again" or use "Upload Image" instead.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setPermissionDenied(false); startCamera(); }}
                className="mt-2"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          )}

          {!capturedImage ? (
            <>
              {!isCameraActive ? (
                <div className="space-y-4">
                  {/* Scan instructions */}
                  <div className="rounded-lg border border-border bg-muted/50 p-4">
                    <div className="flex items-start gap-3">
                      <Camera className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p className="font-medium text-foreground">Scanning Tips</p>
                        <ul className="list-disc list-inside space-y-0.5">
                          <li>Place the BOL on a flat, well-lit surface</li>
                          <li>Make sure all text is visible and in focus</li>
                          <li>Avoid shadows and glare on the document</li>
                          <li>Hold your device steady while capturing</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button onClick={startCamera} className="flex-1" size="lg">
                      <Camera className="h-5 w-5 mr-2" />
                      {isMobileDevice() ? 'Open Camera' : 'Take Photo'}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      size="lg"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-5 w-5 mr-2" />
                      Upload Image
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Desktop live viewfinder */}
                  <div className="relative">
                    <video
                      ref={videoRef}
                      className="w-full rounded-lg border"
                      style={{ maxHeight: '400px' }}
                      playsInline
                      autoPlay
                      muted
                    />
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="border-2 border-dashed border-primary/40 rounded-lg w-[90%] h-[85%]" />
                    </div>
                    <p className="absolute bottom-2 left-0 right-0 text-center text-sm text-white bg-black/50 py-1 rounded-b-lg">
                      Align the BOL within the frame and tap Capture
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <Button onClick={capturePhoto} className="flex-1" size="lg">
                      <Camera className="h-5 w-5 mr-2" />
                      Capture
                    </Button>
                    <Button variant="outline" onClick={stopCamera}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={capturedImage}
                  alt="Captured BOL"
                  className="w-full rounded-lg border max-h-80 object-contain bg-muted"
                />
                {!isProcessing && (
                  <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full p-1">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                )}
              </div>
              <div className="flex gap-4">
                <Button variant="outline" onClick={resetForm} className="flex-1">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retake Photo
                </Button>
              </div>
            </div>
          )}

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          {/* Mobile camera input — uses native capture attribute to launch camera directly */}
          <input
            ref={mobileCameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileUpload}
            className="hidden"
          />

          {isProcessing && (
            <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <ScanLine className="h-4 w-4 animate-pulse text-primary" />
                Extracting text from document… {ocrProgress}%
              </div>
              <div className="w-full bg-secondary rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${ocrProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Hold on — we're reading the BOL data from your image.
              </p>
            </div>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </CardContent>
      </Card>

      {/* BOL Form */}
      <Card>
        <CardHeader>
          <CardTitle>Bill of Lading Details</CardTitle>
          <CardDescription>
            {capturedImage
              ? 'Review the extracted data below and correct any errors before saving.'
              : 'Complete the BOL information below'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="bolNumber">BOL Number *</Label>
              <Input
                id="bolNumber"
                value={bolData.bolNumber}
                onChange={(e) => setBolData(prev => ({ ...prev, bolNumber: e.target.value }))}
                placeholder="Enter BOL number"
              />
            </div>
            <div>
              <Label htmlFor="pickupDate">Pickup Date *</Label>
              <Input
                id="pickupDate"
                type="date"
                value={bolData.pickupDate}
                onChange={(e) => setBolData(prev => ({ ...prev, pickupDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="deliveryDate">Delivery Date</Label>
              <Input
                id="deliveryDate"
                type="date"
                value={bolData.deliveryDate}
                onChange={(e) => setBolData(prev => ({ ...prev, deliveryDate: e.target.value }))}
              />
            </div>
          </div>

          {/* Shipper Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Shipper Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="shipperName">Shipper Name *</Label>
                <Input
                  id="shipperName"
                  value={bolData.shipperName}
                  onChange={(e) => setBolData(prev => ({ ...prev, shipperName: e.target.value }))}
                  placeholder="Company name"
                />
              </div>
              <div>
                <Label htmlFor="shipperAddress">Address</Label>
                <Input
                  id="shipperAddress"
                  value={bolData.shipperAddress}
                  onChange={(e) => setBolData(prev => ({ ...prev, shipperAddress: e.target.value }))}
                  placeholder="Street address"
                />
              </div>
              <div>
                <Label htmlFor="shipperCity">City</Label>
                <Input
                  id="shipperCity"
                  value={bolData.shipperCity}
                  onChange={(e) => setBolData(prev => ({ ...prev, shipperCity: e.target.value }))}
                  placeholder="City"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="shipperState">State</Label>
                  <Input
                    id="shipperState"
                    value={bolData.shipperState}
                    onChange={(e) => setBolData(prev => ({ ...prev, shipperState: e.target.value }))}
                    placeholder="State"
                    maxLength={2}
                  />
                </div>
                <div>
                  <Label htmlFor="shipperZip">ZIP</Label>
                  <Input
                    id="shipperZip"
                    value={bolData.shipperZip}
                    onChange={(e) => setBolData(prev => ({ ...prev, shipperZip: e.target.value }))}
                    placeholder="ZIP code"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Consignee Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Consignee Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="consigneeName">Consignee Name *</Label>
                <Input
                  id="consigneeName"
                  value={bolData.consigneeName}
                  onChange={(e) => setBolData(prev => ({ ...prev, consigneeName: e.target.value }))}
                  placeholder="Company name"
                />
              </div>
              <div>
                <Label htmlFor="consigneeAddress">Address</Label>
                <Input
                  id="consigneeAddress"
                  value={bolData.consigneeAddress}
                  onChange={(e) => setBolData(prev => ({ ...prev, consigneeAddress: e.target.value }))}
                  placeholder="Street address"
                />
              </div>
              <div>
                <Label htmlFor="consigneeCity">City</Label>
                <Input
                  id="consigneeCity"
                  value={bolData.consigneeCity}
                  onChange={(e) => setBolData(prev => ({ ...prev, consigneeCity: e.target.value }))}
                  placeholder="City"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="consigneeState">State</Label>
                  <Input
                    id="consigneeState"
                    value={bolData.consigneeState}
                    onChange={(e) => setBolData(prev => ({ ...prev, consigneeState: e.target.value }))}
                    placeholder="State"
                    maxLength={2}
                  />
                </div>
                <div>
                  <Label htmlFor="consigneeZip">ZIP</Label>
                  <Input
                    id="consigneeZip"
                    value={bolData.consigneeZip}
                    onChange={(e) => setBolData(prev => ({ ...prev, consigneeZip: e.target.value }))}
                    placeholder="ZIP code"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Load Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Load Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="weight">Weight (lbs)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={bolData.weight}
                  onChange={(e) => setBolData(prev => ({ ...prev, weight: e.target.value }))}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="pieces">Pieces</Label>
                <Input
                  id="pieces"
                  type="number"
                  value={bolData.pieces}
                  onChange={(e) => setBolData(prev => ({ ...prev, pieces: e.target.value }))}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="freightCharges">Freight Charges</Label>
                <Input
                  id="freightCharges"
                  type="number"
                  step="0.01"
                  value={bolData.freightCharges}
                  onChange={(e) => setBolData(prev => ({ ...prev, freightCharges: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="commodityDescription">Commodity Description</Label>
              <Textarea
                id="commodityDescription"
                value={bolData.commodityDescription}
                onChange={(e) => setBolData(prev => ({ ...prev, commodityDescription: e.target.value }))}
                placeholder="Describe the cargo being transported"
                rows={3}
              />
            </div>
          </div>

          {/* Status and Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={bolData.status} onValueChange={(value) => setBolData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="picked_up">Picked Up</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={bolData.notes}
                onChange={(e) => setBolData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes"
                rows={3}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              onClick={saveBOL}
              disabled={isSaving || !bolData.bolNumber || !bolData.pickupDate}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save BOL'}
            </Button>
            <Button variant="outline" onClick={resetForm}>
              Clear Form
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};