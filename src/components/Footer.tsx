import { Truck, Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-secondary p-2 rounded-lg">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">TrueTrucker</h3>
                <p className="text-sm opacity-80">IFTA Pro</p>
              </div>
            </div>
            <p className="text-primary-foreground/80">
              Built by truckers, for truckers. Simplifying IFTA compliance one mile at a time.
            </p>
            {/* Data Safety Summary */}
            <div className="text-xs text-primary-foreground/60 border-t border-primary-foreground/20 pt-3 mt-3">
              <p className="font-medium text-primary-foreground/80 mb-1">Data Safety</p>
              <p>📍 GPS used for mileage tracking</p>
              <p>📷 Camera used for receipt scanning</p>
              <p>🔒 Data encrypted & never sold</p>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Product</h4>
            <ul className="space-y-2 text-primary-foreground/80">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="https://apps.apple.com/search?term=trucking%20apps" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Mobile App</a></li>
              <li><a href="/dashboard" className="hover:text-white transition-colors">Desktop App</a></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Support</h4>
            <ul className="space-y-2 text-primary-foreground/80">
              <li><a href="https://docs.google.com/document/d/help-center" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="https://www.fmcsa.dot.gov/registration/international-fuel-tax-agreement-ifta" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">IFTA Guide</a></li>
              <li><a href="https://www.reddit.com/r/Truckers/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Community</a></li>
              <li><a href="mailto:support@true-trucker-ifta-pro.com" className="hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Get in Touch</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4" />
                <a href="mailto:support@true-trucker-ifta-pro.com" className="text-primary-foreground/80 hover:text-white transition-colors">support@true-trucker-ifta-pro.com</a>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4" />
                <span className="text-primary-foreground/80">Available 24/7</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-primary-foreground/60 text-sm">
            © 2024 TrueTrucker IFTA Pro. All rights reserved.
          </p>
          <div className="flex space-x-6 text-white/90 text-sm mt-4 md:mt-0 font-medium">
            <a href="/privacy-policy" className="hover:text-white hover:underline transition-all duration-200 border-b border-transparent hover:border-white">Privacy Policy</a>
            <a href="/terms-of-service" className="hover:text-white hover:underline transition-all duration-200 border-b border-transparent hover:border-white">Terms of Service</a>
            <a href="/refund-policy" className="hover:text-white hover:underline transition-all duration-200 border-b border-transparent hover:border-white">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;