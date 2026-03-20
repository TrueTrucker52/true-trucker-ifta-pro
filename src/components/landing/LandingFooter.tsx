import { Truck, Mail, Phone } from "lucide-react";

const LandingFooter = () => (
  <footer className="bg-[hsl(var(--landing-navy))] border-t border-[hsl(var(--landing-navy-foreground))]/10 pt-16 pb-8">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1 space-y-4">
          <div className="flex items-center gap-2">
            <div className="bg-secondary p-1.5 rounded-lg">
              <Truck className="h-5 w-5 text-secondary-foreground" />
            </div>
            <span className="text-lg font-bold text-[hsl(var(--landing-navy-foreground))]">TrueTrucker</span>
          </div>
          <p className="text-sm text-[hsl(var(--landing-navy-foreground))]/60 leading-relaxed">
            Built by truckers, for truckers. Simplifying IFTA compliance one mile at a time.
          </p>
        </div>

        {/* Product */}
        <div>
          <h4 className="font-semibold text-[hsl(var(--landing-navy-foreground))] mb-4">Product</h4>
          <ul className="space-y-2 text-sm text-[hsl(var(--landing-navy-foreground))]/60">
            <li><a href="#features" className="hover:text-[hsl(var(--landing-navy-foreground))] transition-colors">Features</a></li>
            <li><a href="#pricing" className="hover:text-[hsl(var(--landing-navy-foreground))] transition-colors">Pricing</a></li>
            <li><a href="/help" className="hover:text-[hsl(var(--landing-navy-foreground))] transition-colors">Help Center</a></li>
            <li><a href="/install" className="hover:text-[hsl(var(--landing-navy-foreground))] transition-colors">Install App</a></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="font-semibold text-[hsl(var(--landing-navy-foreground))] mb-4">Legal</h4>
          <ul className="space-y-2 text-sm text-[hsl(var(--landing-navy-foreground))]/60">
            <li><a href="/privacy-policy" className="hover:text-[hsl(var(--landing-navy-foreground))] transition-colors">Privacy Policy</a></li>
            <li><a href="/terms-of-service" className="hover:text-[hsl(var(--landing-navy-foreground))] transition-colors">Terms of Service</a></li>
            <li><a href="/refund-policy" className="hover:text-[hsl(var(--landing-navy-foreground))] transition-colors">Refund Policy</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-semibold text-[hsl(var(--landing-navy-foreground))] mb-4">Contact</h4>
          <ul className="space-y-2 text-sm text-[hsl(var(--landing-navy-foreground))]/60">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <a href="mailto:support@truetrucker.com" className="hover:text-[hsl(var(--landing-navy-foreground))] transition-colors">
                support@truetrucker.com
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>1‑800‑TRUCKER</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[hsl(var(--landing-navy-foreground))]/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[hsl(var(--landing-navy-foreground))]/40">
        <p>© 2026 TrueTrucker IFTA Pro. All rights reserved. FMCSA Certified ELD Provider.</p>
        <div className="flex gap-4">
          <a href="/privacy-policy" className="hover:text-[hsl(var(--landing-navy-foreground))]/70">Privacy</a>
          <a href="/terms-of-service" className="hover:text-[hsl(var(--landing-navy-foreground))]/70">Terms</a>
          <a href="/refund-policy" className="hover:text-[hsl(var(--landing-navy-foreground))]/70">Refunds</a>
        </div>
      </div>
    </div>
  </footer>
);

export default LandingFooter;
