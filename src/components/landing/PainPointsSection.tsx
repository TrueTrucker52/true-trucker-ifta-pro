import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const painPoints = [
  { emoji: "😤", text: "IFTA paperwork takes me hours every quarter" },
  { emoji: "😰", text: "I got hit with a $2,400 fine for wrong mileage" },
  { emoji: "😩", text: "I lost my BOLs and had to redo everything" },
];

const PainPointsSection = () => {
  const navigate = useNavigate();
  return (
    <section id="pain-points" className="bg-[hsl(var(--landing-navy))] py-20 md:py-28">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-[hsl(var(--landing-navy-foreground))] mb-12">
          Sound familiar? 🤔
        </h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          {painPoints.map((p) => (
            <div
              key={p.text}
              className="bg-[hsl(var(--landing-navy-foreground))]/5 border border-[hsl(var(--landing-navy-foreground))]/10 rounded-xl p-8 text-center"
            >
              <span className="text-5xl mb-4 block">{p.emoji}</span>
              <p className="text-lg text-[hsl(var(--landing-navy-foreground))]/90 font-medium leading-relaxed">
                "{p.text}"
              </p>
            </div>
          ))}
        </div>
        <p className="text-xl md:text-2xl font-bold text-[hsl(var(--landing-navy-foreground))] mb-6">
          TrueTrucker fixes all of this. Automatically. 🚛
        </p>
        <Button
          variant="hero"
          size="lg"
          className="bg-secondary hover:bg-secondary/90"
          onClick={() => navigate("/auth")}
        >
          Fix This For Me →
        </Button>
      </div>
    </section>
  );
};

export default PainPointsSection;
