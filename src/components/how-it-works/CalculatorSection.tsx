import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { CalculatorSection as SectionData } from "@/data/calculatorHowItWorksData";

interface Props {
  section: SectionData;
}

export function CalculatorSection({ section }: Props) {
  const isSteps = section.slug === "steps-stairs";

  return (
    <section id={section.slug} className="scroll-mt-24">
      <h2 className="text-2xl font-semibold tracking-tight mb-1">
        {section.title}
      </h2>
      {isSteps && (
        <Badge variant="secondary" className="mb-3">
          Slope-adjusted method
        </Badge>
      )}

      <p className="text-muted-foreground mb-6">{section.description}</p>

      {/* Inputs */}
      <Card className="border-border bg-card mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Inputs</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1">
            {section.inputs.map((inp) => (
              <li key={inp.name} className="text-sm">
                <span className="font-medium text-foreground">{inp.name}</span>
                <span className="text-muted-foreground"> — {inp.description}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Formula */}
      <Card className="border-border bg-card mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Formula</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap text-sm font-mono bg-secondary/50 rounded-md p-4 text-foreground overflow-x-auto">
            {section.formula}
          </pre>
        </CardContent>
      </Card>

      {/* Diagram placeholder */}
      <div className="mb-4 flex items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 py-12 text-sm text-muted-foreground">
        [ {section.diagramAlt} ]
      </div>

      {/* Worked Example */}
      <Card className="border-border bg-card mb-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Worked Example</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <span className="text-xs font-medium uppercase text-muted-foreground">Inputs</span>
            <p className="text-sm">{section.workedExample.inputs}</p>
          </div>
          <Separator />
          <div>
            <span className="text-xs font-medium uppercase text-muted-foreground">Calculation</span>
            <pre className="mt-1 whitespace-pre-wrap text-sm font-mono">
              {section.workedExample.steps}
            </pre>
          </div>
          <Separator />
          <div>
            <span className="text-xs font-medium uppercase text-muted-foreground">Result</span>
            <p className="text-sm font-semibold text-primary">
              {section.workedExample.result}
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
