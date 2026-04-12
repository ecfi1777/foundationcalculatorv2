import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { captureRefCode } from "@/lib/localStorage";
import { CalculatorProvider } from "@/hooks/useCalculatorState";
import { ProjectProvider } from "@/hooks/useProject";
import { CalculatorLayout } from "@/components/calculator/CalculatorLayout";
import { SEO } from "@/components/SEO";

const AppCalculator = () => {
  const { loading } = useAuth();

  useEffect(() => {
    captureRefCode();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Concrete Calculator"
        description="Calculate concrete yardage for footings, slabs, walls, grade beams, pier pads, and more."
        canonical="https://foundationcalculator.com/app"
        noIndex={true}
      />
      <CalculatorProvider>
        <ProjectProvider>
          <CalculatorLayout />
        </ProjectProvider>
      </CalculatorProvider>
    </>
  );
};

export default AppCalculator;
