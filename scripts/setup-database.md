# 노무Pro - Supabase Database Setup Guide

## Step 1: Get Correct Connection Strings

1. Go to: https://supabase.com/dashboard/project/ejgsotsviobjfvfqovcj
2. Click on "Settings" (gear icon) in the left sidebar
3. Click on "Database"
4. Scroll to "Connection string" section
5. Copy the **Connection pooling** URL (Transaction mode)
6. Copy the **Direct connection** URL (Session mode)

### Update .env.local:

```env
# Use Transaction pooler for Prisma
DATABASE_URL=<your-connection-pooling-url>

# Use Direct connection for migrations
DIRECT_URL=<your-direct-connection-url>
```

**Note**: Replace `[YOUR-PASSWORD]` with: `Guswk0925!!`

## Step 2: Run Migrations via Supabase SQL Editor

Since direct database connection might be restricted, we'll use the Supabase SQL Editor:

1. Go to: https://supabase.com/dashboard/project/ejgsotsviobjfvfqovcj/editor
2. Click "New Query"
3. Copy and paste each migration file content in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/migrations/003_utility_functions.sql`
   - `supabase/migrations/004_realtime.sql`
4. Click "Run" for each migration

## Step 3: Verify Tables

After running migrations, verify in SQL Editor:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

Expected tables:
- attendance
- companies
- payroll
- profiles
- sites
- workers

## Step 4: Test Connection

Run the connection test script:

```bash
npm run test-db
```

## Step 5: Check Database Settings

Ensure the following in Supabase Dashboard:

### Database Settings:
- **IPv4 address**: Should be enabled
- **Pooler mode**: Transaction (for connection pooling)
- **Session pooler**: Enabled (for direct connections)

### Authentication:
- Email/Password auth should be enabled if you want to test user login

## Troubleshooting

### Connection Timeout Errors

If you get `ETIMEDOUT` or `P1001` errors:

1. **Check if database is paused**:
   - Dashboard > Database > Check if "Paused" status
   - If paused, click "Resume"

2. **Enable IPv4 Access**:
   - Dashboard > Settings > Database
   - Enable "IPv4 add-on" if available

3. **Check Firewall**:
   - Supabase might have IP restrictions
   - Try from different network if possible

4. **Use Supabase Client Instead**:
   - For production, consider using `@supabase/supabase-js` instead of direct Prisma connection
   - Supabase client works through HTTPS (port 443) which is more reliable

### Alternative: Use Prisma via Supabase Edge Functions

If direct connection doesn't work, you can:
1. Use Supabase SQL Editor for migrations (manual)
2. Use Supabase Client for queries in your app
3. Create database functions in SQL for complex operations

## Next Steps

Once connection is successful:
1. Run `npm run dev` to start development server
2. Test API endpoints
3. Verify CRUD operations work
