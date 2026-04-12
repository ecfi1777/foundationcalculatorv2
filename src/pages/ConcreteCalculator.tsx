import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { captureRefCode } from "@/lib/localStorage";
import { CalculatorProvider } from "@/hooks/useCalculatorState";
import { ProjectProvider } from "@/hooks/useProject";
import { CalculatorLayout } from "@/components/calculator/CalculatorLayout";
import { SEO } from "@/components/SEO";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const JSON_LD_SOFTWARE = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Concrete Calculator — Total Foundation Calculator",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "description": "Professional concrete takeoff calculator for footings, slabs, walls, grade beams, pier pads, cylinders, and steps. Built for concrete contractors with 20+ years of field experience."
});

const JSON_LD_HOW_TO = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Calculate Concrete Yardage",
  "description": "Calculate cubic yards of concrete for any pour using the standard formula.",
  "step": [
    {
      "@type": "HowToStep",
      "name": "Measure your dimensions",
      "text": "Measure length, width, and thickness in feet and inches."
    },
    {
      "@type": "HowToStep",
      "name": "Apply the formula",
      "text": "Length × Width × (Thickness ÷ 12) ÷ 27 = Cubic Yards"
    },
    {
      "@type": "HowToStep",
      "name": "Add waste factor",
      "text": "Add 10% for waste. Subgrades are never perfectly level and concrete does not get delivered twice on short notice."
    }
  ]
});

