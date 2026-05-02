import prisma from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

async function runIndexMigration() {
  console.log('🚀 Starting database index migration...\n')

  try {
    // Read SQL file
    const sqlFilePath = path.join(process.cwd(), 'supabase', 'migrations', 'add_performance_indexes.sql')
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8')

    // Remove comments and extract CREATE INDEX statements
    const lines = sqlContent.split('\n')
    const cleanLines: string[] = []
    let inBlockComment = false

    for (const line of lines) {
      const trimmed = line.trim()

      // Handle block comments
      if (trimmed.startsWith('/*')) {
        inBlockComment = true
      }
      if (inBlockComment) {
        if (trimmed.includes('*/')) {
          inBlockComment = false
        }
        continue
      }

      // Skip line comments
      if (trimmed.startsWith('--') || trimmed.length === 0) {
        continue
      }

      cleanLines.push(line)
    }

    // Join and split by semicolon to get statements
    const cleanedSQL = cleanLines.join('\n')
    const statements = cleanedSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .filter(s => s.includes('CREATE INDEX'))

    console.log(`📝 Found ${statements.length} index creation statements\n`)

    let successCount = 0
    let failCount = 0

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'

      // Extract index name from statement
      const match = statement.match(/CREATE INDEX IF NOT EXISTS "([^"]+)"/)
      const indexName = match ? match[1] : `Index ${i + 1}`

      try {
        console.log(`📌 Creating: ${indexName}`)

        await prisma.$executeRawUnsafe(statement)

        console.log('   ✅ Success\n')
        successCount++
      } catch (error: any) {
        console.error(`   ❌ Error: ${error.message}\n`)
        failCount++
      }
    }

    console.log('='.repeat(60))
    console.log('📊 Migration Summary:')
    console.log(`   ✅ Success: ${successCount}/${statements.length}`)
    console.log(`   ❌ Failed:  ${failCount}/${statements.length}`)
    console.log('='.repeat(60))

    // Verify indexes
    if (successCount > 0) {
      console.log('\n🔍 Verifying created indexes...\n')

      const indexes = await prisma.$queryRaw<Array<{
        schemaname: string
        tablename: string
        indexname: string
        indexdef: string
      }>>`
        SELECT
          schemaname,
          tablename,
          indexname,
          indexdef
        FROM pg_indexes
        WHERE schemaname = 'public'
          AND tablename IN ('companies', 'sites', 'workers', 'attendance', 'payroll')
          AND indexname LIKE '%_idx'
        ORDER BY tablename, indexname
      `

      console.log(`Found ${indexes.length} performance indexes:\n`)

      const tables = ['companies', 'sites', 'workers', 'attendance', 'payroll']
      tables.forEach(table => {
        const tableIndexes = indexes.filter(idx => idx.tablename === table)
        if (tableIndexes.length > 0) {
          console.log(`📊 ${table}:`)
          tableIndexes.forEach(idx => {
            console.log(`   - ${idx.indexname}`)
          })
          console.log('')
        }
      })
    }

    console.log('✅ Index migration completed successfully!')

  } catch (error: any) {
    console.error('\n❌ Fatal error:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

runIndexMigration()
  .then(() => {
    console.log('\n🎉 All done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error)
    process.exit(1)
  })
