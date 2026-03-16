import { useIsMobile } from "@/hooks/use-mobile";
import { calculatorSections } from "@/data/calculatorHowItWorksData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const allLinks = [
  { slug: "global-rules", title: "Global Rules" },
  ...calculatorSections.map((s) => ({ slug: s.slug, title: s.title })),
  { slug: "faq", title: "FAQ" },
];

export function SectionNav() {
  const isMobile = useIsMobile();

  const scrollTo = (slug: string) => {
    const el = document.getElementById(slug);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (isMobile) {
    return (
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border py-2 px-4 -mx-4">
        <Select onValueChange={scrollTo}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Jump to section…" />
          </SelectTrigger>
          <SelectContent>
            {allLinks.map((l) => (
              <SelectItem key={l.slug} value={l.slug}>
                {l.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <nav className="sticky top-6 space-y-1">
      <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2 block">
        Contents
      </span>
      {allLinks.map((l) => (
        <button
          key={l.slug}
          onClick={() => scrollTo(l.slug)}
          className={cn(
            "block w-full text-left text-sm px-2 py-1.5 rounded-md transition-colors",
            "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          )}
        >
          {l.title}
        </button>
      ))}
    </nav>
  );
}
