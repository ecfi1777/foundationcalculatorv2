import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { faqItems } from "@/data/calculatorHowItWorksData";

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="scroll-mt-24">
      <h2 className="text-2xl font-semibold tracking-tight mb-4">
        Common Concrete Calculation Questions
      </h2>
      <div className="space-y-2">
        {faqItems.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              className="rounded-lg border border-border bg-card"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-secondary/50 transition-colors rounded-lg"
              >
                {item.question}
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                    isOpen && "rotate-180"
                  )}
                />
              </button>
              {isOpen && (
                <div className="px-4 pb-4 text-sm text-muted-foreground">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