export default function ConcreteCalculator() {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    captureRefCode();
  }, []);

  return (
    <>
      <SEO
        title="Concrete Calculator — Cubic Yards for Slabs, Footings & Walls"
        description="Enter your dimensions. Get cubic yards instantly — formula shown, waste factor adjustable."
        canonical="https://foundationcalculator.com/concrete-calculator"
      />

      {/* Hidden H1 — visible to Google, does not disrupt the app UI */}
      <h1 className="sr-only">
        Concrete Calculator — Cubic Yards for Slabs, Footings & Walls
      </h1>

      {/* JSON-LD Schema */}
      <Helmet>
        <script type="application/ld+json">{JSON_LD_SOFTWARE}</script>
        <script type="application/ld+json">{JSON_LD_HOW_TO}</script>
      </Helmet>

      {/* ── Intro — product copy, above the calculator ── */}
      {!isExpanded && (
        <section className="max-w-3xl mx-auto px-4 pt-16 pb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
            Professional Takeoff Tool
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Concrete Calculator Built for Contractors
          </h2>
          <div className="max-w-2xl mx-auto space-y-3">
            <p className="text-base text-muted-foreground leading-relaxed">
              Most concrete calculators handle a single pour. Real foundation work involves
              multiple areas — footings, walls, slabs — all calculated together.
            </p>
            <p className="text-base text-muted-foreground leading-relaxed">
              This tool is a takeoff system. Measure each area separately and track a running
              total across the entire job — the way real estimates are done.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            {["Multi-area takeoffs", "Running totals", "PDF exports"].map((item) => (
              <span
                key={item}
                className="inline-flex items-center rounded-full border border-border bg-muted/50 px-4 py-1.5 text-xs font-medium text-muted-foreground"
              >
                {item}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ── The real TFC calculator ── */}
      <div className={cn(
        "mx-auto transition-all duration-300",
        isExpanded ? "max-w-[1600px] px-6 min-h-[85vh]" : "max-w-5xl px-4"
      )}>
        <div className={cn(isExpanded ? "" : "min-h-[70vh]")}>
          <CalculatorProvider>
            <ProjectProvider>
              <CalculatorLayout
                isExpanded={isExpanded}
                onToggleExpand={() => setIsExpanded(prev => !prev)}
              />
            </ProjectProvider>
          </CalculatorProvider>
        </div>
      </div>

      {/* ── SEO content — below the fold, indexed by Google ── */}
      {!isExpanded && (
        <div className="bg-background text-foreground">

          {/* ── 1. Comparison Section (full-width) ── */}
          <section className="bg-muted/40 border-y border-border">
            <div className="max-w-5xl mx-auto px-4 py-16 space-y-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary text-center">
                Why this is different
              </p>

              <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center">
                Not all concrete calculators are built for real jobs
              </h2>

              <div className="max-w-2xl mx-auto text-center space-y-2">
                <p className="text-base text-muted-foreground">
                  Most concrete calculators handle one pour. Real jobs don't.
                </p>
                <p className="text-base text-muted-foreground">
                  Most concrete calculators give you one number. This lets you build out an entire foundation takeoff.
                </p>
              </div>

              <div className="bg-card rounded-xl shadow-sm border border-border overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Feature</th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Basic Concrete Calculator</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Total Foundation Calculator</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["One area at a time", "Yes", "No"],
                      ["Multiple areas per project", "No", "Yes"],
                      ["Running totals across job", "No", "Yes"],
                      ["Footings + walls + slabs together", "No", "Yes"],
                      ["Save and revisit projects", "Rarely", "Yes"],
                      ["Export (PDF / CSV)", "Limited", "Yes"],
                      ["Rebar and additional items", "Usually no", "Yes"],
                      ["Built for contractor workflow", "No", "Yes"],
                    ].map(([feature, basic, tfc], i) => (
                      <tr key={i} className="border-b border-border last:border-b-0">
                        <td className="py-4 px-4 font-medium text-foreground">{feature}</td>
                        <td className="py-4 px-4 text-muted-foreground">{basic}</td>
                        <td className="py-4 px-4 font-medium text-foreground">{tfc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-center text-base font-medium text-foreground">
                Built for real foundation takeoffs — not single pours.
              </p>
            </div>
          </section>

          {/* ── 2. Remaining SEO Content ── */}
          <div className="max-w-4xl mx-auto px-4 py-16 space-y-10">

            {/* ── What this looks like on a real job ── */}
            <section className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-xl font-semibold text-foreground">What this looks like on a real job</h3>
              <p className="mt-3 text-muted-foreground">A typical job might include:</p>
              <ul className="mt-3 space-y-2 text-muted-foreground list-disc pl-5">
                <li>footings around the perimeter</li>
                <li>basement walls</li>
                <li>garage slab</li>
                <li>porch or steps</li>
              </ul>
              <p className="mt-4 text-muted-foreground">
                Instead of calculating each separately, you track everything in one place and get a running total.
              </p>
            </section>

            {/* ── Field Notes ── */}
            <section className="rounded-lg border border-border bg-card p-6 prose prose-sm dark:prose-invert max-w-none">
              <h2 className="text-xl font-semibold text-foreground">
                Field Notes from 20 Years in Foundation Work
              </h2>
              <p>
                The formula is simple:{" "}
                <strong>
                  Length × Width × Thickness (in feet) ÷ 27 = cubic yards.
                </strong>{" "}
                That converts cubic feet to cubic yards, which is how ready-mix
                concrete is sold. Thickness in inches must be divided by 12
                first — a 4-inch slab is 0.333 feet thick.
              </p>
              <p>
                Most contractors order{" "}
                <strong>10% extra</strong> as a
                waste factor. Subgrades are never perfectly level, forms flex
                slightly, and concrete does not get delivered twice on short
                notice. Adjust the waste percentage in the calculator above
                to match your jobsite conditions.
              </p>
              <p>
                Standard residential slabs run 4 inches thick. Garage floors
                and driveways where heavy trucks will park should be 5–6
                inches. House footings typically run{" "}
                <strong>20–24 inches wide</strong>{" "}
                and{" "}
                <strong>10–12 inches deep</strong>{" "}
                — deeper in frost-prone areas.
              </p>
            </section>

            {/* ── FAQ ── */}
            <section className="rounded-lg border border-border bg-card p-6 space-y-6">
              <h2 className="text-xl font-semibold text-foreground">
                Concrete Calculator — Common Questions
              </h2>
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-foreground">
                    How many cubic yards of concrete do I need for a 10×10 slab?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    A 10×10 slab at 4 inches thick requires 1.24 cubic yards
                    before waste. With a 10% waste factor, order 1.36 cubic
                    yards. Use the calculator above to adjust for your exact
                    thickness and waste preference.
                  </p>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-foreground">
                    How do I convert cubic feet to cubic yards?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Divide cubic feet by 27. There are 27 cubic feet in one
                    cubic yard (3 ft × 3 ft × 3 ft = 27 ft³). Concrete is
                    always ordered in cubic yards from a ready-mix plant.
                  </p>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-foreground">
                    How much does a cubic yard of concrete weigh?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    A cubic yard of standard concrete weighs approximately
                    4,000 lbs (2 tons). This matters when estimating truck
                    loads and site access for your pour.
                  </p>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-foreground">
                    Should I order bags or ready-mix concrete?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    For anything over 1 cubic yard, call a ready-mix plant.
                    Mixing bags by hand for large pours leads to inconsistent
                    results and far more labor than it is worth. Bags are best
                    for fence posts, small repairs, and pours under half a yard.
                  </p>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-foreground">
                    What is a concrete takeoff?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    A concrete takeoff is the process of calculating the total
                    volume of concrete needed for a project from the plans or
                    field measurements. A professional takeoff breaks the job
                    into named areas — footings, walls, slabs — calculates each
                    one separately, and totals them with waste factors applied.
                    That is exactly what this tool does.
                  </p>
                </div>
              </div>
            </section>

            {/* ── Related Calculators ── */}
            <nav className="rounded-lg border border-border bg-card p-6 space-y-3">
              <h2 className="text-lg font-semibold text-foreground">
                More Concrete Calculators
              </h2>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Slab Calculator",    href: "/concrete-slab-calculator"    },
                  { label: "Footing Calculator", href: "/concrete-footing-calculator" },
                  { label: "Wall Calculator",    href: "/concrete-wall-calculator"    },
                ].map(({ label, href }) => (
                  <Link key={href} to={href} className="text-sm text-primary underline underline-offset-2 hover:text-primary/80">
                    {label}
                  </Link>
                ))}
              </div>
            </nav>

          </div>
        </div>
      )}
    </>
  );
}
