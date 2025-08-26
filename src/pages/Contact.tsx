import ContactForm from '@/components/ContactForm';

const Contact = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Contact Support</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Need help with IFTA compliance or have questions about our platform? 
            Our trucking experts are here to assist you.
          </p>
        </div>
        
        <ContactForm />
      </div>
    </div>
  );
};

export default Contact;