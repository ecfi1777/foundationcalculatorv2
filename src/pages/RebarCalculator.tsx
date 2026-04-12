import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";

const RebarCalculator = () => {
  return (
    <>
      <SEO
        title="Rebar Calculator | Coming Soon"
        description="A dedicated rebar calculator for estimating linear footage, bar counts, and lap splice lengths. Coming soon."
        canonical="https://foundationcalculator.com/rebar-calculator"
      />

      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Rebar Calculator
        </h1>
        <p className="mt-4 max-w-lg text-muted-foreground">
          A dedicated rebar estimating tool is coming soon. In the meantime, you can calculate rebar as part of any footing, wall, or slab area using our main calculator.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button asChild size="lg">
            <Link to="/app">Open Calculator</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/concrete-calculator">← All calculator types</Link>
          </Button>
        </div>
      </div>
    </>
  );
};

export default RebarCalculator;
