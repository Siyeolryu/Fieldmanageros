/**
 * Supabase 데이터베이스 비밀번호 재설정
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { readFileSync, writeFileSync } from 'fs'

config({ path: resolve(process.cwd(), '.env.local') })

const PROJECT_REF = 'ejgsotsviobjfvfqovcj'
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN

async function resetDatabasePassword() {
  if (!ACCESS_TOKEN) {
    console.log('❌ SUPABASE_ACCESS_TOKEN not found in .env.local')
    return false
  }

  console.log('🔐 Resetting database password...\n')

  try {
    // Generate a new secure password
    const newPassword = generateSecurePassword()

    console.log('Generated new password:', newPassword)
    console.log()

    // Reset database password via API
    const response = await fetch(
      `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/password`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: newPassword
        })
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('❌ Failed to reset password:', response.status, error)

      // Try alternative endpoint
      console.log('\n🔄 Trying alternative method...\n')

      const altResponse = await fetch(
        `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/database`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            db_password: newPassword
          })
        }
      )

      if (!altResponse.ok) {
        const altError = await altResponse.text()
        console.error('❌ Alternative method also failed:', altResponse.status, altError)
        console.log('\n⚠️  Password reset via API is not available.')
        console.log('Please reset manually in Supabase dashboard:')
        console.log(`  1. Visit: https://supabase.com/dashboard/project/${PROJECT_REF}/settings/database`)
        console.log('  2. Scroll to "Database Password"')
        console.log('  3. Click "Reset Database Password"')
        console.log('  4. Copy the new password')
        console.log('  5. Update .env.local with the new password')
        return false
      }
    }

    console.log('✅ Database password reset successfully!')
    console.log()
    console.log('📝 Updating .env.local...')

    // Update .env.local with new password
    const envPath = resolve(process.cwd(), '.env.local')
    let envContent = readFileSync(envPath, 'utf-8')

    const region = 'aws-0-ap-northeast-1'
    const encodedPassword = encodeURIComponent(newPassword)

    // Update DATABASE_URL
    const newDatabaseUrl = `postgresql://postgres.${PROJECT_REF}:${encodedPassword}@${region}.pooler.supabase.com:6543/postgres?pgbouncer=true`
    const newDirectUrl = `postgresql://postgres.${PROJECT_REF}:${encodedPassword}@${region}.pooler.supabase.com:5432/postgres`

    envContent = envContent.replace(
      /DATABASE_URL=".*"/,
      `DATABASE_URL="${newDatabaseUrl}"`
    )

    envContent = envContent.replace(
      /DIRECT_URL=".*"/,
      `DIRECT_URL="${newDirectUrl}"`
    )

    writeFileSync(envPath, envContent)

    console.log('✅ .env.local updated with new password')
    console.log()
    console.log('🔑 New Database Password:', newPassword)
    console.log()
    console.log('⚠️  IMPORTANT: Save this password in a secure location!')
    console.log()
    console.log('🔄 Next steps:')
    console.log('  1. Wait 30 seconds for password to propagate')
    console.log('  2. Run: npx prisma generate')
    console.log('  3. Test: npx tsx scripts/test-connection.ts')

    return true

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    return false
  }
}

function generateSecurePassword(): string {
  const length = 24
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''

  // Ensure at least one of each type
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]
  password += '0123456789'[Math.floor(Math.random() * 10)]
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)]

  // Fill the rest
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)]
  }

  // Shuffle
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

resetDatabasePassword()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
