import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  { q: "What is IFTA?", a: "IFTA stands for International Fuel Tax Agreement. It requires commercial truck drivers who operate in multiple states to file quarterly fuel tax reports. TrueTrucker IFTA Pro automates the entire process." },
  { q: "When is the IFTA deadline?", a: "IFTA is filed quarterly: Q1 due April 30, Q2 due July 31, Q3 due October 31, Q4 due January 31. TrueTrucker sends automatic reminders before each deadline." },
  { q: "How much does IFTA filing cost?", a: "TrueTrucker IFTA Pro starts at $39 per month for solo owner operators with a 7‑day free trial. No credit card required to start." },
  { q: "Do I need a credit card to start?", a: "No! Start your 7‑day free trial with just your email address. A card is only needed when you decide to upgrade." },
  { q: "What happens after the trial?", a: "You choose a plan starting at $39/month. If you don't upgrade, your data is safely stored for 30 days while you decide." },
  { q: "Is TrueTrucker ELD FMCSA certified?", a: "Yes. TrueTrucker meets all FMCSA 49 CFR Part 395 requirements for electronic logging devices." },
  { q: "Can I use it for multiple trucks?", a: "Absolutely! Our Small Fleet plan covers 2–5 trucks at $79/month — cheaper than most ELD solutions for just 1 truck." },
  { q: "Does it work offline?", a: "Yes! TrueTrucker works offline and syncs everything when you're back online. Perfect for remote areas with no signal." },
  { q: "Can I cancel anytime?", a: "Yes. Cancel anytime with no fees or penalties. We also offer a 30‑day money‑back guarantee on your first payment." },
  { q: "Does TrueTrucker work on iPhone?", a: "Yes! TrueTrucker works on iPhone, Android, and desktop computers. Install it on your home screen like a native app for instant access." },
  { q: "What about my existing data?", a: "All your data is encrypted and safely stored. We never sell your data to third parties — ever." },
];

const FAQSection = () => (
  <section className="bg-[hsl(var(--landing-gray))] py-20 md:py-28">
    <div className="container mx-auto px-4 max-w-3xl">
      <h2 className="text-3xl md:text-4xl font-extrabold text-foreground text-center mb-4">
        International Fuel Tax Agreement Filing in Minutes
      </h2>
      <h3 className="text-lg md:text-xl text-muted-foreground text-center mb-12">
        IFTA Calculator for All 48 States — Got questions? We got answers 🚛
      </h3>
      <Accordion type="single" collapsible className="space-y-2">
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`faq-${i}`} className="bg-card border border-border rounded-lg px-6">
            <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
              {f.q}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              {f.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);

export default FAQSection;
