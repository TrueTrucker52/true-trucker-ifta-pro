import { useState, useEffect } from "react";
import { Truck, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const LandingHeader = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[hsl(var(--landing-navy))]/95 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between h-16 md:h-20">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <div className="bg-secondary p-1.5 rounded-lg">
            <Truck className="h-5 w-5 text-secondary-foreground" />
          </div>
          <span className="text-lg font-bold text-[hsl(var(--landing-navy-foreground))]">
            TrueTrucker
          </span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {[
            ["Features", "features"],
            ["Pricing", "pricing"],
          ].map(([label, id]) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="text-sm font-medium text-[hsl(var(--landing-navy-foreground))]/80 hover:text-[hsl(var(--landing-navy-foreground))] transition-colors"
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => navigate("/auth")}
            className="text-sm font-medium text-[hsl(var(--landing-navy-foreground))]/80 hover:text-[hsl(var(--landing-navy-foreground))] transition-colors"
          >
            Login
          </button>
          <Button
            variant="hero"
            size="sm"
            onClick={() => navigate("/auth")}
            className="bg-secondary hover:bg-secondary/90"
          >
            Start Free Trial →
          </Button>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-[hsl(var(--landing-navy-foreground))]"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[hsl(var(--landing-navy))] border-t border-[hsl(var(--landing-navy-foreground))]/10 px-4 py-4 space-y-3">
          <button onClick={() => scrollTo("features")} className="block w-full text-left text-[hsl(var(--landing-navy-foreground))]/80 py-2">Features</button>
          <button onClick={() => scrollTo("pricing")} className="block w-full text-left text-[hsl(var(--landing-navy-foreground))]/80 py-2">Pricing</button>
          <button onClick={() => { setMobileOpen(false); navigate("/auth"); }} className="block w-full text-left text-[hsl(var(--landing-navy-foreground))]/80 py-2">Login</button>
          <Button variant="hero" size="default" className="w-full bg-secondary hover:bg-secondary/90" onClick={() => { setMobileOpen(false); navigate("/auth"); }}>
            Start Free Trial →
          </Button>
        </div>
      )}
    </header>
  );
};

export default LandingHeader;
