-- Migration: adicionar colunas faltantes em company_boards
-- Contexto: a migration original não incluiu icon e color,
--           mas o tipo CompanyBoard e os formulários já as usam.

ALTER TABLE company_boards
  ADD COLUMN IF NOT EXISTS icon  TEXT,
  ADD COLUMN IF NOT EXISTS color TEXT;
