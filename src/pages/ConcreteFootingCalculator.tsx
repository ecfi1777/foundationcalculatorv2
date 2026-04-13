import { Link, useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { CalculatorProvider } from "@/hooks/useCalculatorState";
import { ProjectProvider } from "@/hooks/useProject";
import { CalculatorLayout } from "@/components/calculator/CalculatorLayout";
import { Button } from "@/components/ui/button";

const ConcreteFootingCalculator = () => {
  const navigate = useNavigate();
  return (
    <>
      <SEO
        title="Concrete Footing Calculator | Free Foundation Estimator"
        description="Calculate concrete yardage for continuous footings, spread footings, and foundation pads. Enter dimensions in feet and inches for instant estimates."
        canonical="https://foundationcalculator.com/concrete-footing-calculator"
      />

      <div className="min-h-screen bg-background text-foreground">
        {/* H1 + Intro */}
        <section className="mx-auto max-w-4xl px-4 pt-10 pb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Concrete Footing Calculator
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Footing concrete is calculated from linear footage, width, and depth. Most jobs have more than one footing size — different sections for main walls, garages, and frost footings. Enter your dimensions above and the calculator handles the math.
          </p>
        </section>

        {/* Calculator */}
        <SeoCalculatorContainer>
          <CalculatorProvider initialTab="footing" hydrateFromStorage={false}>
            <ProjectProvider clearCalculatorOnSignOut={false}>
              <CalculatorLayout
                mode="embedded"
                onOpenWorkspace={() => navigate("/app?tab=footing&from=/concrete-footing-calculator")}
              />
            </ProjectProvider>
          </CalculatorProvider>
        </SeoCalculatorContainer>

        {/* Formula */}
        <section className="mx-auto max-w-3xl px-4 pb-12">
          <h2 className="mb-4 text-xl font-semibold">How to Calculate Concrete for Footings</h2>
          <div className="rounded-lg border border-border/60 bg-card p-6">
            <p className="font-mono text-center text-base sm:text-lg text-foreground mb-4">
              Length (ft) × Width (ft) × Depth (ft) ÷ 27 = cubic yards
            </p>
            <p className="text-muted-foreground text-sm">
              Width and depth are usually measured in inches — divide by 12 to convert to feet. The calculator handles this automatically.
            </p>
          </div>
        </section>

        {/* Real-World Example */}
        <section className="mx-auto max-w-3xl px-4 pb-12">
          <h2 className="mb-4 text-xl font-semibold">What a Real Footing Layout Looks Like</h2>
          <div className="rounded-lg border border-border/60 bg-card p-6">
            <p className="text-muted-foreground text-sm mb-4">
              Most jobs don't use one footing size. Different sections often have different widths and depths.
            </p>
            <div className="divide-y divide-border/40">
              <div className="flex justify-between py-3">
                <div>
                  <p className="font-medium text-sm">Main Footing</p>
                  <p className="text-muted-foreground text-xs">200 LF × 24″ × 12″</p>
                </div>
                <p className="font-medium text-sm">14.81 yd³</p>
              </div>
              <div className="flex justify-between py-3">
                <div>
                  <p className="font-medium text-sm">Garage Footing</p>
                  <p className="text-muted-foreground text-xs">120 LF × 18″ × 10″</p>
                </div>
                <p className="font-medium text-sm">5.56 yd³</p>
              </div>
              <div className="flex justify-between py-3">
                <div>
                  <p className="font-medium text-sm">Frost Footing Sections</p>
                  <p className="text-muted-foreground text-xs">60 LF × 24″ × 12″</p>
                </div>
                <p className="font-medium text-sm">4.44 yd³</p>
              </div>
              <div className="flex justify-between py-3">
                <p className="font-semibold text-sm">Total</p>
                <p className="font-semibold text-sm">24.81 yd³</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm mt-4">
              Adjust any section and the total updates automatically.
            </p>
          </div>
        </section>

        {/* Contractor Tips */}
        <section className="mx-auto max-w-3xl px-4 pb-12">
          <h2 className="mb-4 text-xl font-semibold">Contractor Tips</h2>
          <div className="rounded-lg border border-border/60 bg-card p-6">
            <ul className="space-y-3 text-sm text-muted-foreground list-disc list-inside">
              <li>Footing sizes often vary across the same job — main footings, garage footings, and porch footings may all differ</li>
              <li>Garage and porch footings are often narrower or shallower than main foundation footings</li>
              <li>Frost footings may require deeper or wider sections depending on local frost depth requirements</li>
              <li>Stepped footings need to be measured section by section — don't average the depth</li>
              <li>Always account for waste and irregular trenches — 5–10% extra is standard</li>
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-4 pb-12">
          <h2 className="mb-4 text-xl font-semibold">Concrete Footing Calculator FAQ</h2>
          <div className="space-y-4">
            {[
              {
                q: "How many yards of concrete per 100 ft of footing?",
                a: "It depends on width and depth. A 20″ × 12″ footing at 100 LF needs about 6.17 yd³. A 24″ × 12″ footing needs about 7.41 yd³.",
              },
              {
                q: "What is a typical footing size?",
                a: "Residential footings are commonly 16″–24″ wide and 8″–12″ deep. Size depends on load, soil conditions, and local building codes.",
              },
              {
                q: "How do I calculate footing concrete from linear feet?",
                a: "Multiply linear feet by width (in feet) by depth (in feet), then divide by 27. Convert inches to feet first by dividing by 12.",
              },
              {
                q: "What is a frost footing?",
                a: "A frost footing extends below the local frost line to prevent heaving. Depths vary by region — typically 36″–48″ in cold climates.",
              },
              {
                q: "How do stepped footings affect concrete quantity?",
                a: "Each step adds volume. Measure each stepped section separately with its own depth, then combine the totals for your order.",
              },
              {
                q: "How much extra concrete should I order?",
                a: "Plan for 5–10% extra. Trenches are rarely perfectly uniform, and waste from spillage adds up on longer runs.",
              },
              {
                q: "Do footings need rebar?",
                a: "Most footings require continuous rebar per code. Check local requirements — typically two horizontal bars with vertical ties at wall intersections.",
              },
            ].map((item, i) => (
              <div key={i} className="rounded-lg border border-border/60 bg-card p-5">
                <p className="font-medium text-sm mb-1">{item.q}</p>
                <p className="text-muted-foreground text-sm">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Internal Links */}
        <section className="mx-auto max-w-3xl px-4 pb-12">
          <h2 className="mb-4 text-xl font-semibold">Related Calculators</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                to: "/concrete-calculator",
                title: "Concrete Calculator",
                desc: "Full concrete calculator for footings, walls, slabs, and more — all in one project.",
              },
              {
                to: "/concrete-slab-calculator",
                title: "Slab Calculator",
                desc: "Calculate slab yardage with thickness across multiple sections.",
              },
              {
                to: "/concrete-wall-calculator",
                title: "Wall Calculator",
                desc: "Calculate concrete for foundation walls and retaining walls.",
              },
              {
                to: "/rebar-calculator",
                title: "Rebar Calculator",
                desc: "Calculate rebar quantities for slabs, footings, and wall layouts.",
              },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="rounded-lg border border-border/60 bg-card p-5 hover:border-primary/40 transition-colors"
              >
                <p className="font-medium text-sm mb-1">{link.title}</p>
                <p className="text-muted-foreground text-xs">{link.desc}</p>
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

export default ConcreteFootingCalculator;
