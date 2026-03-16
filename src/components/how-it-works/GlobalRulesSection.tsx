import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { globalRules } from "@/data/calculatorHowItWorksData";

export function GlobalRulesSection() {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-xl">Global Calculation Rules</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {globalRules.map((rule, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {rule}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
