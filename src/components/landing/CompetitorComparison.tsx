import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Check, X } from "lucide-react";

const rows = [
  ["IFTA Tracking",    true, false, false, "😤"],
  ["ELD Compliance",   true, true,  true,  false],
  ["BOL Scanning",     true, false, false, "📷"],
  ["Live GPS Tracking",true, true,  true,  false],
  ["AI Assistant",     true, false, false, false],
  ["Voice Commands",   true, false, false, false],
  ["Fleet Management", true, true,  true,  false],
  ["Auto IFTA Reports",true, false, false, false],
] as const;

const priceRow = ["$39", "$45", "$35", "$0 + fines"];

const Cell = ({ val }: { val: boolean | string }) => {
  if (val === true) return <Check className="h-5 w-5 text-accent mx-auto" />;
  if (val === false) return <X className="h-5 w-5 text-destructive/60 mx-auto" />;
  return <span className="text-sm text-muted-foreground">{val}</span>;
};

const CompetitorComparison = () => {
  const navigate = useNavigate();
  return (
    <section className="bg-background py-20 md:py-28">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-12">
          Why pay more for less? 💰
        </h2>
        <div className="overflow-x-auto max-w-4xl mx-auto mb-10 rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[hsl(var(--landing-navy))] text-[hsl(var(--landing-navy-foreground))]">
                <th className="text-left p-4 font-semibold">Feature</th>
                <th className="p-4 font-bold text-secondary">TrueTrucker</th>
                <th className="p-4 font-semibold">Samsara</th>
                <th className="p-4 font-semibold">KeepTruckin</th>
                <th className="p-4 font-semibold">Manual</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, tt, sam, kt, manual]) => (
                <tr key={label as string} className="border-t border-border hover:bg-muted/40">
                  <td className="text-left p-4 font-medium text-foreground">{label as string}</td>
                  <td className="p-4"><Cell val={tt} /></td>
                  <td className="p-4"><Cell val={sam} /></td>
                  <td className="p-4"><Cell val={kt} /></td>
                  <td className="p-4"><Cell val={manual} /></td>
                </tr>
              ))}
              <tr className="border-t-2 border-border bg-muted/30 font-bold">
                <td className="text-left p-4 text-foreground">Price / truck / mo</td>
                {priceRow.map((p) => (
                  <td key={p} className={`p-4 ${p === "$39" ? "text-accent font-extrabold text-lg" : "text-muted-foreground"}`}>{p}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xl md:text-2xl font-bold text-foreground mb-6">
          More features. Lower price. Built specifically for truckers.
        </p>
        <Button variant="hero" size="lg" className="bg-secondary hover:bg-secondary/90" onClick={() => navigate("/auth")}>
          Switch to TrueTrucker Today →
        </Button>
      </div>
    </section>
  );
};

export default CompetitorComparison;
