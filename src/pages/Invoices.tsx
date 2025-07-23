import InvoiceManager from '@/components/InvoiceManager';

const Invoices = () => {
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