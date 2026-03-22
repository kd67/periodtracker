/*
  # Create Period Tracker Tables

  1. New Tables
    - `periods`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `start_date` (date)
      - `end_date` (date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `notification_records`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `reminder_type` (text: 'D-7', 'D-3', 'D-1')
      - `sent_date` (date)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
    - Users can only see and modify their own periods and notifications
*/

CREATE TABLE IF NOT EXISTS periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notification_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reminder_type text NOT NULL CHECK (reminder_type IN ('D-7', 'D-3', 'D-1')),
  sent_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own periods"
  ON periods FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own periods"
  ON periods FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own periods"
  ON periods FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own periods"
  ON periods FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own notification records"
  ON notification_records FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification records"
  ON notification_records FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_periods_user_id ON periods(user_id);
CREATE INDEX idx_notification_records_user_id ON notification_records(user_id);
CREATE INDEX idx_notification_records_sent_date ON notification_records(sent_date);
