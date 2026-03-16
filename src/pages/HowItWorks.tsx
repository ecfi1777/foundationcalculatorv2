import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft } from "lucide-react";
import { calculatorSections, faqItems } from "@/data/calculatorHowItWorksData";
import { GlobalRulesSection } from "@/components/how-it-works/GlobalRulesSection";
import { CalculatorSection } from "@/components/how-it-works/CalculatorSection";
import { FAQSection } from "@/components/how-it-works/FAQSection";
import { SectionNav } from "@/components/how-it-works/SectionNav";
import { AppFooter } from "@/components/calculator/AppFooter";

const DEFAULT_TITLE = "How Concrete Calculations Work | Foundation Calculator";
const DEFAULT_DESC =
  "Learn how concrete volume, rebar quantities, and stone base are calculated for footings, slabs, walls, and foundations. See the exact formulas used by the Total Foundation Calculator.";

export default function HowItWorks() {
  const { sectionSlug } = useParams<{ sectionSlug: string }>();

  const filtered = sectionSlug
    ? calculatorSections.filter((s) => s.slug === sectionSlug)
    : calculatorSections;

  const isSingle = !!sectionSlug && filtered.length === 1;
  const title = isSingle ? filtered[0].seoTitle : DEFAULT_TITLE;
  const description = isSingle ? filtered[0].seoDescription : DEFAULT_DESC;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`https://foundationcalculator.com/how-it-works${sectionSlug ? `/${sectionSlug}` : ""}`} />
        {!isSingle && (
          <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
        )}
      </Helmet>

      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold">
            {isSingle ? filtered[0].title : "How Concrete and Foundation Calculations Work"}
          </h1>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar — desktop only */}
          {!isSingle && (
            <aside className="hidden lg:block w-52 shrink-0">
              <SectionNav />
            </aside>
          )}

          {/* Main content */}
          <div className="flex-1 min-w-0 max-w-3xl space-y-12">
            {/* Mobile nav */}
            {!isSingle && (
              <div className="lg:hidden">
                <SectionNav />
              </div>
            )}

            {/* Global rules — only on main page */}
            {!isSingle && (
              <div id="global-rules" className="scroll-mt-24">
                <GlobalRulesSection />
              </div>
            )}

            {isSingle && sectionSlug && (
              <div className="text-sm">
                <Link to="/how-it-works" className="text-primary hover:underline">
                  ← View all calculators
                </Link>
              </div>
            )}

            {filtered.map((section) => (
              <CalculatorSection key={section.slug} section={section} />
            ))}

            {/* FAQ — only on main page */}
            {!isSingle && <FAQSection />}
          </div>
        </div>
      </div>

      <AppFooter />
    </div>
  );
}
