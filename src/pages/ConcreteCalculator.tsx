import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { captureRefCode } from "@/lib/localStorage";
import { CalculatorProvider } from "@/hooks/useCalculatorState";
import { ProjectProvider } from "@/hooks/useProject";
import { CalculatorLayout } from "@/components/calculator/CalculatorLayout";
import { SEO } from "@/components/SEO";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

const comparisonRows = [
  { feature: "Areas per calculation", typical: "One area at a time", tfc: "Multiple named areas in one project" },
  { feature: "Results", typical: "One-off number, start over each time", tfc: "Running project total that updates as you go" },
  { feature: "Use case", typical: "Generic — any single pour", tfc: "Foundation work — footings, walls, slabs together" },
  { feature: "Revisions", typical: "Re-enter everything to change a number", tfc: "Edit any area without touching the rest" },
  { feature: "Organization", typical: "No saved structure", tfc: "Named areas organized under one project" },
  { feature: "Input format", typical: "Decimal feet or inches only", tfc: "Feet, inches, and fractions — the way you measure" },
];

const exampleAreas = [
  { name: "Garage Slab", hint: "24′ × 24′ × 5″ thick", type: "Slab" },
  { name: "Walkway", hint: "30′ × 4′ × 4″ thick", type: "Slab" },
  { name: "Patio", hint: "16′ × 12′ × 4″ thick", type: "Slab" },
  { name: "Sidewalk", hint: "40′ × 4′ × 4″ thick", type: "Slab" },
  { name: "Main Footing", hint: "24″ wide × 12″ deep, perimeter", type: "Footing" },
  { name: "Frost Footing", hint: "18″ wide × 10″ deep, garage", type: "Footing" },
  { name: "Foundation Wall", hint: "8″ thick × 8′ tall, perimeter", type: "Wall" },
  { name: "Basement Slab", hint: "Varied thickness by section", type: "Slab" },
];

const relatedCalculators = [
  { title: "Concrete Slab Calculator", description: "Calculate yardage for driveways, garage floors, patios, and basement slabs.", href: "/concrete-slab-calculator" },
  { title: "Concrete Footing Calculator", description: "Size footings for houses, garages, additions, and frost walls.", href: "/concrete-footing-calculator" },
  { title: "Concrete Wall Calculator", description: "Foundation walls, retaining walls, and grade beams — measured in segments.", href: "/concrete-wall-calculator" },
  { title: "Rebar Calculator", description: "Estimate linear feet of rebar for slabs, walls, and footings with overlap and waste.", href: "/rebar-calculator" },
];

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

      <Helmet>
        <script type="application/ld+json">{JSON_LD_SOFTWARE}</script>
        <script type="application/ld+json">{JSON_LD_HOW_TO}</script>
      </Helmet>

      {/* ── Section 1: Hero + Calculator ── */}
      {!isExpanded && (
        <section className="max-w-4xl mx-auto px-4 pt-10 sm:pt-16 pb-6 sm:pb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground text-center">
            Concrete Calculator
          </h1>
          <p className="mt-3 text-base sm:text-lg text-muted-foreground text-center max-w-2xl mx-auto">
            Set up your footings, walls, and slabs as separate areas. Save each one, adjust it when things change, and keep your total right.
          </p>
          <p className="mt-2 text-sm text-muted-foreground text-center">
            Works in feet, inches, and fractions — built for multi-area jobs, not single pours.
          </p>
        </section>
      )}

      {/* ── Calculator embed ── */}
      <div className={cn(
        "mx-auto transition-all duration-300",
        isExpanded ? "max-w-[1600px] px-6 min-h-[85vh]" : "max-w-5xl px-4 mb-16"
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

      {/* ── SEO content sections ── */}
      {!isExpanded && (
        <div className="bg-background text-foreground">

          {/* ── Section 2: Differentiator ── */}
          <section className="bg-muted/40 border-y border-border">
            <div className="max-w-5xl mx-auto px-4 py-12 sm:py-16 space-y-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center">
                Why this is different from a typical concrete calculator
              </h2>
              <p className="text-base text-muted-foreground text-center max-w-2xl mx-auto">
                Most calculators give you one box for one pour. Real jobs have a 24″ main footing and an 18″ garage footing, a 5″ garage slab and a 4″ basement slab, and walls at different heights. It gets worse when you're running three driveways in one day, each a different size. One input box doesn't cut it.
              </p>

              {/* Desktop table */}
              <div className="hidden md:block">
                <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-semibold text-foreground py-3 px-4">Feature</TableHead>
                        <TableHead className="font-semibold text-muted-foreground py-3 px-4">Typical Calculator</TableHead>
                        <TableHead className="font-semibold text-foreground py-3 px-4">This Tool</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {comparisonRows.map((row, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium text-foreground py-4 px-4">{row.feature}</TableCell>
                          <TableCell className="text-muted-foreground py-4 px-4">{row.typical}</TableCell>
                          <TableCell className="font-medium text-foreground py-4 px-4">{row.tfc}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Mobile stacked cards */}
              <div className="md:hidden space-y-4">
                {comparisonRows.map((row, i) => (
                  <div key={i} className="rounded-lg border border-border bg-card p-4 space-y-2">
                    <p className="text-sm font-semibold text-foreground">{row.feature}</p>
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-medium text-muted-foreground bg-muted rounded px-2 py-0.5 shrink-0">Typical</span>
                      <p className="text-sm text-muted-foreground">{row.typical}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-medium text-primary bg-primary/10 rounded px-2 py-0.5 shrink-0">This tool</span>
                      <p className="text-sm text-foreground">{row.tfc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Section 3: Real-World Basement Example ── */}
          <section className="max-w-5xl mx-auto px-4 py-12 sm:py-16 space-y-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center">
              What a real foundation takeoff looks like
            </h2>
            <p className="text-base text-muted-foreground text-center max-w-2xl mx-auto">
              With a typical calculator, you'd run each of these separately — garage slab, walkway, patio, sidewalk, footings, walls — then add the totals by hand or in a spreadsheet. Every time something changes, you redo the math.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {exampleAreas.map((area) => (
                <Card key={area.name} className="bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold text-foreground">
                      {area.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">{area.hint}</p>
                    <span className="inline-block text-xs font-medium text-primary bg-primary/10 rounded px-2 py-0.5">
                      {area.type}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>

            <p className="text-sm text-muted-foreground text-center max-w-xl mx-auto">
              Here's what goes wrong: you update the garage slab from 4 inches to 5 inches but forget to re-add the walkway and patio. Your total is off by 2 yards and you don't catch it until the truck shows up short.
            </p>
            <p className="text-sm text-muted-foreground text-center max-w-xl mx-auto">
              This tool keeps all your areas in one place. Edit one section without touching the rest. The project total always reflects every area — no re-adding, no spreadsheet.
            </p>
          </section>

          {/* ── Section 4: Internal Links ── */}
          <section className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">
              More Concrete Calculators
            </h2>
            <nav className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedCalculators.map((calc) => (
                <Link
                  key={calc.href}
                  to={calc.href}
                  className="rounded-lg border border-border bg-card p-5 hover:border-primary/50 transition-colors group"
                >
                  <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                    {calc.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {calc.description}
                  </p>
                </Link>
              ))}
            </nav>
          </section>

        </div>
      )}
    </>
  );
}
