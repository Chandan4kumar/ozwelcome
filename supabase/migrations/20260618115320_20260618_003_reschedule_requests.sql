/*
# Reschedule Requests Table

1. New Table
- `reschedule_requests`
- Stores user-initiated reschedule requests for existing bookings
- Each request is linked to a booking and captures:
  - preferred new date and time
  - optional reason
  - request status

2. Columns
- `id` (uuid, primary key) — unique identifier
- `booking_id` (uuid, not null) — references the booking to reschedule
- `user_id` (uuid, not null, default auth.uid) — requester
- `preferred_date` (date, not null) — proposed new date
- `preferred_time` (text, not null) — proposed new time
- `reason` (text, nullable) — optional reason for reschedule
- `status` (text, not null, default 'pending') — request status
- `created_at` (timestamptz, default now()) — when request was made
- `updated_at` (timestamptz, default now()) — last update

3. Security
- Enable RLS on `reschedule_requests`
- Users can only access their own requests
- Service role has full access for admin operations
*/

CREATE TABLE IF NOT EXISTS reschedule_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_date date NOT NULL,
  preferred_time text NOT NULL,
  reason text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE reschedule_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "select_own_reschedule_requests" ON reschedule_requests;
CREATE POLICY "select_own_reschedule_requests"
  ON reschedule_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_reschedule_requests" ON reschedule_requests;
CREATE POLICY "insert_own_reschedule_requests"
  ON reschedule_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_reschedule_requests" ON reschedule_requests;
CREATE POLICY "update_own_reschedule_requests"
  ON reschedule_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_reschedule_requests" ON reschedule_requests;
CREATE POLICY "delete_own_reschedule_requests"
  ON reschedule_requests FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role full access
DROP POLICY IF EXISTS "service_role_reschedule_requests" ON reschedule_requests;
CREATE POLICY "service_role_reschedule_requests"
  ON reschedule_requests FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_reschedule_requests_booking_id ON reschedule_requests(booking_id);
CREATE INDEX IF NOT EXISTS idx_reschedule_requests_user_id ON reschedule_requests(user_id);
