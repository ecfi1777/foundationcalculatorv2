import { Link, useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { CalculatorProvider } from "@/hooks/useCalculatorState";
import { ProjectProvider } from "@/hooks/useProject";
import { CalculatorLayout } from "@/components/calculator/CalculatorLayout";
import SeoCalculatorContainer from "@/components/calculator/SeoCalculatorContainer";
import { Button } from "@/components/ui/button";

const RebarCalculator = () => {
  const navigate = useNavigate();
  return (
    <>
      <SEO
        title="Rebar Calculator | Free Rebar Estimator"
        description="Calculate rebar quantities for slabs, footings, and walls. Estimate linear footage, bar counts, spacing, and lap splice lengths for your concrete project."
        canonical="https://foundationcalculator.com/rebar-calculator"
      />

      <div className="min-h-screen bg-background text-foreground">
        {/* H1 + Intro */}
        <section className="mx-auto max-w-4xl px-4 pt-10 pb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Rebar Calculator
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Rebar quantities depend on spacing, bar size, overlap, and layout — and they're different for slabs, footings, and walls. Most jobs have multiple sections with different rebar configurations. Enter your dimensions above and the calculator totals the bars, overlap, and footage.
          </p>
        </section>

        {/* Calculator */}
        <SeoCalculatorContainer>
          {/* Rebar has no standalone tab — maps to "footing" which is the primary rebar-enabled calculator type */}
          <CalculatorProvider initialTab="footing" hydrateFromStorage={false}>
            <ProjectProvider clearCalculatorOnSignOut={false}>
              <CalculatorLayout
                mode="embedded"
                onOpenWorkspace={() => navigate("/app?tab=footing&from=/rebar-calculator")}
              />
            </ProjectProvider>
          </CalculatorProvider>
        </SeoCalculatorContainer>

        {/* Formula */}
        <section className="mx-auto max-w-3xl px-4 pb-12">
          <h2 className="mb-4 text-xl font-semibold">How to Calculate Rebar</h2>
          <div className="rounded-lg border border-border/60 bg-card p-6">
            <ul className="space-y-3 text-sm text-muted-foreground list-disc list-inside">
              <li>For slab grids: spacing in both directions determines total linear feet of rebar across the slab area</li>
              <li>For footings and walls: number of runs, verticals, horizontals, and overlap lengths affect the total</li>
              <li>Overlap (splice length) adds material to every run and must be included in every estimate</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              The calculator handles the layout math so you can see the total footage faster.
            </p>
          </div>
        </section>

        {/* Real-World Example */}
        <section className="mx-auto max-w-3xl px-4 pb-12">
          <h2 className="mb-4 text-xl font-semibold">What a Real Rebar Layout Looks Like</h2>
          <div className="rounded-lg border border-border/60 bg-card p-6">
            <p className="text-muted-foreground text-sm mb-4">
              Most jobs don't have one rebar layout. Slabs, footings, and walls usually all need something different.
            </p>
            <div className="divide-y divide-border/40">
              <div className="flex justify-between py-3">
                <div>
                  <p className="font-medium text-sm">Garage Slab Grid</p>
                  <p className="text-muted-foreground text-xs">#4 @ 12″ O.C.</p>
                </div>
                <p className="font-medium text-sm">1,840 LF</p>
              </div>
              <div className="flex justify-between py-3">
                <div>
                  <p className="font-medium text-sm">Main Footing</p>
                  <p className="text-muted-foreground text-xs">3 continuous #4 bars</p>
                </div>
                <p className="font-medium text-sm">600 LF</p>
              </div>
              <div className="flex justify-between py-3">
                <div>
                  <p className="font-medium text-sm">Foundation Wall Verticals</p>
                  <p className="text-muted-foreground text-xs">#4 @ 24″ O.C.</p>
                </div>
                <p className="font-medium text-sm">188 LF</p>
              </div>
              <div className="flex justify-between py-3">
                <div>
                  <p className="font-medium text-sm">Foundation Wall Horizontals</p>
                  <p className="text-muted-foreground text-xs">2 runs #4</p>
                </div>
                <p className="font-medium text-sm">470 LF</p>
              </div>
              <div className="flex justify-between py-3">
                <p className="font-semibold text-sm">Total Rebar</p>
                <p className="font-semibold text-sm">3,098 LF</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm mt-4">
              Change one section and the total updates without rebuilding the whole takeoff.
            </p>
          </div>
        </section>

        {/* Contractor Tips */}
        <section className="mx-auto max-w-3xl px-4 pb-12">
          <h2 className="mb-4 text-xl font-semibold">Contractor Tips</h2>
          <div className="rounded-lg border border-border/60 bg-card p-6">
            <ul className="space-y-3 text-sm text-muted-foreground list-disc list-inside">
              <li>Slab grid spacing changes the total quickly — 12″ vs 18″ O.C. is a big difference in material</li>
              <li>Footings often use continuous longitudinal bars with overlap at corners and intersections</li>
              <li>Wall rebar usually includes both vertical and horizontal steel at different spacings</li>
              <li>Overlap length matters and gets missed often — check local code for minimum lap splice</li>
              <li>Waste adds up fast when bars are cut in the field — plan for 5–10% extra</li>
              <li>Always separate slab, footing, and wall layouts instead of mixing them together</li>
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-4 pb-12">
          <h2 className="mb-4 text-xl font-semibold">Rebar Calculator FAQ</h2>
          <div className="space-y-4">
            {[
              {
                q: "How do I calculate how much rebar I need?",
                a: "Determine the area or length, then divide by bar spacing to get the number of bars. Multiply by bar length (including overlap) to get total linear feet.",
              },
              {
                q: "How does bar spacing affect total rebar?",
                a: "Tighter spacing means more bars. A slab at 12″ O.C. uses roughly 50% more rebar than the same slab at 18″ O.C.",
              },
              {
                q: "What does overlap or splice length mean?",
                a: "When two bars meet end-to-end, they must overlap by a minimum length (typically 40 bar diameters) to maintain structural continuity. This adds material to every run.",
              },
              {
                q: "Can I calculate slab, footing, and wall rebar separately?",
                a: "Yes. Each area type has its own rebar configuration. The calculator lets you add multiple sections and totals everything together.",
              },
              {
                q: "Do I need to include waste?",
                a: "Yes. Bars are cut to length in the field, and short pieces are often unusable. Plan for 5–10% extra material.",
              },
              {
                q: "What's the difference between horizontal and vertical wall rebar?",
                a: "Vertical bars resist bending from soil pressure. Horizontal bars tie the wall together and resist cracking. Both are typically required by code.",
              },
              {
                q: "Can I total all rebar for one project together?",
                a: "Yes. Add all your slab, footing, and wall sections to one project and the calculator combines the total linear footage across everything.",
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
                to: "/concrete-footing-calculator",
                title: "Footing Calculator",
                desc: "Calculate footing concrete from linear footage and footing dimensions.",
              },
              {
                to: "/concrete-wall-calculator",
                title: "Wall Calculator",
                desc: "Calculate concrete for foundation walls and retaining walls.",
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

export default RebarCalculator;
