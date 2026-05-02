import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addDatabaseIndexes() {
  console.log('🚀 Starting database index creation...\n')

  const indexes = [
    // Company indexes
    {
      name: 'companies_ownerId_idx',
      sql: 'CREATE INDEX IF NOT EXISTS "companies_ownerId_idx" ON "companies"("owner_id");',
      description: 'Company owner lookup optimization'
    },

    // Site indexes
    {
      name: 'sites_companyId_isActive_idx',
      sql: 'CREATE INDEX IF NOT EXISTS "sites_companyId_isActive_idx" ON "sites"("company_id", "is_active");',
      description: 'Active sites by company'
    },
    {
      name: 'sites_endDate_isActive_idx',
      sql: 'CREATE INDEX IF NOT EXISTS "sites_endDate_isActive_idx" ON "sites"("end_date", "is_active");',
      description: 'Expiring sites risk analysis'
    },

    // Worker indexes
    {
      name: 'workers_siteId_isActive_idx',
      sql: 'CREATE INDEX IF NOT EXISTS "workers_siteId_isActive_idx" ON "workers"("site_id", "is_active");',
      description: 'Active workers by site (most frequent query)'
    },
    {
      name: 'workers_siteId_idx',
      sql: 'CREATE INDEX IF NOT EXISTS "workers_siteId_idx" ON "workers"("site_id");',
      description: 'Worker-Site JOIN optimization'
    },
    {
      name: 'workers_profileId_idx',
      sql: 'CREATE INDEX IF NOT EXISTS "workers_profileId_idx" ON "workers"("profile_id");',
      description: 'Profile-Worker link (Phase 2)'
    },

    // Attendance indexes
    {
      name: 'attendance_siteId_date_idx',
      sql: 'CREATE INDEX IF NOT EXISTS "attendance_siteId_date_idx" ON "attendance"("site_id", "date");',
      description: 'Daily attendance by site'
    },
    {
      name: 'attendance_workerId_date_idx',
      sql: 'CREATE INDEX IF NOT EXISTS "attendance_workerId_date_idx" ON "attendance"("worker_id", "date");',
      description: 'Worker attendance history'
    },
    {
      name: 'attendance_date_idx',
      sql: 'CREATE INDEX IF NOT EXISTS "attendance_date_idx" ON "attendance"("date");',
      description: 'Date-based aggregations'
    },

    // Payroll indexes
    {
      name: 'payroll_siteId_year_month_idx',
      sql: 'CREATE INDEX IF NOT EXISTS "payroll_siteId_year_month_idx" ON "payroll"("site_id", "year", "month");',
      description: 'Monthly payroll by site (core query)'
    },
    {
      name: 'payroll_workerId_year_month_idx',
      sql: 'CREATE INDEX IF NOT EXISTS "payroll_workerId_year_month_idx" ON "payroll"("worker_id", "year", "month");',
      description: 'Worker payroll history'
    },
    {
      name: 'payroll_paidAt_idx',
      sql: 'CREATE INDEX IF NOT EXISTS "payroll_paidAt_idx" ON "payroll"("paid_at");',
      description: 'Unpaid payroll lookup'
    },
  ]

  let successCount = 0
  let failCount = 0

  for (const index of indexes) {
    try {
      console.log(`📌 Creating index: ${index.name}`)
      console.log(`   Description: ${index.description}`)

      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: index.sql
      })

      if (error) {
        // RPC 방식이 안되면 직접 SQL 실행 시도
        console.log('   ⚠️  RPC method not available, trying direct execution...')

        // Supabase client로 직접 실행은 불가능하므로 안내
        console.log(`   ⚠️  Please execute manually in Supabase SQL Editor:`)
        console.log(`   ${index.sql}\n`)
        failCount++
      } else {
        console.log('   ✅ Success\n')
        successCount++
      }
    } catch (error) {
      console.error(`   ❌ Error: ${error}\n`)
      failCount++
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 Summary:')
  console.log(`   ✅ Success: ${successCount}/${indexes.length}`)
  console.log(`   ❌ Failed:  ${failCount}/${indexes.length}`)
  console.log('='.repeat(60))

  if (failCount > 0) {
    console.log('\n⚠️  Some indexes could not be created via script.')
    console.log('Please execute the following SQL in Supabase SQL Editor:\n')
    console.log('-- Copy and paste all SQL statements below --\n')

    indexes.forEach(index => {
      console.log(`-- ${index.description}`)
      console.log(index.sql)
      console.log('')
    })
  }
}

addDatabaseIndexes()
  .then(() => {
    console.log('\n✅ Index creation process completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })
