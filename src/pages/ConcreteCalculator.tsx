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

const projectAreas = [
  { name: "Basement Footing", measure: "200 LF", yards: "6.58 yd³" },
  { name: "Frost Footing", measure: "35 LF", yards: "3.24 yd³" },
  { name: "Foundation Walls", measure: "235 LF", yards: "46.42 yd³" },
  { name: "Basement Slab", measure: "3,375 SF", yards: "41.67 yd³" },
  { name: "Detached Garage", measure: "120 LF", yards: "4.54 yd³" },
];
const projectTotal = "103.11 yd³";

const relatedCalculators = [
  { title: "Concrete Slab Calculator", description: "Calculate slab yardage with adjustable thickness across multiple sections — driveways, garage floors, patios, and basements.", href: "/concrete-slab-calculator" },
  { title: "Concrete Footing Calculator", description: "Calculate footing concrete from linear footage and footing dimensions — continuous footings, frost walls, and stepped sections.", href: "/concrete-footing-calculator" },
  { title: "Concrete Wall Calculator", description: "Calculate wall concrete for foundation walls and retaining walls — measured by segment with adjustable heights and thicknesses.", href: "/concrete-wall-calculator" },
  { title: "Rebar Calculator", description: "Calculate rebar quantities for slabs, footings, and walls — includes spacing, overlap, and layout options.", href: "/rebar-calculator" },
];

const takeoffTools = [
  {
    name: "Bluebeam",
    bestFor: "Drawing-based takeoffs with markup and measurement tools.",
    thisTool: "Faster when you already have dimensions — no plans required.",
  },
  {
    name: "PlanSwift",
    bestFor: "Detailed plan takeoffs with material and labor estimating.",
    thisTool: "Better for quick field calcs when you need a number without opening a full project.",
  },
  {
    name: "Stack",
    bestFor: "Cloud-based takeoff and estimating for larger teams.",
    thisTool: "Simpler to use, easier to adjust — works for contractors handling their own concrete numbers.",
  },
];

const mistakeItems = [
  { title: "Missing a section", desc: "You calculate the slab but forget the footing under it." },
  { title: "Double-counting", desc: "Two people run the same area and both add it to the total." },
  { title: "Lost notes", desc: "Dimensions written on scrap paper or buried in texts." },
  { title: "Changes break totals", desc: "You update one area but forget to re-add the rest." },
];

const contractorNotes = [
  "Footings vary across the same job — corners, T-sections, and frost areas are rarely the same size.",
  "Garage slabs are almost always thicker than basement slabs. Don't assume 4 inches everywhere.",
  "Townhouse jobs can mean three or four pours in one day, each with different dimensions.",
  "The hardest part isn't the math — it's keeping everything organized when something changes.",
  "Subgrade is never perfectly level. Budget waste into every pour, especially on sloped lots.",
  "When a builder changes a wall height or adds a bump-out, every number downstream moves.",
  "If you're hand-adding totals from separate calculators, you will eventually miss something.",
];

