import { useState } from "react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { AppFooter } from "@/components/calculator/AppFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calcSlabSection } from "@/lib/calculations";
import type { SlabSectionResult } from "@/lib/calculations";

const WASTE_PCT = 10;

const DEFAULT_RESULT: SlabSectionResult = {
  sqft: 0,
  volumeCy: 0,
  volumeWithWasteCy: 0,
};

export default function ConcreteCalculator() {
  const [lengthFt, setLengthFt] = useState("");
  const [widthFt, setWidthFt] = useState("");
  const [thicknessIn, setThicknessIn] = useState("4");
  const [result, setResult] = useState(DEFAULT_RESULT);
  const [calculated, setCalculated] = useState(false);

  const handleCalculate = () => {
    const l = parseFloat(lengthFt) || 0;
    const w = parseFloat(widthFt) || 0;
    const t = parseFloat(thicknessIn) || 4;
    const r = calcSlabSection({
      lengthFt: l,
      lengthIn: 0,
      widthFt: w,
      widthIn: 0,
      thicknessIn: t,
      wastePct: WASTE_PCT,
    });
    setResult(r);
    setCalculated(true);
  };

  const thicknessFt = (parseFloat(thicknessIn) || 4) / 12;
  const l = parseFloat(lengthFt) || 0;
  const w = parseFloat(widthFt) || 0;
  const formulaDisplay =
    l > 0 && w > 0
      ? `${l} × ${w} × ${thicknessFt.toFixed(3)} ÷ 27 = ${result.volumeCy.toFixed(2)} cu yd`
      : "Length × Width × (Thickness ÷ 12) ÷ 27 = Cubic Yards";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SEO
        title="Concrete Calculator — How Many Cubic Yards Do I Need?"
        description="Free concrete calculator. Enter length, width, and thickness to get cubic yards instantly. Includes 10% waste factor. Used by contractors and homeowners."
        canonical="https://foundationcalculator.com/concrete-calculator"
      />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-10 space-y-12">
        {/* ── Page Header ── */}
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Concrete Calculator
        </h1>

        <p className="text-muted-foreground text-lg max-w-2xl">
          Enter your dimensions. Get cubic yards instantly — formula shown,
          10% waste factor included.
        </p>

        {/* ── Calculator Card ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Slab Calculator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Inputs */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="length">Length (ft)</Label>
                <Input
                  id="length"
                  type="number"
                  inputMode="decimal"
                  placeholder="20"
                  value={lengthFt}
                  onChange={(e) => setLengthFt(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="width">Width (ft)</Label>
                <Input
                  id="width"
                  type="number"
                  inputMode="decimal"
                  placeholder="20"
                  value={widthFt}
                  onChange={(e) => setWidthFt(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="thickness">Thickness (in)</Label>
                <Input
                  id="thickness"
                  type="number"
                  inputMode="decimal"
                  placeholder="4"
                  value={thicknessIn}
                  onChange={(e) => setThicknessIn(e.target.value)}
                />
              </div>
            </div>

            {/* Calculate Button */}
            <Button className="w-full" size="lg" onClick={handleCalculate}>
              Calculate
            </Button>

            {/* Formula Strip */}
            <p className="text-sm text-muted-foreground font-mono text-center bg-muted rounded-md px-3 py-2">
              {formulaDisplay}
            </p>

            {/* Results */}
            {calculated && (
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Square Feet</p>
                  <p className="text-2xl font-bold text-foreground">
                    {result.sqft.toFixed(0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cubic Yards</p>
                  <p className="text-2xl font-bold text-foreground">
                    {result.volumeCy.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">With 10% Waste</p>
                  <p className="text-2xl font-bold text-primary">
                    {result.volumeWithWasteCy.toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            {/* CTA */}
            {calculated && (
              <div className="flex items-center justify-between bg-muted rounded-lg p-4">
                <div>
                  <p className="font-medium text-foreground">
                    Want to save these quantities?
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Create a free account to save your project, export a PDF,
                    and track multiple pours.
                  </p>
                </div>
                <Button asChild variant="default" size="sm">
                  <Link to="/auth">Save Your Project →</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Field Notes ── */}
        <section className="prose prose-neutral dark:prose-invert max-w-none space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Field Notes from 20 Years in Foundation Work
          </h2>

          <p className="text-muted-foreground">
            The formula is simple:{" "}
            <strong>Length × Width × Thickness (in feet) ÷ 27 = cubic yards.</strong>{" "}
            That converts cubic feet to cubic yards, which is how ready-mix
            concrete is sold. Thickness in inches needs to be divided by 12 first
            — a 4-inch slab is 0.333 feet thick.
          </p>

          <p className="text-muted-foreground">
            <strong>Always order 10% extra.</strong> Subgrades are never
            perfectly level, forms flex slightly, and concrete doesn't get
            delivered twice on short notice. The 10% waste factor in this
            calculator is the standard every experienced contractor uses.
          </p>

          <p className="text-muted-foreground">
            <strong>Standard residential slabs run 4 inches thick.</strong>{" "}
            Garage floors and driveways where heavy trucks will park should be{" "}
            <em>5–6 inches</em>. House footings typically run{" "}
            <em>20–24 inches wide</em> and <em>10–12 inches deep</em> — deeper
            in frost-prone areas.
          </p>
        </section>

        {/* ── FAQ ── */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">
            Concrete Calculator — Common Questions
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-foreground">
                How many cubic yards of concrete do I need for a 10×10 slab?
              </h3>
              <p className="text-muted-foreground mt-1">
                A 10×10 slab at 4 inches thick requires 1.24 cubic yards of
                concrete before waste. With the standard 10% waste factor,
                order 1.36 cubic yards. Use the calculator above to adjust for
                your exact thickness.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-foreground">
                How do I convert cubic feet to cubic yards?
              </h3>
              <p className="text-muted-foreground mt-1">
                Divide cubic feet by 27. There are 27 cubic feet in one cubic
                yard (3 ft × 3 ft × 3 ft = 27 ft³). Concrete is always ordered
                in cubic yards from a ready-mix plant.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-foreground">
                How much does a cubic yard of concrete weigh?
              </h3>
              <p className="text-muted-foreground mt-1">
                A cubic yard of standard concrete weighs approximately 4,000 lbs
                (2 tons). This matters when estimating truck loads and site
                access for your pour.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-foreground">
                Should I order bags or ready-mix concrete?
              </h3>
              <p className="text-muted-foreground mt-1">
                For anything over 1 cubic yard, call a ready-mix plant. Mixing
                bags by hand for large pours leads to inconsistent results and
                far more labor than it's worth. Bags are best for fence posts,
                small repairs, and pours under half a yard.
              </p>
            </div>
          </div>
        </section>

        {/* ── Related Calculators ── */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            More Concrete Calculators
          </h2>
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Slab Calculator", href: "/concrete-slab-calculator" },
              { label: "Footing Calculator", href: "/concrete-footing-calculator" },
              { label: "Wall Calculator", href: "/concrete-wall-calculator" },
              { label: "Rebar Calculator", href: "/rebar-calculator" },
            ].map(({ label, href }) => (
              <Link
                key={href}
                to={href}
                className="rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </section>
      </main>

      <AppFooter />
    </div>
  );
}
