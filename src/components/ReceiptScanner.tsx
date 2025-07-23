import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Camera, Upload, FileText, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Tesseract from 'tesseract.js';
import { receiptSchema, sanitizeInput, sanitizeOcrText } from '@/lib/validation';
import { validateFileUpload } from '@/lib/securityMonitoring';

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
}

export const ReceiptScanner = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const [receiptData, setReceiptData] = useState<ReceiptData>({
    date: '',
    time: '',
    location: '',
    vendor: '',
    gallons: '',
    pricePerGallon: '',
    totalAmount: '',
    fuelTax: '',
    stateCode: ''
  });

  const startCamera = async () => {
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
    
    // Use AI to enhance the extraction
    try {
      const { data, error } = await supabase.functions.invoke('enhance-receipt-data', {
        body: {
          ocrText: text,
          extractedData: basicExtractedData
        }
      });
      
      if (error) throw error;
      
      if (data?.enhancedData) {
        setReceiptData(prev => ({ ...prev, ...data.enhancedData }));
      } else {
        setReceiptData(prev => ({ ...prev, ...basicExtractedData }));
      }
    } catch (error) {
      console.error('AI enhancement failed, using basic extraction:', error);
      setReceiptData(prev => ({ ...prev, ...basicExtractedData }));
    }
  };

  const saveReceipt = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save receipts.",
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

    setIsSaving(true);
    
    try {
      let imageUrl = '';
      
      // Upload image to storage if captured
      if (capturedImage) {
        const response = await fetch(capturedImage);
        const blob = await response.blob();
        const fileName = `${user.id}/${Date.now()}.jpg`;
        
        const { data, error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(fileName, blob);
          
        if (uploadError) throw uploadError;
        imageUrl = fileName;
      }
      
      // Save receipt data to database with sanitized inputs
      const { error } = await supabase
        .from('receipts')
        .insert({
          user_id: user.id,
          receipt_date: receiptData.date || new Date().toISOString().split('T')[0],
          receipt_time: receiptData.time || null,
          location: receiptData.location ? sanitizeInput(receiptData.location) : null,
          vendor: receiptData.vendor ? sanitizeInput(receiptData.vendor) : null,
          gallons: receiptData.gallons ? parseFloat(receiptData.gallons) : null,
          price_per_gallon: receiptData.pricePerGallon ? parseFloat(receiptData.pricePerGallon) : null,
          total_amount: receiptData.totalAmount ? parseFloat(receiptData.totalAmount) : null,
          fuel_tax: receiptData.fuelTax ? parseFloat(receiptData.fuelTax) : null,
          state_code: receiptData.stateCode ? receiptData.stateCode.toUpperCase().substring(0, 2) : null,
          receipt_image_url: imageUrl,
          raw_ocr_text: sanitizeOcrText(ocrText)
        });
      
      if (error) throw error;
      
      toast({
        title: "Receipt Saved",
        description: "Your fuel receipt has been saved successfully.",
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
        stateCode: ''
      });
      setCapturedImage(null);
      setOcrText('');
      
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Could not save receipt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
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
                    stateCode: ''
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
              Review and edit the extracted information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={receiptData.date}
                  onChange={(e) => setReceiptData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={receiptData.time}
                  onChange={(e) => setReceiptData(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="vendor">Vendor/Station</Label>
                <Input
                  id="vendor"
                  value={receiptData.vendor}
                  onChange={(e) => setReceiptData(prev => ({ ...prev, vendor: e.target.value }))}
                  placeholder="e.g., Shell, BP, Exxon"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={receiptData.location}
                  onChange={(e) => setReceiptData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="City, State"
                />
              </div>
              <div>
                <Label htmlFor="gallons">Gallons</Label>
                <Input
                  id="gallons"
                  type="number"
                  step="0.001"
                  value={receiptData.gallons}
                  onChange={(e) => setReceiptData(prev => ({ ...prev, gallons: e.target.value }))}
                  placeholder="0.000"
                />
              </div>
              <div>
                <Label htmlFor="pricePerGallon">Price per Gallon</Label>
                <Input
                  id="pricePerGallon"
                  type="number"
                  step="0.001"
                  value={receiptData.pricePerGallon}
                  onChange={(e) => setReceiptData(prev => ({ ...prev, pricePerGallon: e.target.value }))}
                  placeholder="0.000"
                />
              </div>
              <div>
                <Label htmlFor="totalAmount">Total Amount</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  step="0.01"
                  value={receiptData.totalAmount}
                  onChange={(e) => setReceiptData(prev => ({ ...prev, totalAmount: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="fuelTax">Fuel Tax</Label>
                <Input
                  id="fuelTax"
                  type="number"
                  step="0.01"
                  value={receiptData.fuelTax}
                  onChange={(e) => setReceiptData(prev => ({ ...prev, fuelTax: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="stateCode">State Code</Label>
                <Input
                  id="stateCode"
                  maxLength={2}
                  value={receiptData.stateCode}
                  onChange={(e) => setReceiptData(prev => ({ ...prev, stateCode: e.target.value.toUpperCase() }))}
                  placeholder="CA, TX, NY..."
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
            
            <Button 
              onClick={saveReceipt} 
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Receipt
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};