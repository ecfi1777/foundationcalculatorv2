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
      <section className="max-w-3xl mx-auto px-4 pt-12 pb-6">
        <h2 className="text-xl font-semibold text-foreground mb-3">
          Concrete Calculator Built for Contractors
        </h2>
        <p className="text-sm text-muted-foreground mb-2">
          Most concrete calculators are designed for single pours like patios or small slabs.
          Real foundation work is different — it involves multiple areas like footings, walls,
          garage slabs, and basement floors, all calculated together.
        </p>
        <p className="text-sm text-muted-foreground">
          This tool is designed as a takeoff system. You can measure each area separately
          and track a running total across the entire job — the same way real estimates are done.
        </p>
      </section>

      {/* ── The real TFC calculator — full viewport height ── */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="min-h-[70vh]">
          <CalculatorProvider>
            <ProjectProvider>
              <CalculatorLayout />
            </ProjectProvider>
          </CalculatorProvider>
        </div>
      </div>

      {/* ── SEO content — below the fold, indexed by Google ── */}
      <div className="bg-background text-foreground">
        <div className="max-w-5xl mx-auto px-4 py-16 space-y-10">

          {/* ── Differentiator ── */}
          <section className="rounded-lg border border-border bg-card p-6 prose prose-sm dark:prose-invert max-w-none">
            <h2>This Is a Takeoff Tool, Not a Calculator</h2>
            <p>
              Most concrete calculators are built for homeowners estimating a single slab or patio.
              That's not how real foundation work happens.
            </p>
            <p>
              A typical job includes multiple pours — footings, walls, garage slabs, basement floors —
              all with different dimensions, different waste, and all needing to roll into one total.
            </p>
            <p>
              That's a takeoff. This tool is built to handle that entire workflow in one place.
            </p>
            <table>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Generic Calculator</th>
                  <th>Total Foundation Calculator</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Calculate multiple areas in one project</td><td>No</td><td>Yes</td></tr>
                <tr><td>Running total across all pours</td><td>No</td><td>Yes</td></tr>
                <tr><td>Different waste per area</td><td>No</td><td>Yes</td></tr>
                <tr><td>Multiple pour types in one job (footings, walls, slabs)</td><td>No</td><td>Yes</td></tr>
                <tr><td>Save and revisit takeoffs</td><td>No</td><td>Yes</td></tr>
                <tr><td>Export a PDF for job files or estimates</td><td>No</td><td>Yes</td></tr>
                <tr><td>Rebar and stone tracking included</td><td>No</td><td>Yes</td></tr>
              </tbody>
            </table>
            <p>
              Generic calculator sites are built for estimating one section at a time.
              This tool is built for running a full foundation takeoff — the way contractors actually work.
            </p>
          </section>

          {/* ── Why Contractors Use This ── */}
          <section className="rounded-lg border border-border bg-card p-6 prose prose-sm dark:prose-invert max-w-none">
            <h3>Why Contractors Use This Instead of Basic Calculators</h3>
            <ul>
              <li>Measure multiple areas in one job (footings, walls, slabs)</li>
              <li>See a running total before ordering concrete</li>
              <li>Adjust waste per section</li>
              <li>Save and revisit takeoffs later</li>
              <li>Export a clean PDF for job files or estimates</li>
            </ul>
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
