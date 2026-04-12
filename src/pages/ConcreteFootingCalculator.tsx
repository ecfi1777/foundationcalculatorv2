import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { CalculatorProvider } from "@/hooks/useCalculatorState";
import { ProjectProvider } from "@/hooks/useProject";
import { CalculatorLayout } from "@/components/calculator/CalculatorLayout";
import { Button } from "@/components/ui/button";

const ConcreteFootingCalculator = () => {
  return (
    <>
      <SEO
        title="Concrete Footing Calculator | Free Foundation Estimator"
        description="Calculate concrete yardage for continuous footings, spread footings, and foundation pads. Enter dimensions in feet and inches for instant estimates."
        canonical="https://foundationcalculator.com/concrete-footing-calculator"
      />

      <div className="min-h-screen bg-background text-foreground">
        {/* Intro */}
        <section className="mx-auto max-w-4xl px-4 pt-10 pb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Concrete Footing Calculator
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Estimate concrete volume for continuous strip footings, spread footings, and column pads. Enter your footing width, depth, and total linear footage to get accurate cubic yard totals — built for residential and commercial foundation work.
          </p>
        </section>

        {/* Calculator */}
        <section className="pb-8">
          <CalculatorProvider initialTab="footing" hydrateFromStorage={false}>
            <ProjectProvider clearCalculatorOnSignOut={false}>
              <CalculatorLayout />
            </ProjectProvider>
          </CalculatorProvider>
        </section>

        {/* Example */}
        <section className="mx-auto max-w-3xl px-4 pb-12">
          <div className="rounded-lg border border-border/60 bg-card p-6">
            <h2 className="mb-3 text-lg font-semibold">Example: Residential Strip Footing</h2>
            <p className="text-muted-foreground text-sm">
              A typical residential footing — 20 inches wide × 10 inches deep — running 160 linear feet around a house perimeter requires approximately <strong className="text-foreground">9.9 cubic yards</strong> of concrete. Adding 5% waste brings the order to about <strong className="text-foreground">10.4 yards</strong>. Enter your exact dimensions above for a precise estimate.
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

export default ConcreteFootingCalculator;