const concreteFaqItems = [
  { q: "How do I calculate how much concrete I need?", a: "Multiply length × width × thickness (in feet), then divide by 27 to get cubic yards. This calculator does that math for you and lets you add waste." },
  { q: "How do I convert cubic feet to cubic yards?", a: "Divide cubic feet by 27. There are 27 cubic feet in one cubic yard." },
  { q: "Can I calculate multiple areas in one project?", a: "Yes. Add as many areas as you need — footings, slabs, walls — and the project total updates automatically." },
  { q: "What's the difference between this and a basic calculator?", a: "Basic calculators handle one area at a time. This tool lets you build a full project with named areas, different types, and a running total." },
  { q: "Can I use feet, inches, and fractions?", a: "Yes. Enter dimensions the way you measure — 8 feet 6-1/2 inches works just like you'd say it on the job." },
  { q: "Can I calculate footings, walls, and slabs together?", a: "Yes. Each area can be a different type. Add a footing, a wall, and a slab in the same project and see one combined total." },
  { q: "Is this meant to replace Bluebeam or PlanSwift?", a: "No. Those are full takeoff tools built for plans. This is faster when you already have dimensions and need a quick, accurate yardage number." },
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
          <p className="mt-2 text-sm text-muted-foreground text-center">
            Built for real foundation work — not just one-off calculations.
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
                Most concrete calculators handle one pour at a time. That works for a single slab — but real foundation jobs have footings, walls, and slabs at different sizes. When you're juggling multiple areas, one input box falls apart.
              </p>
              <p className="text-base text-muted-foreground text-center max-w-2xl mx-auto mt-2">
                When you're working on a real job, you shouldn't have to keep restarting your numbers just to make one change.
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
              A real job isn't one number — it's a set of areas that all roll into one total.
            </p>

            <Card className="max-w-lg mx-auto">
              <CardHeader className="pb-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Project</p>
                <CardTitle className="text-lg font-bold text-foreground">Smith Residence</CardTitle>
              </CardHeader>
              <CardContent className="space-y-0">
                {projectAreas.map((area, i) => (
                  <div
                    key={area.name}
                    className={`flex items-center justify-between py-2.5 ${i < projectAreas.length - 1 ? "border-b border-border" : ""}`}
                  >
                    <span className="text-sm font-medium text-foreground">{area.name}</span>
                    <span className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{area.measure}</span>
                      <span className="text-sm font-medium text-foreground">{area.yards}</span>
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-3 mt-2 border-t-2 border-border">
                  <span className="text-sm font-semibold text-foreground">Total</span>
                  <span className="text-sm font-semibold text-foreground">{projectTotal}</span>
                </div>
              </CardContent>
            </Card>

            <p className="text-sm text-muted-foreground text-center max-w-xl mx-auto">
              Instead of running each section separately and trying to keep track of it, everything stays organized in one place — and your total stays right as things change.
            </p>
          </section>

          {/* ── Section 4: Takeoff Software Comparison ── */}
          <section className="bg-muted/40 border-y border-border">
            <div className="max-w-5xl mx-auto px-4 py-12 sm:py-16 space-y-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center">
                Concrete Calculator vs Takeoff Software
              </h2>
              <p className="text-base text-muted-foreground text-center max-w-2xl mx-auto">
                Takeoff software like Bluebeam, PlanSwift, and Stack are full plan-based tools built for measuring drawings. This calculator is faster when you already have your dimensions and just need an accurate yardage number — in the field or at your desk.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {takeoffTools.map((tool) => (
                  <Card key={tool.name} className="bg-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-semibold text-foreground">{tool.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">Best for: </span>
                        {tool.bestFor}
                      </p>
                      <p className="text-sm text-foreground">
                        <span className="font-semibold text-primary">This tool: </span>
                        {tool.thisTool}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <p className="text-sm text-muted-foreground text-center max-w-xl mx-auto mt-6">
                If you already have full plans and need a complete takeoff, those tools make sense.
              </p>
              <p className="text-sm text-muted-foreground text-center max-w-xl mx-auto">
                But if you're working with real numbers in the field or making quick adjustments, they're slower than they need to be.
              </p>
              <p className="text-sm text-muted-foreground text-center max-w-xl mx-auto">
                That's where this tool fits.
              </p>
            </div>
          </section>

          {/* ── Section 5: Mistake Prevention ── */}
          <section className="max-w-5xl mx-auto px-4 py-12 sm:py-16 space-y-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center">
              Avoid Costly Concrete Mistakes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mistakeItems.map((item) => (
                <div key={item.title} className="rounded-lg border border-border bg-card p-4 space-y-1">
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground text-center max-w-xl mx-auto">
              Here's how it happens: you change a garage slab from 4″ to 5″ but forget to update your total. Now you're short 2 yards when the truck shows up — and concrete doesn't get delivered twice on short notice.
            </p>
            <p className="text-sm text-muted-foreground text-center max-w-xl mx-auto">
              This tool saves every area in one place. Edit one section without touching the rest. The total always reflects the current numbers — no re-adding, no spreadsheet.
            </p>
          </section>

          {/* ── Section 6: Contractor Insights ── */}
          <section className="bg-muted/40 border-y border-border">
            <div className="max-w-5xl mx-auto px-4 py-12 sm:py-16 space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center">
                Contractor Notes from the Field
              </h2>
              <div className="rounded-lg border border-border bg-card p-5 sm:p-6">
                <ul className="space-y-4">
                  {contractorNotes.map((note, i) => (
                    <li key={i} className="text-sm text-muted-foreground leading-relaxed flex items-start gap-2">
                      <span className="text-primary font-bold mt-0.5 shrink-0">•</span>
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* ── Section 7: FAQ (static) ── */}
          <section className="max-w-5xl mx-auto px-4 py-12 sm:py-16 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center">
              Concrete Calculator FAQ
            </h2>
            <div className="space-y-6 max-w-3xl mx-auto">
              {concreteFaqItems.map((item, i) => (
                <div key={i} className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">{item.q}</p>
                  <p className="text-sm text-muted-foreground">{item.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Section 8: Internal Links ── */}
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

          {/* ── Section 9: Feedback Link ── */}
          <section className="max-w-4xl mx-auto px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              Have an idea or something that could be improved?{" "}
              <a
                href="https://forms.example.com/feedback"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Send feedback
              </a>
            </p>
          </section>

        </div>
      )}
    </>
  );
}
