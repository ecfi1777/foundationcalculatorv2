export interface SectionInput {
  name: string;
  description: string;
}

export interface WorkedExample {
  inputs: string;
  steps: string;
  result: string;
}

export interface CalculatorSection {
  slug: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  description: string;
  inputs: SectionInput[];
  formula: string;
  diagramAlt: string;
  workedExample: WorkedExample;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export const globalRules = [
  "All volumes are calculated in cubic yards (yd³).",
  "1 cubic yard = 27 cubic feet.",
  "Waste percentage is applied only to the final volume — never to linear measurements.",
  "Internal calculations use imperial units (feet, inches).",
  "Metric units are display-only conversions.",
  "Default rebar overlap: 12 inches.",
  "Standard rebar bar length: 20 feet.",
];

export const calculatorSections: CalculatorSection[] = [
  {
    slug: "footings",
    title: "Footings",
    seoTitle: "How Footing Concrete Calculations Work | Foundation Calculator",
    seoDescription:
      "Learn how footing concrete volume is calculated using length, width, and depth. See the exact formula and a worked example.",
    description:
      "The footing calculator determines the concrete volume required for a continuous footing based on its linear length, width, and depth. An optional wall add-on calculates additional volume for a stem wall on top of the footing.",
    inputs: [
      { name: "Linear Feet", description: "Total length of the footing" },
      { name: "Width (in)", description: "Width of the footing in inches" },
      { name: "Depth (in)", description: "Depth of the footing in inches" },
      { name: "Waste %", description: "Optional waste allowance" },
    ],
    formula:
      "Volume (yd³) = Linear Feet × (Width ÷ 12) × (Depth ÷ 12) ÷ 27",
    diagramAlt: "Diagram — Footing Calculation",
    workedExample: {
      inputs: "Linear Feet = 100, Width = 24 in, Depth = 12 in",
      steps: "100 × (24 ÷ 12) × (12 ÷ 12) ÷ 27\n= 100 × 2 × 1 ÷ 27\n≈ 7.41 yd³",
      result: "Concrete Required ≈ 7.41 yd³",
    },
  },
  {
    slug: "walls",
    title: "Walls",
    seoTitle: "How Wall Concrete Calculations Work | Foundation Calculator",
    seoDescription:
      "Learn how wall concrete volume is calculated using linear feet, height, and thickness. See the exact formula used.",
    description:
      "The wall calculator determines the concrete volume for a standalone wall (stem wall, retaining wall, etc.) based on its linear length, height, and thickness.",
    inputs: [
      { name: "Linear Feet", description: "Total length of the wall" },
      { name: "Height (in)", description: "Height of the wall in inches" },
      { name: "Thickness (in)", description: "Thickness of the wall in inches" },
      { name: "Waste %", description: "Optional waste allowance" },
    ],
    formula:
      "Volume (yd³) = Linear Feet × (Height ÷ 12) × (Thickness ÷ 12) ÷ 27",
    diagramAlt: "Diagram — Wall Calculation",
    workedExample: {
      inputs: "Linear Feet = 80, Height = 48 in, Thickness = 8 in",
      steps: "80 × (48 ÷ 12) × (8 ÷ 12) ÷ 27\n= 80 × 4 × 0.667 ÷ 27\n≈ 7.90 yd³",
      result: "Concrete Required ≈ 7.90 yd³",
    },
  },
  {
    slug: "grade-beams",
    title: "Grade Beams",
    seoTitle: "How Grade Beam Concrete Calculations Work | Foundation Calculator",
    seoDescription:
      "Learn how grade beam concrete volume is calculated. Same formula as footings: length × width × depth ÷ 27.",
    description:
      "The grade beam calculator uses the same formula as footings. It determines the concrete volume for a continuous grade beam based on linear length, width, and depth.",
    inputs: [
      { name: "Linear Feet", description: "Total length of the grade beam" },
      { name: "Width (in)", description: "Width of the grade beam in inches" },
      { name: "Depth (in)", description: "Depth of the grade beam in inches" },
      { name: "Waste %", description: "Optional waste allowance" },
    ],
    formula:
      "Volume (yd³) = Linear Feet × (Width ÷ 12) × (Depth ÷ 12) ÷ 27",
    diagramAlt: "Diagram — Grade Beam Calculation",
    workedExample: {
      inputs: "Linear Feet = 60, Width = 12 in, Depth = 24 in",
      steps: "60 × (12 ÷ 12) × (24 ÷ 12) ÷ 27\n= 60 × 1 × 2 ÷ 27\n≈ 4.44 yd³",
      result: "Concrete Required ≈ 4.44 yd³",
    },
  },
  {
    slug: "curb-gutter",
    title: "Curb & Gutter",
    seoTitle: "How Curb & Gutter Concrete Calculations Work | Foundation Calculator",
    seoDescription:
      "Learn how curb and gutter concrete volume is calculated by combining the curb body and gutter flag volumes.",
    description:
      "The curb & gutter calculator combines two separate volumes: the vertical curb body and the horizontal gutter flag, then converts the total to cubic yards.",
    inputs: [
      { name: "Linear Feet", description: "Total length of the curb run" },
      { name: "Curb Depth (in)", description: "Depth (width) of the curb body" },
      { name: "Curb Height (in)", description: "Vertical height of the curb" },
      { name: "Gutter Width (in)", description: "Horizontal width of the gutter flag" },
      { name: "Flag Thickness (in)", description: "Thickness of the gutter flag" },
      { name: "Waste %", description: "Optional waste allowance" },
    ],
    formula:
      "Curb ft³ = Linear Feet × (Curb Depth ÷ 12) × (Curb Height ÷ 12)\nGutter ft³ = Linear Feet × (Gutter Width ÷ 12) × (Flag Thickness ÷ 12)\nVolume (yd³) = (Curb ft³ + Gutter ft³) ÷ 27",
    diagramAlt: "Diagram — Curb & Gutter Calculation",
    workedExample: {
      inputs:
        "Linear Feet = 200, Curb Depth = 6 in, Curb Height = 18 in, Gutter Width = 24 in, Flag Thickness = 6 in",
      steps:
        "Curb = 200 × (6 ÷ 12) × (18 ÷ 12) = 200 × 0.5 × 1.5 = 150 ft³\nGutter = 200 × (24 ÷ 12) × (6 ÷ 12) = 200 × 2 × 0.5 = 200 ft³\nTotal = (150 + 200) ÷ 27 ≈ 12.96 yd³",
      result: "Concrete Required ≈ 12.96 yd³",
    },
  },
  {
    slug: "slabs",
    title: "Slabs",
    seoTitle: "How Slab Concrete Calculations Work | Foundation Calculator",
    seoDescription:
      "Learn how slab concrete volume is calculated per section and combined for an area total using length, width, and thickness.",
    description:
      "The slab calculator computes concrete volume for one or more rectangular sections. Each section's volume is calculated individually, then summed for the area total.",
    inputs: [
      { name: "Length (ft + in)", description: "Length of the section" },
      { name: "Width (ft + in)", description: "Width of the section" },
      { name: "Thickness (in)", description: "Slab thickness in inches" },
      { name: "Waste %", description: "Optional waste allowance" },
    ],
    formula:
      "Section ft² = (Length ft + Length in ÷ 12) × (Width ft + Width in ÷ 12)\nSection yd³ = ft² × (Thickness ÷ 12) ÷ 27\nArea Total = Sum of all sections",
    diagramAlt: "Diagram — Slab Calculation",
    workedExample: {
      inputs: "Length = 20 ft 0 in, Width = 30 ft 0 in, Thickness = 4 in",
      steps: "ft² = 20 × 30 = 600\nVolume = 600 × (4 ÷ 12) ÷ 27\n= 600 × 0.333 ÷ 27\n≈ 7.41 yd³",
      result: "Concrete Required ≈ 7.41 yd³",
    },
  },
  {
    slug: "pier-pads",
    title: "Pier Pads",
    seoTitle: "How Pier Pad Concrete Calculations Work | Foundation Calculator",
    seoDescription:
      "Learn how pier pad concrete volume is calculated using length, width, depth, and quantity.",
    description:
      "The pier pad calculator determines the concrete volume for rectangular pier pads based on individual dimensions and the number of pads.",
    inputs: [
      { name: "Length (in)", description: "Length of the pier pad" },
      { name: "Width (in)", description: "Width of the pier pad" },
      { name: "Depth (in)", description: "Depth of the pier pad" },
      { name: "Quantity", description: "Number of identical pier pads" },
      { name: "Waste %", description: "Optional waste allowance" },
    ],
    formula:
      "Volume Each (yd³) = (Length ÷ 12) × (Width ÷ 12) × (Depth ÷ 12) ÷ 27\nTotal = Volume Each × Quantity",
    diagramAlt: "Diagram — Pier Pad Calculation",
    workedExample: {
      inputs: "Length = 24 in, Width = 24 in, Depth = 12 in, Quantity = 8",
      steps: "Each = (24 ÷ 12) × (24 ÷ 12) × (12 ÷ 12) ÷ 27\n= 2 × 2 × 1 ÷ 27 ≈ 0.148 yd³\nTotal = 0.148 × 8 ≈ 1.19 yd³",
      result: "Concrete Required ≈ 1.19 yd³",
    },
  },
  {
    slug: "cylinders",
    title: "Cylinders",
    seoTitle: "How Cylinder Concrete Calculations Work | Foundation Calculator",
    seoDescription:
      "Learn how cylinder (sonotube / pier) concrete volume is calculated using diameter, height, and π.",
    description:
      "The cylinder calculator determines the concrete volume for round forms (sonotubes, piers, columns) using the standard πr²h cylinder formula.",
    inputs: [
      { name: "Diameter (in)", description: "Inside diameter of the cylinder" },
      { name: "Height (ft + in)", description: "Total height of the cylinder" },
      { name: "Quantity", description: "Number of identical cylinders" },
      { name: "Waste %", description: "Optional waste allowance" },
    ],
    formula:
      "Radius (ft) = (Diameter ÷ 12) ÷ 2\nVolume Each (yd³) = π × Radius² × Height (ft) ÷ 27\nTotal = Volume Each × Quantity",
    diagramAlt: "Diagram — Cylinder Calculation",
    workedExample: {
      inputs: "Diameter = 12 in, Height = 4 ft 0 in, Quantity = 10",
      steps:
        "Radius = (12 ÷ 12) ÷ 2 = 0.5 ft\nEach = π × 0.5² × 4 ÷ 27\n= 3.1416 × 0.25 × 4 ÷ 27 ≈ 0.116 yd³\nTotal = 0.116 × 10 ≈ 1.16 yd³",
      result: "Concrete Required ≈ 1.16 yd³",
    },
  },
  {
    slug: "steps-stairs",
    title: "Steps / Stairs",
    seoTitle: "How Step & Stair Concrete Calculations Work | Foundation Calculator",
    seoDescription:
      "Learn how step and stair concrete volume is calculated using a slope-adjusted method for accurate stringer volume.",
    description:
      "The steps/stairs calculator uses a slope-adjusted method. Unlike a simple rectangular block, this formula accounts for the sloped underside of the stair stringer, yielding a more accurate volume estimate. An optional platform volume is added when present.",
    inputs: [
      { name: "Rise (in)", description: "Vertical rise of each step" },
      { name: "Run (in)", description: "Horizontal depth of each step" },
      { name: "Width (in)", description: "Width of the stairway" },
      { name: "Number of Steps", description: "Total step count" },
      { name: "Throat Depth (in)", description: "Minimum thickness at the thinnest point of the stringer" },
      { name: "Platform Depth (in)", description: "Depth of the landing platform (optional)" },
      { name: "Platform Width (in)", description: "Width of the landing platform (optional, defaults to stair width)" },
      { name: "Waste %", description: "Optional waste allowance" },
    ],
    formula:
      "A = Rise × Run × Width ÷ 2\nh = √(Rise² + Run²)\nB = h × Width × Throat Depth\nV1 = (A + B) × (Num Steps − 1)\nV2 = Rise × Run × Width\nStairs ft³ = (V1 + V2) × 0.0005787037\nPlatform ft³ = (Platform Depth ÷ 12) × (Platform Width ÷ 12) × (Width ÷ 12)\nVolume (yd³) = (Stairs ft³ + Platform ft³) ÷ 27",
    diagramAlt: "Diagram — Steps / Stairs Calculation (Spike VM Method)",
    workedExample: {
      inputs:
        "Rise = 7 in, Run = 11 in, Width = 36 in, Steps = 5, Throat Depth = 6 in",
      steps:
        "A = 7 × 11 × 36 ÷ 2 = 1386\nh = √(49 + 121) = √170 ≈ 13.04\nB = 13.04 × 36 × 6 = 2816.6\nV1 = (1386 + 2816.6) × 4 = 16810.5\nV2 = 7 × 11 × 36 = 2772\nStairs ft³ = (16810.5 + 2772) × 0.0005787037 ≈ 11.33 ft³\nVolume = 11.33 ÷ 27 ≈ 0.42 yd³",
      result: "Concrete Required ≈ 0.42 yd³",
    },
  },
  {
    slug: "rebar-linear",
    title: "Rebar (Linear)",
    seoTitle: "How Linear Rebar Calculations Work | Foundation Calculator",
    seoDescription:
      "Learn how horizontal and vertical rebar quantities are calculated for footings, walls, and grade beams.",
    description:
      "The linear rebar calculator computes total linear feet of rebar for horizontal rows and vertical bars. Horizontal rebar accounts for splice overlaps at every 20-foot bar joint. Vertical rebar calculates bar count based on spacing and height.",
    inputs: [
      { name: "Linear Feet", description: "Total run length" },
      { name: "Bar Size", description: "Rebar bar size" },
      { name: "Num Rows", description: "Number of horizontal rows (horizontal)" },
      { name: "Overlap (in)", description: "Splice overlap at each joint" },
      { name: "Spacing (in)", description: "On-center spacing for vertical bars" },
      { name: "Bar Height (ft + in)", description: "Height of each vertical bar" },
      { name: "Waste %", description: "Optional waste allowance" },
    ],
    formula:
      "Horizontal:\n  Splices = floor(Linear Feet ÷ 20)\n  Overlap LF = Splices × (Overlap ÷ 12) × Num Rows\n  Total LF = (Linear Feet × Num Rows) + Overlap LF\n\nVertical:\n  Num Bars = floor(Linear Feet × 12 ÷ Spacing) + 1\n  Total LF = Num Bars × Bar Height (ft)",
    diagramAlt: "Diagram — Rebar Linear Calculation",
    workedExample: {
      inputs:
        "Linear Feet = 100, 2 rows, Overlap = 12 in, Bar Length = 20 ft",
      steps:
        "Splices = floor(100 ÷ 20) = 5\nOverlap LF = 5 × 1 × 2 = 10\nTotal LF = (100 × 2) + 10 = 210 LF",
      result: "Horizontal Rebar ≈ 210 LF",
    },
  },
  {
    slug: "rebar-grid",
    title: "Rebar (Slab Grid)",
    seoTitle: "How Rebar Grid Calculations Work | Foundation Calculator",
    seoDescription:
      "Learn how slab rebar grid quantities are calculated including bar counts in both directions and splice overlaps.",
    description:
      "The slab grid rebar calculator determines the total linear feet of rebar needed for a rectangular slab laid out in a grid pattern. It calculates bar counts in both length and width directions, then adds splice overlaps for bars that exceed the standard 20-foot length.",
    inputs: [
      { name: "Length (ft)", description: "Slab length" },
      { name: "Width (ft)", description: "Slab width" },
      { name: "Spacing (in)", description: "On-center grid spacing" },
      { name: "Bar Size", description: "Rebar bar size" },
      { name: "Overlap (in)", description: "Splice overlap at each joint" },
      { name: "Waste %", description: "Optional waste allowance" },
    ],
    formula:
      "Bars Lengthwise = floor(Width × 12 ÷ Spacing) + 1\nBars Widthwise = floor(Length × 12 ÷ Spacing) + 1\nSplice Length = splice count × (Overlap ÷ 12)\nLF Lengthwise = Bars Lengthwise × (Length + Splice Length)\nLF Widthwise = Bars Widthwise × (Width + Splice Width)\nTotal LF = LF Lengthwise + LF Widthwise",
    diagramAlt: "Diagram — Rebar Slab Grid Calculation",
    workedExample: {
      inputs:
        "Length = 30 ft, Width = 20 ft, Spacing = 12 in, Overlap = 12 in",
      steps:
        "Bars Lengthwise = floor(20 × 12 ÷ 12) + 1 = 21\nBars Widthwise = floor(30 × 12 ÷ 12) + 1 = 31\nSplice (30 ft span) = 1 × 1 = 1 ft\nLF Lengthwise = 21 × 31 = 651\nLF Widthwise = 31 × 21 = 651\nTotal ≈ 1302 LF",
      result: "Grid Rebar ≈ 1,302 LF",
    },
  },
  {
    slug: "stone-base",
    title: "Stone Base",
    seoTitle: "How Stone Base Calculations Work | Foundation Calculator",
    seoDescription:
      "Learn how stone base tonnage is calculated from square footage, depth, and stone density.",
    description:
      "The stone base calculator converts a square footage area and depth into cubic yards, then multiplies by the stone density to produce a tonnage estimate.",
    inputs: [
      { name: "Square Feet", description: "Total area to cover" },
      { name: "Depth (in)", description: "Stone base depth in inches" },
      { name: "Density (tons/yd³)", description: "Density of the stone material" },
      { name: "Waste %", description: "Optional waste allowance" },
    ],
    formula:
      "Volume (yd³) = Square Feet × (Depth ÷ 12) ÷ 27\nTons = Volume × Density (tons/yd³)",
    diagramAlt: "Diagram — Stone Base Calculation",
    workedExample: {
      inputs: "Square Feet = 600, Depth = 4 in, Density = 1.4 tons/yd³",
      steps: "Volume = 600 × (4 ÷ 12) ÷ 27\n= 600 × 0.333 ÷ 27 ≈ 7.41 yd³\nTons = 7.41 × 1.4 ≈ 10.37 tons",
      result: "Stone Required ≈ 10.37 tons",
    },
  },
];

export const faqItems: FAQItem[] = [
  {
    question: "How do you calculate concrete volume?",
    answer:
      "Concrete volume is calculated by multiplying the three dimensions of a shape (length × width × depth for rectangles, or πr²h for cylinders) to get cubic feet, then dividing by 27 to convert to cubic yards.",
  },
  {
    question: "Why is concrete measured in cubic yards?",
    answer:
      "Cubic yards are the standard unit for ordering ready-mix concrete in the United States. One cubic yard equals 27 cubic feet and is the standard batch size for concrete delivery trucks.",
  },
  {
    question: "How much waste should be added to concrete orders?",
    answer:
      "A typical waste allowance is 5–10%. This accounts for over-excavation, forms that are not perfectly straight, spillage, and variations in grade. The calculator applies waste only to the final volume, not to linear measurements.",
  },
  {
    question: "How is rebar overlap calculated?",
    answer:
      "Rebar overlap (splice) occurs where two bars meet. The standard overlap is based on the bar diameter multiplied by a development-length factor — typically 40–60 bar diameters. The calculator uses a default 12-inch overlap and assumes a standard 20-foot bar length to count the number of splices along the run.",
  },
  {
    question: "What is the formula for concrete footings?",
    answer:
      "Footing volume = Linear Feet × (Width in inches ÷ 12) × (Depth in inches ÷ 12) ÷ 27. This converts all dimensions to feet, multiplies them together, then divides by 27 to get cubic yards.",
  },
  {
    question: "How are steps and stairs calculated differently from slabs?",
    answer:
      "Steps use the Spike VM slope-adjusted method, which accounts for the triangular step profile and the sloped stringer underside rather than treating the entire staircase as a rectangular block. This yields a more accurate — and typically lower — volume estimate than a simple box calculation.",
  },
];
