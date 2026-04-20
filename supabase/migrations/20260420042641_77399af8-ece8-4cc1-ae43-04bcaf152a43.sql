-- Phase 5.1: v2.3 rebar schema additions (inset + L-Bar) and element_type widening

-- 1. Add user-level rebar inset default
ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS rebar_inset_in DECIMAL NOT NULL DEFAULT 3;

-- 2. Add per-area inset override columns for Horizontal/Vertical/Grid
ALTER TABLE public.rebar_configs
  ADD COLUMN IF NOT EXISTS h_inset_in    DECIMAL NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS v_inset_in    DECIMAL NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS grid_inset_in DECIMAL NOT NULL DEFAULT 3;

-- 3. Add full L-Bar column group
ALTER TABLE public.rebar_configs
  ADD COLUMN IF NOT EXISTS lbar_enabled        BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS lbar_bar_size       TEXT,
  ADD COLUMN IF NOT EXISTS lbar_spacing_in     DECIMAL,
  ADD COLUMN IF NOT EXISTS lbar_vertical_ft    DECIMAL,
  ADD COLUMN IF NOT EXISTS lbar_vertical_in    DECIMAL,
  ADD COLUMN IF NOT EXISTS lbar_bend_length_in DECIMAL NOT NULL DEFAULT 12,
  ADD COLUMN IF NOT EXISTS lbar_overlap_in     DECIMAL,
  ADD COLUMN IF NOT EXISTS lbar_inset_in       DECIMAL,
  ADD COLUMN IF NOT EXISTS lbar_waste_pct      DECIMAL NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lbar_total_lf       DECIMAL NOT NULL DEFAULT 0;

-- 4. Widen element_type CHECK constraint to include 'pier_pad'
ALTER TABLE public.rebar_configs
  DROP CONSTRAINT IF EXISTS rebar_configs_element_type_check;

ALTER TABLE public.rebar_configs
  ADD CONSTRAINT rebar_configs_element_type_check
  CHECK (element_type IN ('footing', 'wall', 'grade_beam', 'curb', 'slab', 'pier_pad'));