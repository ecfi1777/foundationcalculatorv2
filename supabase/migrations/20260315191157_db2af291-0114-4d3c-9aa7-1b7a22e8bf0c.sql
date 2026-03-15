
-- Step 1: Add element_type column if not already present
ALTER TABLE rebar_configs
  ADD COLUMN IF NOT EXISTS element_type text NOT NULL DEFAULT 'footing';

-- Step 2: Add check constraint — wrapped for safe re-run
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'rebar_configs_element_type_check'
  ) THEN
    ALTER TABLE rebar_configs
      ADD CONSTRAINT rebar_configs_element_type_check
      CHECK (element_type IN ('footing', 'wall', 'grade_beam', 'curb', 'slab'));
  END IF;
END $$;

-- Step 3: Migrate existing rows to correct element_type
UPDATE rebar_configs rc
SET element_type = CASE
  WHEN a.calculator_type = 'slab'       THEN 'slab'
  WHEN a.calculator_type = 'wall'       THEN 'wall'
  WHEN a.calculator_type = 'gradeBeam'  THEN 'grade_beam'
  WHEN a.calculator_type = 'curbGutter' THEN 'curb'
  ELSE 'footing'
END
FROM areas a
WHERE rc.area_id = a.id;

-- Step 4: Drop old unique constraint (area_id only) — safe to re-run
ALTER TABLE rebar_configs
  DROP CONSTRAINT IF EXISTS rebar_configs_area_id_key;

-- Step 5: Add new unique constraint — wrapped for safe re-run
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'rebar_configs_area_id_element_type_key'
  ) THEN
    ALTER TABLE rebar_configs
      ADD CONSTRAINT rebar_configs_area_id_element_type_key
      UNIQUE (area_id, element_type);
  END IF;
END $$;
