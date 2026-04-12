import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { CalculatorProvider } from "@/hooks/useCalculatorState";
import { ProjectProvider } from "@/hooks/useProject";
import { CalculatorLayout } from "@/components/calculator/CalculatorLayout";
import { Button } from "@/components/ui/button";

const ConcreteWallCalculator = () => {
  return (
    <>
      <SEO
        title="Concrete Wall Calculator | Free Foundation Wall Estimator"
        description="Calculate concrete yardage for foundation walls, stem walls, and poured concrete walls. Enter height, thickness, and length for instant estimates."
        canonical="https://foundationcalculator.com/concrete-wall-calculator"
      />

      <div className="min-h-screen bg-background text-foreground">
        {/* Intro */}
        <section className="mx-auto max-w-4xl px-4 pt-10 pb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Concrete Wall Calculator
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Estimate concrete volume for poured foundation walls, stem walls, and retaining walls. Enter wall height, thickness, and total linear footage to get accurate cubic yard totals for your pour.
          </p>
        </section>

        {/* Calculator */}
        <section className="pb-8">
          <CalculatorProvider>
            <ProjectProvider>
              <CalculatorLayout />
            </ProjectProvider>
          </CalculatorProvider>
        </section>

        {/* Example */}
        <section className="mx-auto max-w-3xl px-4 pb-12">
          <div className="rounded-lg border border-border/60 bg-card p-6">
            <h2 className="mb-3 text-lg font-semibold">Example: Basement Foundation Wall</h2>
            <p className="text-muted-foreground text-sm">
              A standard 8-foot tall × 10-inch thick basement wall running 140 linear feet requires approximately <strong className="text-foreground">34.6 cubic yards</strong> of concrete. Adding 5% waste brings the order to about <strong className="text-foreground">36.3 yards</strong>. Use the calculator above to dial in your exact wall dimensions.
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

export default ConcreteWallCalculator;
