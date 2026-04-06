import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { captureRefCode } from "@/lib/localStorage";
import { CalculatorProvider } from "@/hooks/useCalculatorState";
import { ProjectProvider } from "@/hooks/useProject";
import { CalculatorLayout } from "@/components/calculator/CalculatorLayout";
import { SEO } from "@/components/SEO";

const Index = () => {
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
        title="Free Concrete Foundation Calculator"
        description="Instantly calculate concrete yardage for footings, slabs, walls, grade beams, pier pads, and more. Free tool built for concrete contractors."
        canonical="https://foundationcalculator.com/"
      />
      <CalculatorProvider>
      <ProjectProvider>
        <CalculatorLayout />
      </ProjectProvider>
    </CalculatorProvider>
  );
};

export default Index;
