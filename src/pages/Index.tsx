import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { captureRefCode } from "@/lib/localStorage";
import { CalculatorProvider } from "@/hooks/useCalculatorState";
import { CalculatorLayout } from "@/components/calculator/CalculatorLayout";

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
    <CalculatorProvider>
      <CalculatorLayout />
    </CalculatorProvider>
  );
};

export default Index;
