import { Link, useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { CalculatorProvider } from "@/hooks/useCalculatorState";
import { ProjectProvider } from "@/hooks/useProject";
import { CalculatorLayout } from "@/components/calculator/CalculatorLayout";
import SeoCalculatorContainer from "@/components/calculator/SeoCalculatorContainer";
import { Button } from "@/components/ui/button";

const ConcreteSlabCalculator = () => {
  const navigate = useNavigate();
  return (
    <>
      <SEO
        title="Concrete Slab Calculator | Free Yardage Estimator"
        description="Calculate concrete yardage for slabs, patios, garage floors, and flatwork. Enter dimensions in feet and inches — get instant cubic yard estimates."
        canonical="https://foundationcalculator.com/concrete-slab-calculator"
      />

      <div className="min-h-screen bg-background text-foreground">
        {/* Intro */}
        <section className="mx-auto max-w-4xl px-4 pt-10 pb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Concrete Slab Calculator
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Quickly estimate the concrete needed for slabs, garage floors, patios, and other flatwork. Enter your length, width, and thickness to get an accurate cubic yard total — no decimal conversions required.
          </p>
        </section>

        {/* Calculator */}
        <SeoCalculatorContainer>
          <CalculatorProvider initialTab="slab" hydrateFromStorage={false}>
            <ProjectProvider clearCalculatorOnSignOut={false}>
              <CalculatorLayout
                mode="embedded"
                onOpenWorkspace={() => navigate("/app?tab=slab&from=/concrete-slab-calculator")}
              />
            </ProjectProvider>
          </CalculatorProvider>
        </SeoCalculatorContainer>

        {/* Formula */}
        <section className="mx-auto max-w-3xl px-4 pb-12">
          <h2 className="text-2xl font-semibold tracking-tight mb-4">
            How to Calculate Concrete for a Slab
          </h2>
          <div className="rounded-lg border border-border/60 bg-card p-6">
            <p className="text-center text-base font-medium text-foreground mb-4">
              Length (ft) × Width (ft) × Thickness (ft) ÷ 27 = cubic yards
            </p>
            <p className="text-sm text-muted-foreground">
              Thickness is usually measured in inches — divide by 12 to convert to feet before multiplying. This calculator handles that conversion automatically.
            </p>
          </div>
        </section>

        {/* Real-World Example */}
        <section className="mx-auto max-w-3xl px-4 pb-12">
          <h2 className="text-2xl font-semibold tracking-tight mb-4">
            What a Real Slab Pour Looks Like
          </h2>
          <div className="rounded-lg border border-border/60 bg-card p-6">
            <p className="text-sm text-muted-foreground mb-4">
              Most pours include more than one slab area. The total rolls up across all sections.
            </p>
            <div className="space-y-0 divide-y divide-border">
              {[
                { name: "Garage Slab", dims: "24′ × 24′ × 5″", yards: "8.89 yd³" },
                { name: "Patio", dims: "12′ × 10′ × 4″", yards: "1.48 yd³" },
                { name: "Walkway (3 sections)", dims: "4′ × 40′ × 4″", yards: "1.98 yd³" },
              ].map((item) => (
                <div key={item.name} className="flex items-center justify-between py-2">
                  <div>
                    <span className="text-sm font-medium text-foreground">{item.name}</span>
                    <span className="ml-2 text-sm text-muted-foreground">{item.dims}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{item.yards}</span>
                </div>
              ))}
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-semibold text-foreground">Total</span>
                <span className="text-sm font-semibold text-foreground">12.35 yd³</span>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Add or remove sections — the total updates automatically.
            </p>
          </div>
        </section>

        {/* Contractor Tips */}
        <section className="mx-auto max-w-3xl px-4 pb-12">
          <h2 className="text-2xl font-semibold tracking-tight mb-4">
            Contractor Tips
          </h2>
          <div className="rounded-lg border border-border/60 bg-card p-6">
            <ul className="space-y-4">
              {[
                "Garage slabs are typically 5″–6″ thick; patios and walkways are usually 4″.",
                "Always add 5–10% for waste — forms aren't perfect and ground isn't level.",
                "Poor subgrade or soft spots can increase the concrete needed.",
                "Calculate each slab area separately, then combine for your total order.",
                "Many contractors round up when ordering to avoid coming up short.",
              ].map((tip, i) => (
                <li key={i} className="flex gap-2 text-sm text-muted-foreground leading-relaxed">
                  <span className="font-bold text-foreground mt-px">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-4 pb-12">
          <h2 className="text-2xl font-semibold tracking-tight mb-4">
            Concrete Slab Calculator FAQ
          </h2>
          <div className="space-y-2">
            {[
              { q: "How many yards of concrete for a 24×24 slab?", a: "At 4 inches thick, a 24′ × 24′ slab needs about 7.11 cubic yards. At 5 inches, it's roughly 8.89 yards. Always add waste." },
              { q: "How thick should a concrete slab be?", a: "Most residential slabs are 4 inches. Garage slabs and areas with heavy loads are typically 5–6 inches. Check local codes for minimums." },
              { q: "How do I convert square feet to cubic yards?", a: "Multiply square footage by thickness in feet, then divide by 27. For example: 500 sq ft × 0.333 ft (4″) ÷ 27 = 6.17 cubic yards." },
              { q: "Do I need rebar or wire mesh in a slab?", a: "Most slabs benefit from reinforcement. Wire mesh is common for patios and walkways. Rebar is preferred for garage floors and structural slabs." },
              { q: "How much extra concrete should I order?", a: "Plan for 5–10% extra to cover waste, uneven subgrade, and form irregularities. Running short mid-pour is more expensive than ordering a little extra." },
              { q: "What's the difference between a 4-inch and 5-inch slab?", a: "A 5-inch slab uses about 25% more concrete than a 4-inch slab for the same area. The extra thickness adds strength for heavier loads like vehicles." },
              { q: "Can I pour multiple slab areas in one project?", a: "Yes. Enter each slab area as a separate section — the calculator combines them into one total so you can order everything at once." },
            ].map((item, i) => (
              <div key={i} className="rounded-lg border border-border bg-card px-4 py-3">
                <p className="text-sm font-medium text-foreground">{item.q}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Internal Links */}
        <section className="mx-auto max-w-3xl px-4 pb-12">
          <h2 className="text-2xl font-semibold tracking-tight mb-4">
            Related Calculators
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { to: "/concrete-calculator", title: "Concrete Calculator", desc: "Full concrete calculator for footings, walls, slabs, and more — all in one project." },
              { to: "/concrete-footing-calculator", title: "Footing Calculator", desc: "Calculate footing concrete from linear footage and footing dimensions." },
              { to: "/concrete-wall-calculator", title: "Wall Calculator", desc: "Calculate wall concrete for foundation and retaining wall sections." },
              { to: "/rebar-calculator", title: "Rebar Calculator", desc: "Calculate rebar quantities for slabs, footings, and walls." },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="rounded-lg border border-border bg-card p-4 hover:bg-secondary/50 transition-colors"
              >
                <p className="text-sm font-medium text-foreground">{link.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{link.desc}</p>
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

export default ConcreteSlabCalculator;
