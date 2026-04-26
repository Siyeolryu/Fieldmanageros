/**
 * Supabase Management API를 통해 정확한 데이터베이스 설정 가져오기
 */

import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const PROJECT_REF = 'ejgsotsviobjfvfqovcj'
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN

async function getDatabaseConfig() {
  if (!ACCESS_TOKEN) {
    console.log('❌ SUPABASE_ACCESS_TOKEN not found')
    return false
  }

  try {
    console.log('🔍 Fetching database configuration from Management API...\n')

    // Get project settings
    const settingsResponse = await fetch(
      `https://api.supabase.com/v1/projects/${PROJECT_REF}/config`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (settingsResponse.ok) {
      const settings = await settingsResponse.json()
      console.log('📊 Project Config:')
      console.log(JSON.stringify(settings, null, 2))
      console.log()
    }

    // Get database config specifically
    const dbConfigResponse = await fetch(
      `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/database/postgres`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (dbConfigResponse.ok) {
      const dbConfig = await dbConfigResponse.json()
      console.log('🗄️  Database Config:')
      console.log(JSON.stringify(dbConfig, null, 2))
      console.log()
    }

    // Get API settings (might contain connection info)
    const apiResponse = await fetch(
      `https://api.supabase.com/v1/projects/${PROJECT_REF}/api`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (apiResponse.ok) {
      const api = await apiResponse.json()
      console.log('🔌 API Settings:')
      console.log(JSON.stringify(api, null, 2))
      console.log()
    }

    // List all available endpoints
    const endpoints = [
      '/config',
      '/config/database',
      '/config/database/postgres',
      '/database',
      '/database/connection-string',
      '/settings',
      '/settings/database',
      '/api'
    ]

    console.log('🔧 Testing additional endpoints...\n')
    for (const endpoint of endpoints) {
      const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}${endpoint}`
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ ${endpoint}:`)
        console.log(JSON.stringify(data, null, 2))
        console.log()
      } else {
        console.log(`❌ ${endpoint}: ${response.status}`)
      }
    }

    return true

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    return false
  }
}

getDatabaseConfig()
  .then(success => process.exit(success ? 0 : 1))
  .catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
