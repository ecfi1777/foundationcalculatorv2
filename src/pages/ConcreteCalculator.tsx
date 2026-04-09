import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { saveSeoTakeoff } from "@/lib/localStorage";
import { SEO } from "@/components/SEO";
import { AppFooter } from "@/components/calculator/AppFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { TakeoffPanel } from "@/components/seo/TakeoffPanel";
import type { TakeoffEntry } from "@/components/seo/TakeoffPanel";
import {
  calcSlabSection,
  calcFooting,
  calcWall,
} from "@/lib/calculations";
import type {
  SlabSectionResult,
  FootingResult,
  WallResult,
} from "@/lib/calculations";

type CalcTab = "slab" | "footing" | "wall";

const TABS: { id: CalcTab; label: string }[] = [
  { id: "slab",    label: "Slab"    },
  { id: "footing", label: "Footing" },
  { id: "wall",    label: "Wall"    },
  
];

export default function ConcreteCalculator() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<CalcTab>("slab");
  const [calculated, setCalculated] = useState(false);
  const [entries, setEntries] = useState<TakeoffEntry[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // ── Slab state ──
  const [slabL,     setSlabL]     = useState("");
  const [slabW,     setSlabW]     = useState("");
  const [slabT,     setSlabT]     = useState("4");
  const [slabWaste, setSlabWaste] = useState("10");
  const [slabResult, setSlabResult] = useState<SlabSectionResult>({
    sqft: 0, volumeCy: 0, volumeWithWasteCy: 0,
  });

  // ── Footing state ──
  const [footLf,    setFootLf]    = useState("");
  const [footW,     setFootW]     = useState("24");
  const [footD,     setFootD]     = useState("12");
  const [footWaste, setFootWaste] = useState("10");
  const [footResult, setFootResult] = useState<FootingResult>({
    footingVolumeCy: 0, wallVolumeCy: null,
    totalVolumeCy: 0, totalWithWasteCy: 0,
  });

  // ── Wall state ──
  const [wallLf,    setWallLf]    = useState("");
  const [wallH,     setWallH]     = useState("");
  const [wallT,     setWallT]     = useState("8");
  const [wallWaste, setWallWaste] = useState("10");
  const [wallResult, setWallResult] = useState<WallResult>({
    volumeCy: 0, volumeWithWasteCy: 0,
  });


  const handleTabChange = (tab: CalcTab) => {
    setActiveTab(tab);
    setCalculated(false);
  };

  const handleCalculate = () => {
    let newEntry: TakeoffEntry | null = null;

    if (activeTab === "slab") {
      const r = calcSlabSection({
        lengthFt:    parseFloat(slabL)     || 0,
        lengthIn:    0,
        widthFt:     parseFloat(slabW)     || 0,
        widthIn:     0,
        thicknessIn: parseFloat(slabT)     || 4,
        wastePct:    parseFloat(slabWaste) || 0,
      });
      if (r.volumeCy > 0) {
        newEntry = {
          id: editingId ?? `${Date.now()}-${Math.random()}`,
          tab: "slab",
          label: `${slabL} × ${slabW} Slab, ${slabT}in`,
          name: "",
          volumeCy: r.volumeCy,
          withWasteCy: r.volumeWithWasteCy,
          wastePct: parseFloat(slabWaste) || 0,
          inputs: { slabL, slabW, slabT, slabWaste },
        };
      }
      setSlabResult(r);

    } else if (activeTab === "footing") {
      const r = calcFooting({
        linearFt: parseFloat(footLf)    || 0,
        widthIn:  parseFloat(footW)     || 24,
        depthIn:  parseFloat(footD)     || 12,
        wastePct: parseFloat(footWaste) || 0,
      });
      if (r.totalVolumeCy > 0) {
        newEntry = {
          id: editingId ?? `${Date.now()}-${Math.random()}`,
          tab: "footing",
          label: `${footLf} LF Footing, ${footW}×${footD}in`,
          name: "",
          volumeCy: r.totalVolumeCy,
          withWasteCy: r.totalWithWasteCy,
          wastePct: parseFloat(footWaste) || 0,
          inputs: { footLf, footW, footD, footWaste },
        };
      }
      setFootResult(r);

    } else if (activeTab === "wall") {
      const r = calcWall({
        linearFt:    parseFloat(wallLf)    || 0,
        heightIn:    parseFloat(wallH)     || 0,
        thicknessIn: parseFloat(wallT)     || 8,
        wastePct:    parseFloat(wallWaste) || 0,
      });
      if (r.volumeCy > 0) {
        newEntry = {
          id: editingId ?? `${Date.now()}-${Math.random()}`,
          tab: "wall",
          label: `${wallLf} LF Wall, ${wallH}×${wallT}in`,
          name: "",
          volumeCy: r.volumeCy,
          withWasteCy: r.volumeWithWasteCy,
          wastePct: parseFloat(wallWaste) || 0,
          inputs: { wallLf, wallH, wallT, wallWaste },
        };
      }
      setWallResult(r);

    }

    if (newEntry) {
      if (editingId) {
        setEntries(prev =>
          prev.map(e =>
            e.id === editingId
              ? { ...newEntry!, name: e.name }
              : e
          )
        );
        setEditingId(null);
      } else {
        setEntries(prev => [...prev, newEntry!]);
      }
    }

    setCalculated(true);
  };

  const handleRemoveEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const handleClearEntries = () => {
    setEntries([]);
  };

  const handleEditEntry = (entry: TakeoffEntry) => {
    setActiveTab(entry.tab);
    setCalculated(false);

    if (entry.tab === "slab") {
      setSlabL(entry.inputs.slabL ?? "");
      setSlabW(entry.inputs.slabW ?? "");
      setSlabT(entry.inputs.slabT ?? "4");
      setSlabWaste(entry.inputs.slabWaste ?? "10");
    } else if (entry.tab === "footing") {
      setFootLf(entry.inputs.footLf ?? "");
      setFootW(entry.inputs.footW ?? "24");
      setFootD(entry.inputs.footD ?? "12");
      setFootWaste(entry.inputs.footWaste ?? "10");
    } else if (entry.tab === "wall") {
      setWallLf(entry.inputs.wallLf ?? "");
      setWallH(entry.inputs.wallH ?? "");
      setWallT(entry.inputs.wallT ?? "8");
      setWallWaste(entry.inputs.wallWaste ?? "10");
    }

    setEditingId(entry.id);

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setCalculated(false);
  };

  const handleRenameEntry = (id: string, name: string) => {
    setEntries(prev =>
      prev.map(e => e.id === id ? { ...e, name } : e)
    );
  };

  const handleSave = () => {
    if (entries.length > 0) {
      saveSeoTakeoff(entries);
    }
    navigate("/auth");
  };

  // ── Formula display per tab ──
  const formulaMap: Record<CalcTab, string> = {
    slab:    "Length × Width × (Thickness ÷ 12) ÷ 27 = Cubic Yards",
    footing: "Linear Ft × (Width ÷ 12) × (Depth ÷ 12) ÷ 27 = Cubic Yards",
    wall:    "Linear Ft × (Height ÷ 12) × (Thickness ÷ 12) ÷ 27 = Cubic Yards",
    
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SEO
        title="Concrete Calculator — Cubic Yards for Slabs, Footings & Walls"
        description="Enter your dimensions. Get cubic yards instantly — formula shown, waste factor adjustable."
        canonical="/concrete-calculator"
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-10">
        <div className={cn("flex gap-8", isMobile ? "flex-col" : "flex-row")}>

          {/* LEFT: Calculator column */}
          <div className="flex-1 space-y-10 min-w-0">
            {/* Page Header */}
            <header className="space-y-2 text-center">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Concrete Calculator
              </h1>
              <p className="text-muted-foreground text-base max-w-xl mx-auto">
                Enter your dimensions — each calculation accumulates in your takeoff panel.
              </p>
            </header>

            {/* Calculator Card */}
            <Card className="border border-border shadow-sm">
              {/* Tab Bar */}
              <div className="flex border-b border-border">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={cn(
                      "flex-1 py-3 text-sm font-medium transition-colors",
                      activeTab === tab.id
                        ? "text-primary border-b-2 border-primary -mb-px"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <CardContent className="p-6 space-y-6">
                {/* ── Slab Inputs ── */}
                {activeTab === "slab" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="slabL">Length (ft)</Label>
                      <Input id="slabL" type="number" inputMode="decimal" min="0" value={slabL}
                        onChange={(e) => setSlabL(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="slabW">Width (ft)</Label>
                      <Input id="slabW" type="number" inputMode="decimal" min="0" value={slabW}
                        onChange={(e) => setSlabW(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="slabT">Thickness (in)</Label>
                      <Input id="slabT" type="number" inputMode="decimal" min="0" value={slabT}
                        onChange={(e) => setSlabT(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="slabWaste">Waste (%)</Label>
                      <Input id="slabWaste" type="number" inputMode="decimal" min="0" value={slabWaste}
                        onChange={(e) => setSlabWaste(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* ── Footing Inputs ── */}
                {activeTab === "footing" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="footLf">Linear Feet</Label>
                      <Input id="footLf" type="number" inputMode="decimal" min="0" value={footLf}
                        onChange={(e) => setFootLf(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="footW">Width (in)</Label>
                      <Input id="footW" type="number" inputMode="decimal" min="0" value={footW}
                        onChange={(e) => setFootW(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="footD">Depth (in)</Label>
                      <Input id="footD" type="number" inputMode="decimal" min="0" value={footD}
                        onChange={(e) => setFootD(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="footWaste">Waste (%)</Label>
                      <Input id="footWaste" type="number" inputMode="decimal" min="0" value={footWaste}
                        onChange={(e) => setFootWaste(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* ── Wall Inputs ── */}
                {activeTab === "wall" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="wallLf">Linear Feet</Label>
                      <Input id="wallLf" type="number" inputMode="decimal" min="0" value={wallLf}
                        onChange={(e) => setWallLf(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="wallH">Height (in)</Label>
                      <Input id="wallH" type="number" inputMode="decimal" min="0" value={wallH}
                        onChange={(e) => setWallH(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="wallT">Thickness (in)</Label>
                      <Input id="wallT" type="number" inputMode="decimal" min="0" value={wallT}
                        onChange={(e) => setWallT(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="wallWaste">Waste (%)</Label>
                      <Input id="wallWaste" type="number" inputMode="decimal" min="0" value={wallWaste}
                        onChange={(e) => setWallWaste(e.target.value)}
                      />
                    </div>
                  </div>
                )}


                {/* Formula Strip */}
                <p className="text-xs text-muted-foreground text-center">
                  {formulaMap[activeTab]}
                </p>

                {/* Calculate Button */}
                <Button className="w-full" size="lg" onClick={handleCalculate}>
                  {editingId ? "Update Entry →" : "Add to Takeoff →"}
                </Button>

                {editingId && (
                  <button
                    type="button"
                    className="w-full text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
                    onClick={handleCancelEdit}
                  >
                    Cancel edit
                  </button>
                )}

                {/* Confirmation flash */}
                {calculated && !editingId && (
                  <p className="text-sm text-center text-primary font-medium">
                    ✓ Added to your takeoff
                    {isMobile && entries.length > 0 && (
                      <span className="text-muted-foreground"> — scroll down to see quantities</span>
                    )}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* ── Field Notes ── */}
            <section className="prose prose-sm dark:prose-invert max-w-none">
              <h2 className="text-xl font-semibold text-foreground">
                Field Notes from 20 Years in Foundation Work
              </h2>
              <p>
                The formula is simple:{" "}
                <strong>
                  Length × Width × Thickness (in feet) ÷ 27 = cubic yards.
                </strong>{" "}
                That converts cubic feet to cubic yards, which is how ready-mix
                concrete is sold. Thickness in inches needs to be divided by 12
                first — a 4-inch slab is 0.333 feet thick.
              </p>
              <p>
                Most contractors order <strong>10% extra</strong> as a waste
                factor. Subgrades are never perfectly level, forms flex slightly,
                and concrete doesn't get delivered twice on short notice. You can
                adjust the waste percentage in the calculator above to match your
                jobsite conditions.
              </p>
              <p>
                Standard residential slabs run 4 inches thick.{" "}
                Garage floors and driveways where heavy trucks will park should be
                5–6 inches. House footings typically run{" "}
                <strong>20–24 inches wide</strong> and <strong>10–12 inches deep</strong> — deeper
                in frost-prone areas.
              </p>
            </section>

            {/* ── FAQ ── */}
            <section className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground">
                Concrete Calculator — Common Questions
              </h2>
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-foreground">
                    How many cubic yards of concrete do I need for a 10×10 slab?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    A 10×10 slab at 4 inches thick requires 1.24 cubic yards before
                    waste. With a 10% waste factor, order 1.36 cubic yards. Use the
                    calculator above to adjust for your exact thickness and waste
                    preference.
                  </p>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-foreground">
                    How do I convert cubic feet to cubic yards?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Divide cubic feet by 27. There are 27 cubic feet in one cubic
                    yard (3 ft × 3 ft × 3 ft = 27 ft³). Concrete is always ordered
                    in cubic yards from a ready-mix plant.
                  </p>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-foreground">
                    How much does a cubic yard of concrete weigh?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    A cubic yard of standard concrete weighs approximately 4,000 lbs
                    (2 tons). This matters when estimating truck loads and site
                    access for your pour.
                  </p>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-foreground">
                    Should I order bags or ready-mix concrete?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    For anything over 1 cubic yard, call a ready-mix plant. Mixing
                    bags by hand for large pours leads to inconsistent results and
                    far more labor than it's worth. Bags are best for fence posts,
                    small repairs, and pours under half a yard.
                  </p>
                </div>
              </div>
            </section>

            {/* ── Related Calculators ── */}
            <nav className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">More Concrete Calculators</h2>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Slab Calculator",    href: "/concrete-slab-calculator"    },
                  { label: "Footing Calculator", href: "/concrete-footing-calculator" },
                  { label: "Wall Calculator",    href: "/concrete-wall-calculator"    },
                  
                ].map(({ label, href }) => (
                  <Link key={href} to={href} className="text-sm text-primary underline underline-offset-2 hover:text-primary/80">
                    {label}
                  </Link>
                ))}
              </div>
            </nav>
          </div>

          {/* RIGHT: TakeoffPanel */}
          {!isMobile ? (
            <div className="w-[380px] shrink-0 sticky top-0 self-start h-[calc(100vh-5rem)] rounded-lg border border-border bg-card shadow-sm overflow-hidden">
              <TakeoffPanel
                entries={entries}
                onRemove={handleRemoveEntry}
                onClear={handleClearEntries}
                onEdit={handleEditEntry}
                onRename={handleRenameEntry}
                onSave={handleSave}
              />
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
              <TakeoffPanel
                entries={entries}
                onRemove={handleRemoveEntry}
                onClear={handleClearEntries}
                onEdit={handleEditEntry}
                onRename={handleRenameEntry}
                onSave={handleSave}
              />
            </div>
          )}
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
