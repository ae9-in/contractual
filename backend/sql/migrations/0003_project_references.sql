ALTER TABLE projects
  ADD COLUMN reference_link VARCHAR(500) NULL,
  ADD COLUMN reference_files JSON NULL;
