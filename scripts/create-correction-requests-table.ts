import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createCorrectionRequestsTable() {
  try {
    console.log('Creating correction_requests table...')

    await prisma.$executeRawUnsafe(`
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
    `)

    console.log('✅ correction_requests table created successfully')

    // Create index for faster lookups
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_correction_requests_attendance
      ON correction_requests(attendance_id);
    `)

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_correction_requests_status
      ON correction_requests(status);
    `)

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_correction_requests_requester
      ON correction_requests(requested_by);
    `)

    console.log('✅ Indexes created successfully')
  } catch (error) {
    console.error('Error creating table:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createCorrectionRequestsTable()
