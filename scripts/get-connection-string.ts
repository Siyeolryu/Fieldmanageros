/**
 * Supabase 프로젝트의 올바른 연결 문자열 가져오기
 */

import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const PROJECT_REF = 'ejgsotsviobjfvfqovcj'
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN

async function getConnectionString() {
  if (!ACCESS_TOKEN) {
    console.log('❌ SUPABASE_ACCESS_TOKEN not found in .env.local')
    return false
  }

  try {
    // Get project details
    const projectResponse = await fetch(
      `https://api.supabase.com/v1/projects/${PROJECT_REF}`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!projectResponse.ok) {
      const error = await projectResponse.text()
      console.error('❌ Failed to fetch project:', projectResponse.status, error)
      return false
    }

    const project = await projectResponse.json()

    console.log('📊 Project Details:')
    console.log('  Name:', project.name)
    console.log('  ID:', project.id)
    console.log('  Region:', project.region)
    console.log('  Status:', project.status)
    console.log('  Database Host:', project.database?.host)
    console.log()

    // Get database settings
    const settingsResponse = await fetch(
      `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/database/postgres`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (settingsResponse.ok) {
      const settings = await settingsResponse.json()
      console.log('🔐 Database Settings:')
      console.log(JSON.stringify(settings, null, 2))
    }

    // Try to get connection pooler info
    const poolerResponse = await fetch(
      `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/database`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (poolerResponse.ok) {
      const pooler = await poolerResponse.json()
      console.log()
      console.log('🔌 Connection Pooler Info:')
      console.log(JSON.stringify(pooler, null, 2))
    }

    // Construct connection strings based on region
    const region = project.region
    const dbHost = project.database?.host || `db.${PROJECT_REF}.supabase.co`

    console.log()
    console.log('🔗 Suggested Connection Strings:')
    console.log()
    console.log('Direct Connection:')
    console.log(`  postgresql://postgres.${PROJECT_REF}:[YOUR-PASSWORD]@${dbHost}:5432/postgres`)
    console.log()
    console.log('Pooler Connection (Transaction):')
    console.log(`  postgresql://postgres.${PROJECT_REF}:[YOUR-PASSWORD]@aws-0-${region}.pooler.supabase.com:6543/postgres?pgbouncer=true`)
    console.log()
    console.log('Pooler Connection (Session):')
    console.log(`  postgresql://postgres.${PROJECT_REF}:[YOUR-PASSWORD]@aws-0-${region}.pooler.supabase.com:5432/postgres`)

    return true

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    return false
  }
}

getConnectionString()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
