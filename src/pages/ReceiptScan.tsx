import { ReceiptScanner } from '@/components/ReceiptScanner';

import { ComingSoon } from "@/components/ComingSoon";
import { Camera } from "lucide-react";

const ReceiptScan = () => {
  return <ComingSoon 
    title="Receipt Scanner Coming Soon" 
    description="AI-powered receipt scanning with OCR technology for automatic fuel data extraction"
    icon={Camera}
  />;
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Fuel Receipt Scanner
            </h1>
            <p className="text-muted-foreground">
              Scan or upload your fuel receipts to automatically extract transaction details for IFTA reporting
            </p>
          </div>
          
          <ReceiptScanner />
        </div>
      </div>
    </div>
  );
};

export default ReceiptScan;