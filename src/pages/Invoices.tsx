import InvoiceManager from '@/components/InvoiceManager';

import { ComingSoon } from "@/components/ComingSoon";
import { Receipt } from "lucide-react";

const Invoices = () => {
  return <ComingSoon 
    title="Invoice Manager Coming Soon" 
    description="Professional invoice creation and management for trucking businesses"
    icon={Receipt}
  />;
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <InvoiceManager />
        </div>
      </div>
    </div>
  );
};

export default Invoices;