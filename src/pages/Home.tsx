import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calculator, Layers, Ruler, BrickWall, CheckCircle2 } from "lucide-react";

const calculatorLinks = [
  {
    title: "Concrete Calculator",
    description: "All-in-one foundation calculator for any pour type.",
    href: "/concrete-calculator",
    icon: Calculator,
  },
  {
    title: "Slab Calculator",
    description: "Calculate yardage for slabs, patios, and flatwork.",
    href: "/concrete-slab-calculator",
    icon: Layers,
  },
  {
    title: "Footing Calculator",
    description: "Continuous and spread footing volume estimates.",
    href: "/concrete-footing-calculator",
    icon: Ruler,
  },
  {
    title: "Wall Calculator",
    description: "Foundation wall and stem wall concrete volumes.",
    href: "/concrete-wall-calculator",
    icon: BrickWall,
  },
];

const benefits = [
  "Multiple areas per project — footings, slabs, walls, and more in one estimate",
  "Save and organize projects for easy reference on the job site",
  "Native feet-and-inches input — no decimal conversions needed",
  "Export estimates to PDF or CSV for bids and submittals",
];

const Home = () => {
  return (
    <>
      <SEO
        title="Free Concrete Foundation Calculator"
        description="Instantly calculate concrete yardage for footings, slabs, walls, grade beams, pier pads, and more. Free tool built for concrete contractors."
        canonical="https://foundationcalculator.com/"
      />

      <div className="min-h-screen bg-background text-foreground">
        {/* Hero */}
        <section className="flex flex-col items-center justify-center px-4 pt-20 pb-16 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Concrete Calculator Built for Contractors
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            The fastest way to estimate foundation yardage. Calculate footings, slabs, walls, grade beams, pier pads, and more — free.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/app">Start Calculator</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/concrete-calculator">View Calculator</Link>
            </Button>
          </div>
        </section>

        {/* Calculator Links Grid */}
        <section className="mx-auto max-w-5xl px-4 pb-16">
          <h2 className="mb-6 text-center text-2xl font-semibold">Calculator Tools</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {calculatorLinks.map((item) => (
              <Link key={item.href} to={item.href} className="group">
                <Card className="h-full transition-colors group-hover:border-primary/50">
                  <CardHeader>
                    <item.icon className="mb-2 h-6 w-6 text-primary" />
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Why This Tool Exists */}
        <section className="mx-auto max-w-3xl px-4 pb-16 text-center">
          <h2 className="mb-4 text-2xl font-semibold">Why This Tool Exists</h2>
          <p className="text-muted-foreground">
            Most concrete calculators only handle one area at a time. Real foundation jobs have multiple footings, walls, and slabs — each with different dimensions. This tool lets you calculate every area in one place, so your estimate matches the actual pour.
          </p>
        </section>

        {/* Contractor Benefits */}
        <section className="mx-auto max-w-3xl px-4 pb-16">
          <h2 className="mb-6 text-center text-2xl font-semibold">Built for Real Job Sites</h2>
          <ul className="space-y-3">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span className="text-muted-foreground">{benefit}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Trust */}
        <section className="mx-auto max-w-3xl px-4 pb-16 text-center">
          <h2 className="mb-4 text-2xl font-semibold">Trusted by Contractors</h2>
          <p className="text-muted-foreground">
            Built by Eastern Concrete Foundation and used on real job sites every day. This isn't a toy calculator — it's a professional estimating tool shaped by years of field experience.
          </p>
        </section>

        {/* Screenshot */}
        <section className="mx-auto max-w-4xl px-4 pb-16">
          <div className="overflow-hidden rounded-lg border border-border/60">
            <img
              src="/og-image.png"
              alt="Screenshot of the concrete foundation calculator interface"
              className="w-full"
              loading="lazy"
            />
          </div>
        </section>

        {/* Final CTA */}
        <section className="flex flex-col items-center px-4 pb-20 text-center">
          <h2 className="mb-4 text-2xl font-semibold">Ready to Estimate?</h2>
          <Button asChild size="lg">
            <Link to="/app">Start Calculator</Link>
          </Button>
        </section>
      </div>
    </>
  );
};

export default Home;
