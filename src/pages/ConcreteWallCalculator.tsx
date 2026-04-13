import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { CalculatorProvider } from "@/hooks/useCalculatorState";
import { ProjectProvider } from "@/hooks/useProject";
import { CalculatorLayout } from "@/components/calculator/CalculatorLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const ConcreteWallCalculator = () => {
  return (
    <>
      <SEO
        title="Concrete Wall Calculator | Free Foundation Wall Estimator"
        description="Calculate concrete yardage for foundation walls, stem walls, and poured concrete walls. Enter height, thickness, and length for instant estimates."
        canonical="https://foundationcalculator.com/concrete-wall-calculator"
      />

      <div className="min-h-screen bg-background text-foreground">
        {/* Hero */}
        <section className="mx-auto max-w-4xl px-4 pt-10 pb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Concrete Wall Calculator
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Wall concrete is calculated from length, height, and thickness. Foundation walls, stem walls, and retaining walls are common — and most jobs include multiple wall sections at different dimensions. Enter your measurements above and the calculator handles the rest.
          </p>
        </section>

        {/* Calculator */}
        <section className="pb-8">
          <CalculatorProvider initialTab="wall" hydrateFromStorage={false}>
            <ProjectProvider clearCalculatorOnSignOut={false}>
              <CalculatorLayout />
            </ProjectProvider>
          </CalculatorProvider>
        </section>

        {/* Formula */}
        <section className="mx-auto max-w-3xl px-4 pb-12">
          <Card className="p-6">
            <h2 className="mb-3 text-lg font-semibold">How to Calculate Concrete for Walls</h2>
            <p className="text-center font-mono text-sm bg-muted/50 rounded-md py-3 px-4 mb-3">
              Length (ft) × Height (ft) × Thickness (ft) ÷ 27 = cubic yards
            </p>
            <p className="text-muted-foreground text-sm">
              Thickness is usually measured in inches — divide by 12 to convert to feet. The calculator handles this automatically.
            </p>
          </Card>
        </section>

        {/* Real-World Example */}
        <section className="mx-auto max-w-3xl px-4 pb-12">
          <Card className="p-6">
            <h2 className="mb-3 text-lg font-semibold">What a Real Wall Layout Looks Like</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Most projects include multiple wall sections with different heights and thicknesses.
            </p>
            <div className="divide-y divide-border text-sm">
              <div className="flex justify-between py-2">
                <div>
                  <span className="font-medium">Foundation Walls</span>
                  <span className="text-muted-foreground ml-2">235 LF × 8′ × 8″</span>
                </div>
                <span className="font-medium">46.42 yd³</span>
              </div>
              <div className="flex justify-between py-2">
                <div>
                  <span className="font-medium">Garage Stem Wall</span>
                  <span className="text-muted-foreground ml-2">120 LF × 4′ × 8″</span>
                </div>
                <span className="font-medium">11.85 yd³</span>
              </div>
              <div className="flex justify-between py-2">
                <div>
                  <span className="font-medium">Retaining Wall Section</span>
                  <span className="text-muted-foreground ml-2">60 LF × 3′ × 10″</span>
                </div>
                <span className="font-medium">5.56 yd³</span>
              </div>
              <div className="flex justify-between py-2 font-semibold">
                <span>Total</span>
                <span>63.83 yd³</span>
              </div>
            </div>
            <p className="text-muted-foreground text-sm mt-4">
              Adjust any section and the total updates automatically.
            </p>
          </Card>
        </section>

        {/* Contractor Tips */}
        <section className="mx-auto max-w-3xl px-4 pb-12">
          <h2 className="text-lg font-semibold mb-4">Contractor Tips</h2>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
            <li>Wall thickness varies depending on structure type and engineering requirements</li>
            <li>Basement foundation walls are typically 8″ thick for residential construction</li>
            <li>Retaining walls may require 10″–12″ or thicker depending on height and soil pressure</li>
            <li>Height changes have a large impact on volume — even a small increase adds significant yardage</li>
            <li>Deduct for window and door openings where possible to avoid over-ordering</li>
            <li>Always add 5–10% for waste — forms shift, and walls are rarely perfectly uniform</li>
          </ul>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-4 pb-12">
          <h2 className="text-lg font-semibold mb-4">Concrete Wall Calculator FAQ</h2>
          <div className="space-y-4">
            {[
              {
                q: "How many yards of concrete per linear foot of wall?",
                a: "Depends on height and thickness. An 8′ tall × 8″ thick wall uses about 0.20 yd³ per linear foot.",
              },
              {
                q: "What is a typical foundation wall thickness?",
                a: "Most residential foundation walls are 8″ thick. Taller walls or heavy loads may require 10″ or more.",
              },
              {
                q: "How do I calculate concrete for a wall?",
                a: "Multiply length × height × thickness (all in feet), then divide by 27. Convert inches to feet first.",
              },
              {
                q: "Should I subtract for window and door openings?",
                a: "Yes, if the openings are significant. Small openings may not be worth deducting — the extra concrete covers waste.",
              },
              {
                q: "How much extra concrete should I order?",
                a: "Plan for 5–10% extra. Wall forms can shift slightly, and concrete settles into uneven spots.",
              },
              {
                q: "What's the difference between a stem wall and a foundation wall?",
                a: "A stem wall is the shorter wall between the footing and the slab or floor. A foundation wall runs the full height from footing to top of wall.",
              },
              {
                q: "Do concrete walls need rebar?",
                a: "Yes. Most poured walls require both horizontal and vertical rebar per code. Spacing depends on wall height and local requirements.",
              },
            ].map((item) => (
              <Card key={item.q} className="p-4">
                <p className="font-medium text-sm">{item.q}</p>
                <p className="text-muted-foreground text-sm mt-1">{item.a}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Internal Links */}
        <section className="mx-auto max-w-3xl px-4 pb-12">
          <h2 className="text-lg font-semibold mb-4">Related Calculators</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { to: "/concrete-calculator", title: "Concrete Calculator", desc: "Full concrete calculator for footings, walls, slabs, and more — all in one project." },
              { to: "/concrete-slab-calculator", title: "Slab Calculator", desc: "Calculate slab yardage with thickness across multiple sections." },
              { to: "/concrete-footing-calculator", title: "Footing Calculator", desc: "Calculate footing concrete from linear footage and footing dimensions." },
              { to: "/rebar-calculator", title: "Rebar Calculator", desc: "Calculate rebar quantities for slabs, footings, and wall layouts." },
            ].map((link) => (
              <Link key={link.to} to={link.to} className="block">
                <Card className="p-4 h-full hover:border-primary/40 transition-colors">
                  <p className="font-medium text-sm">{link.title}</p>
                  <p className="text-muted-foreground text-xs mt-1">{link.desc}</p>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Link back */}
        <section className="mx-auto max-w-3xl px-4 pb-16 text-center">
          <Button asChild variant="outline">
            <Link to="/concrete-calculator">← See all calculator types</Link>
          </Button>
        </section>
      </div>
    </>
  );
};

export default ConcreteWallCalculator;
