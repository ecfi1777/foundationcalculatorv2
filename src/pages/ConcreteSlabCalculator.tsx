import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { CalculatorProvider, TabInitializer } from "@/hooks/useCalculatorState";
import { ProjectProvider } from "@/hooks/useProject";
import { CalculatorLayout } from "@/components/calculator/CalculatorLayout";
import { Button } from "@/components/ui/button";

const ConcreteSlabCalculator = () => {
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
        <section className="pb-8">
          <CalculatorProvider>
            <TabInitializer tab="slab" />
            <ProjectProvider>
              <CalculatorLayout />
            </ProjectProvider>
          </CalculatorProvider>
        </section>

        {/* Example */}
        <section className="mx-auto max-w-3xl px-4 pb-12">
          <div className="rounded-lg border border-border/60 bg-card p-6">
            <h2 className="mb-3 text-lg font-semibold">Example: Garage Slab</h2>
            <p className="text-muted-foreground text-sm">
              A typical 24′ × 30′ garage slab poured at 4 inches thick requires approximately <strong className="text-foreground">8.9 cubic yards</strong> of concrete. Adding 5% waste brings the order to about <strong className="text-foreground">9.3 yards</strong>. Use the calculator above to enter your exact dimensions and get a precise estimate for your pour.
            </p>
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
