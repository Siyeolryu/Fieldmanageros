/**
 * Supabase 프로젝트 자동 재시작 스크립트
 *
 * 사용 방법:
 * 1. Supabase 대시보드에서 Access Token 발급
 *    https://supabase.com/dashboard/account/tokens
 * 2. .env.local에 추가: SUPABASE_ACCESS_TOKEN=your_token_here
 * 3. 이 스크립트 실행: npx tsx scripts/resume-supabase-project.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const PROJECT_REF = 'ejgsotsviobjfvfqovcj'
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN

async function resumeProject() {
  if (!ACCESS_TOKEN) {
    console.log('❌ SUPABASE_ACCESS_TOKEN not found in .env.local')
    console.log('\n📋 To get your access token:')
    console.log('  1. Visit: https://supabase.com/dashboard/account/tokens')
    console.log('  2. Click "Generate New Token"')
    console.log('  3. Name it "CLI Access" and generate')
    console.log('  4. Copy the token')
    console.log('  5. Add to .env.local: SUPABASE_ACCESS_TOKEN=your_token_here')
    console.log('  6. Run this script again\n')
    return false
  }

  console.log('🔍 Checking project status...\n')

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
    console.log('📊 Project Status:', project.status)
    console.log('📊 Project Name:', project.name)
    console.log('📊 Project Region:', project.region)

    if (project.status === 'ACTIVE_HEALTHY') {
      console.log('\n✅ Project is already active and healthy!')
      console.log('The database connection issue might be caused by something else.')
      console.log('\n💡 Try:')
      console.log('  1. Check if password is correct')
      console.log('  2. Verify connection string format')
      console.log('  3. Check firewall/network settings')
      return true
    }

    if (project.status === 'INACTIVE' || project.status === 'PAUSED') {
      console.log('\n⏸️  Project is paused. Attempting to resume...\n')

      const resumeResponse = await fetch(
        `https://api.supabase.com/v1/projects/${PROJECT_REF}/restore`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!resumeResponse.ok) {
        const error = await resumeResponse.text()
        console.error('❌ Failed to resume project:', resumeResponse.status, error)
        return false
      }

      console.log('✅ Project resume initiated!')
      console.log('\n⏳ Please wait 1-2 minutes for the project to fully start...')
      console.log('\nThen run: npx tsx scripts/test-connection.ts')

      return true
    }

    console.log('\n⚠️  Unknown project status:', project.status)
    return false

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    return false
  }
}

resumeProject()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
