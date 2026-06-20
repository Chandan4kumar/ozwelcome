/*
  # Add resume file path to bookings

  1. Modified Tables
    - `bookings`
      - `resume_file_path` (text, nullable) — path to uploaded resume in Supabase Storage
      - `resume_file_name` (text, nullable) — original filename of uploaded resume

  2. Security
    - No new tables or RLS changes needed
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'resume_file_path'
  ) THEN
    ALTER TABLE bookings ADD COLUMN resume_file_path text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'resume_file_name'
  ) THEN
    ALTER TABLE bookings ADD COLUMN resume_file_name text;
  END IF;
END $$;
