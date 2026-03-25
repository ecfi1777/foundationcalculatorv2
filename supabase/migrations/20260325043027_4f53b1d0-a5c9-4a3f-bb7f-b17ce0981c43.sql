ALTER TABLE public.sections
  ADD COLUMN length_fraction text NOT NULL DEFAULT '0',
  ADD COLUMN width_fraction text NOT NULL DEFAULT '0';