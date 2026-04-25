-- Create correction_requests table
-- Run this SQL in Supabase SQL Editor if the table wasn't created automatically

CREATE TABLE IF NOT EXISTS correction_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attendance_id UUID NOT NULL REFERENCES attendance(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES profiles(id),
  requested_hours DECIMAL(4, 1),
  requested_notes TEXT,
  reason TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_correction_requests_attendance
  ON correction_requests(attendance_id);

CREATE INDEX IF NOT EXISTS idx_correction_requests_status
  ON correction_requests(status);

CREATE INDEX IF NOT EXISTS idx_correction_requests_requester
  ON correction_requests(requested_by);

-- Add comment
COMMENT ON TABLE correction_requests IS '출근 기록 수정 요청 테이블';
