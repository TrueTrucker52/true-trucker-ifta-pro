import { ClipboardList, Camera, MapPin, Mic, Scale, Bot } from "lucide-react";

const features = [
  {
    icon: ClipboardList,
    title: "Automated IFTA Filing",
    desc: "We calculate everything automatically. Just review and submit in one tap. Zero math required.",
  },
  {
    icon: Camera,
    title: "BOL Camera Scanner",
    desc: "Scan any Bill of Lading in seconds. Auto‑extracts all the data. Never lose a BOL again.",
  },
  {
    icon: MapPin,
    title: "Live GPS Tracking",
    desc: "Real‑time location for your whole fleet. Know where every truck is 24/7 from your phone.",
  },
  {
    icon: Mic,
    title: "Voice Commands",
    desc: 'Say "Hey Trucker" to control everything hands‑free while you are on the road safely.',
  },
  {
    icon: Scale,
    title: "ELD Compliance",
    desc: "FMCSA‑certified electronic logs. Pass any DOT inspection with one tap. Stay 100% legal.",
  },
  {
    icon: Bot,
    title: "AI Assistant",
    desc: "TruckerAI answers any IFTA or trucking question instantly. Like having an expert on call.",
  },
];

const FeaturesShowcase = () => (
  <section id="features" className="bg-background py-20 md:py-28">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-2">
        Automatic IFTA Filing for Truck Drivers
      </h2>
      <h3 className="text-xl md:text-2xl font-bold text-foreground/80 mb-2">
        ELD Compliance Made Simple · GPS Fleet Tracking for Owner Operators
      </h3>
      <p className="text-muted-foreground mb-14 max-w-xl mx-auto">
        BOL Scanner for Truck Drivers — one app to replace your entire compliance stack.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {features.map((f) => (
          <div
            key={f.title}
            className="bg-card border border-border rounded-xl p-8 text-left hover:shadow-lg transition-shadow"
          >
            <div className="bg-secondary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-5">
              <f.icon className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="text-lg font-bold text-card-foreground mb-2">{f.title}</h3>
            <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesShowcase;
