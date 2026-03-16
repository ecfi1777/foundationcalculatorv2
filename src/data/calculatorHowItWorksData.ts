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
      "Learn how footing concrete volume is calculated using length, width, and depth — with an optional wall add-on for stem walls.",
    description:
      "The footing calculator determines the concrete volume required for a continuous footing based on its linear length, width, and depth. An optional wall add-on calculates additional volume for a stem wall on top of the footing.",
    inputs: [
      { name: "Linear Feet", description: "Total length of the footing" },
      { name: "Width (in)", description: "Width of the footing in inches" },
      { name: "Depth (in)", description: "Depth of the footing in inches" },
      { name: "Waste %", description: "Optional waste allowance" },
      { name: "Wall Height (in)", description: "Height of the stem wall (optional)" },
      { name: "Wall Thickness (in)", description: "Thickness of the stem wall (optional)" },
    ],
    formula:
      "Footing Volume (yd³) = Linear Feet × (Width ÷ 12) × (Depth ÷ 12) ÷ 27\n\nIf wall values are entered:\n  Wall Volume (yd³) = Linear Feet × (Wall Height ÷ 12) × (Wall Thickness ÷ 12) ÷ 27\n  Total Volume = Footing Volume + Wall Volume\n\nThe wall calculation is optional and only applied when wall inputs are provided.",
    diagramAlt: "Diagram — Footing Calculation",
    workedExample: {
      inputs: "Linear Feet = 100, Width = 24 in, Depth = 12 in, Wall Height = 48 in, Wall Thickness = 8 in",
      steps:
        "Footing = 100 × (24 ÷ 12) × (12 ÷ 12) ÷ 27\n= 100 × 2 × 1 ÷ 27 ≈ 7.41 yd³\n\nWall = 100 × (48 ÷ 12) × (8 ÷ 12) ÷ 27\n= 100 × 4 × 0.667 ÷ 27 ≈ 9.88 yd³\n\nTotal = 7.41 + 9.88 ≈ 17.28 yd³",
      result: "Concrete Required ≈ 17.28 yd³ (footing + wall)",
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
    slug: "slab-rebar",
    title: "Slab Rebar",
    seoTitle: "How Slab Rebar Grid Calculations Work | Foundation Calculator",
    seoDescription:
      "Learn how slab rebar grid quantities are calculated including bar counts in both directions and total linear feet.",
    description:
      "The slab rebar calculator determines the total linear feet of rebar needed for a rectangular slab laid out in a grid pattern. It calculates bar counts in both the length and width directions based on spacing, then computes total linear feet. Waste is applied afterward.",
    inputs: [
      { name: "Slab Length (ft)", description: "Length of the slab" },
      { name: "Slab Width (ft)", description: "Width of the slab" },
      { name: "Spacing (in)", description: "On-center grid spacing" },
      { name: "Bar Size", description: "Rebar bar size" },
      { name: "Overlap (in)", description: "Splice overlap at each joint" },
      { name: "Waste %", description: "Optional waste allowance" },
    ],
    formula:
      "Bars (Length Direction) = floor(Slab Width ÷ Spacing) + 1\nBars (Width Direction) = floor(Slab Length ÷ Spacing) + 1\n\nTotal Bars = Bars (Length Dir) + Bars (Width Dir)\nTotal Linear Feet = (Bars Length Dir × Slab Length) + (Bars Width Dir × Slab Width)\n\nWaste is applied to the total linear feet afterward.",
    diagramAlt: "Diagram — Slab Rebar Grid Calculation",
    workedExample: {
      inputs:
        "Slab Length = 30 ft, Slab Width = 20 ft, Spacing = 12 in, Overlap = 12 in",
      steps:
        "Bars (Length Dir) = floor(20 × 12 ÷ 12) + 1 = 21\nBars (Width Dir) = floor(30 × 12 ÷ 12) + 1 = 31\nTotal Bars = 21 + 31 = 52\nTotal LF = (21 × 30) + (31 × 20) = 630 + 620 = 1,250 LF",
      result: "Grid Rebar ≈ 1,250 LF (before waste)",
    },
  },
  {
    slug: "wall-rebar",
    title: "Wall Rebar",
    seoTitle: "How Wall Rebar Calculations Work | Foundation Calculator",
    seoDescription:
      "Learn how horizontal and vertical rebar quantities are calculated for walls, footings, and grade beams.",
    description:
      "The wall rebar calculator computes total linear feet of rebar for horizontal rows and vertical bars. Horizontal rebar accounts for splice overlaps at every 20-foot bar joint. Vertical rebar calculates bar count based on spacing and height.",
    inputs: [
      { name: "Linear Feet", description: "Total run length" },
      { name: "Bar Size", description: "Rebar bar size" },
      { name: "Num Rows", description: "Number of horizontal rows" },
      { name: "Overlap (in)", description: "Splice overlap at each joint" },
      { name: "Spacing (in)", description: "On-center spacing for vertical bars" },
      { name: "Bar Height (ft + in)", description: "Height of each vertical bar" },
      { name: "Waste %", description: "Optional waste allowance" },
    ],
    formula:
      "Horizontal:\n  Splices = floor(Linear Feet ÷ 20)\n  Overlap LF = Splices × (Overlap ÷ 12) × Num Rows\n  Total LF = (Linear Feet × Num Rows) + Overlap LF\n\nVertical:\n  Num Bars = floor(Linear Feet × 12 ÷ Spacing) + 1\n  Total LF = Num Bars × Bar Height (ft)",
    diagramAlt: "Diagram — Wall Rebar Calculation",
    workedExample: {
      inputs:
        "Linear Feet = 100, 2 rows, Overlap = 12 in, Bar Length = 20 ft",
      steps:
        "Splices = floor(100 ÷ 20) = 5\nOverlap LF = 5 × 1 × 2 = 10\nTotal LF = (100 × 2) + 10 = 210 LF",
      result: "Horizontal Rebar ≈ 210 LF",
    },
  },
  {
    slug: "l-bars",
    title: "L-Bars",
    seoTitle: "How L-Bar Rebar Calculations Work | Foundation Calculator",
    seoDescription:
      "Learn how L-bar rebar quantities are calculated for footing-to-wall connections using spacing and bar dimensions.",
    description:
      "L-bars (also called dowel bars or bent bars) are used to tie a footing to a wall. The calculator determines the number of L-bars based on spacing along the run length, then computes total linear feet using the combined leg lengths of each L-bar.",
    inputs: [
      { name: "Linear Feet", description: "Total run length of the footing" },
      { name: "Spacing (in)", description: "On-center spacing of the L-bars" },
      { name: "Vertical Leg (in)", description: "Vertical leg length of the L-bar" },
      { name: "Horizontal Leg (in)", description: "Horizontal leg length of the L-bar" },
      { name: "Bar Size", description: "Rebar bar size" },
      { name: "Waste %", description: "Optional waste allowance" },
    ],
    formula:
      "Num L-Bars = floor(Linear Feet × 12 ÷ Spacing) + 1\nBar Length (ft) = (Vertical Leg + Horizontal Leg) ÷ 12\nTotal LF = Num L-Bars × Bar Length",
    diagramAlt: "Diagram — L-Bar Rebar Calculation",
    workedExample: {
      inputs:
        "Linear Feet = 100, Spacing = 24 in, Vertical Leg = 24 in, Horizontal Leg = 12 in",
      steps:
        "Num L-Bars = floor(100 × 12 ÷ 24) + 1 = 51\nBar Length = (24 + 12) ÷ 12 = 3 ft\nTotal LF = 51 × 3 = 153 LF",
      result: "L-Bar Rebar ≈ 153 LF",
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
    slug: "pier-pads",
    title: "Pier Pads",
    seoTitle: "How Pier Pad Concrete Calculations Work | Foundation Calculator",
    seoDescription:
      "Learn how pier pad concrete volume is calculated using length, width, depth, and quantity.",
    description:
      "The pier pad calculator determines the concrete volume for rectangular pier pads. Each pad's volume is calculated from its individual dimensions, then multiplied by the number of pads to get the total volume. The result is converted to cubic yards.",
    inputs: [
      { name: "Length (in)", description: "Length of the pier pad in inches" },
      { name: "Width (in)", description: "Width of the pier pad in inches" },
      { name: "Depth (in)", description: "Depth of the pier pad in inches" },
      { name: "Quantity", description: "Number of identical pier pads" },
      { name: "Waste %", description: "Optional waste allowance" },
    ],
    formula:
      "Volume per Pad (yd³) = (Length ÷ 12) × (Width ÷ 12) × (Depth ÷ 12) ÷ 27\nTotal Volume = Volume per Pad × Quantity",
    diagramAlt: "Diagram — Pier Pad Calculation",
    workedExample: {
      inputs: "Length = 24 in, Width = 24 in, Depth = 12 in, Quantity = 8",
      steps: "Per Pad = (24 ÷ 12) × (24 ÷ 12) × (12 ÷ 12) ÷ 27\n= 2 × 2 × 1 ÷ 27 ≈ 0.148 yd³\nTotal = 0.148 × 8 ≈ 1.19 yd³",
      result: "Concrete Required ≈ 1.19 yd³",
    },
  },
  {
    slug: "curbs",
    title: "Curbs",
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
    slug: "stone-base",
    title: "Stone Base",
    seoTitle: "How Stone Base Calculations Work | Foundation Calculator",
    seoDescription:
      "Learn how stone base tonnage is calculated from square footage, depth, waste percentage, and stone density.",
    description:
      "The stone base calculator converts a square footage area and depth into cubic feet, applies a waste percentage, converts to cubic yards, then multiplies by the stone density to produce a tonnage estimate. Material factors vary by stone type.",
    inputs: [
      { name: "Square Feet", description: "Total area to cover" },
      { name: "Depth (in)", description: "Stone base depth in inches" },
      { name: "Density (tons/yd³)", description: "Density of the stone material (varies by type)" },
      { name: "Waste %", description: "Optional waste allowance" },
    ],
    formula:
      "Volume (ft³) = Square Feet × (Depth ÷ 12)\nVolume w/ Waste = Volume × (1 + Waste %)\nCubic Yards = Volume w/ Waste ÷ 27\nTons = Cubic Yards × Material Factor (tons/yd³)\n\nMaterial factors vary by stone type.",
    diagramAlt: "Diagram — Stone Base Calculation",
    workedExample: {
      inputs: "Square Feet = 600, Depth = 4 in, Density = 1.4 tons/yd³, Waste = 5%",
      steps: "Volume = 600 × (4 ÷ 12) = 200 ft³\nWith Waste = 200 × 1.05 = 210 ft³\nCubic Yards = 210 ÷ 27 ≈ 7.78 yd³\nTons = 7.78 × 1.4 ≈ 10.89 tons",
      result: "Stone Required ≈ 10.89 tons",
    },
  },
  {
    slug: "concrete-totals",
    title: "Concrete Totals",
    seoTitle: "How Concrete Totals Are Calculated | Foundation Calculator",
    seoDescription:
      "Learn how the total concrete volume is aggregated across all areas in a project, including waste adjustments.",
    description:
      "The concrete totals section aggregates volumes from all calculator areas in a project. Each area's volume (with waste applied) is summed to produce the overall project total in cubic yards. This gives a single ordering quantity for concrete delivery.",
    inputs: [
      { name: "Area Volumes", description: "Calculated volume from each area (footings, slabs, walls, etc.)" },
      { name: "Waste %", description: "Applied per-area before summing" },
    ],
    formula:
      "Project Total (yd³) = Σ (Area Volume with Waste)\n\nEach area's waste is applied individually before summing.",
    diagramAlt: "Diagram — Concrete Totals Aggregation",
    workedExample: {
      inputs: "Footing Area = 7.41 yd³, Slab Area = 7.41 yd³, Wall Area = 7.90 yd³",
      steps: "Total = 7.41 + 7.41 + 7.90 = 22.72 yd³",
      result: "Project Concrete Total ≈ 22.72 yd³",
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
      "Footing volume = Linear Feet × (Width in inches ÷ 12) × (Depth in inches ÷ 12) ÷ 27. This converts all dimensions to feet, multiplies them together, then divides by 27 to get cubic yards. An optional wall add-on can be included by adding Wall Height × Wall Thickness volume on top.",
  },
  {
    question: "How are concrete totals calculated for a project?",
    answer:
      "Each area's volume is calculated individually with its own waste percentage applied, then all area volumes are summed to produce the project's total concrete requirement in cubic yards.",
  },
];
