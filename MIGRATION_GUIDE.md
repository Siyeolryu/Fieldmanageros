# 노무Pro - Database Migration Guide

## Current Status

✅ **Supabase Project**: https://ejgsotsviobjfvfqovcj.supabase.co
✅ **Connection**: Working (via HTTPS)
⚠️ **Database**: Partial (2/6 tables exist)
🔧 **Action Required**: Run full migration script

## Existing Tables
- workers
- attendance

## Missing Tables
- profiles
- companies
- sites
- payroll

---

## Step-by-Step Migration Instructions

### Step 1: Open Supabase SQL Editor

1. Click this link: [Supabase SQL Editor](https://supabase.com/dashboard/project/ejgsotsviobjfvfqovcj/editor)
2. Login if prompted (password: Guswk0925!!)
3. Click "New Query" button

### Step 2: Copy Migration SQL

1. Open this file: `C:\Users\tlduf\.cursor\projects\dev3_nomu\scripts\combined-migrations.sql`
2. **Copy the ENTIRE contents** (Ctrl+A, then Ctrl+C)

### Step 3: Execute Migration

1. Paste the SQL into the Supabase SQL Editor (Ctrl+V)
2. Click the "Run" button (or press Ctrl+Enter)
3. Wait for execution to complete (should take 5-10 seconds)
4. Check for success message

### Step 4: Verify Migration

Run this command in your terminal:

```bash
npm run db:test-supabase
```

You should see:
```
✅ All required tables exist!
```

### Step 5: Test API Endpoints

Start the development server:

```bash
npm run dev
```

Then test endpoints:
- http://localhost:3000/api/sites
- http://localhost:3000/api/workers
- http://localhost:3000/api/attendance

---

## Alternative: Manual Table Creation

If the combined migration fails, you can run migrations one by one:

### Migration 1: Initial Schema
```bash
# Copy from: supabase/migrations/001_initial_schema.sql
```

### Migration 2: RLS Policies
```bash
# Copy from: supabase/migrations/002_rls_policies.sql
```

### Migration 3: Utility Functions
```bash
# Copy from: supabase/migrations/003_utility_functions.sql
```

### Migration 4: Realtime
```bash
# Copy from: supabase/migrations/004_realtime.sql
```

---

## Troubleshooting

### Error: "already exists"
This is OK! It means the table was created previously. The migration script is designed to skip existing objects.

### Error: "relation does not exist"
This usually means:
1. Migration wasn't run completely
2. RLS policies are blocking access
3. Wrong database selected

**Solution**: Make sure you're in the correct Supabase project and run the full migration script.

### Error: "permission denied"
**Solution**: Make sure you're logged in as the project owner.

### Connection Timeout
If direct database connection times out, this is normal. Use the Supabase SQL Editor instead.

---

## Post-Migration Checklist

After successful migration, verify:

- [ ] All 6 tables exist (profiles, companies, sites, workers, attendance, payroll)
- [ ] RLS policies are enabled
- [ ] Triggers are created
- [ ] Indexes are created
- [ ] API endpoints return 200 status (even if empty array)

---

## Next Steps After Migration

1. **Update Service Role Key**
   - Go to: Settings > API
   - Copy `service_role` key
   - Update `.env.local`:
     ```
     SUPABASE_SERVICE_ROLE_KEY=eyJhb...your-actual-key
     ```

2. **Create Test Data**
   ```bash
   npm run db:seed  # (if seed script exists)
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Test Authentication**
   - Sign up a test user
   - Verify profile is created automatically

---

## Migration SQL Location

Main migration file:
```
C:\Users\tlduf\.cursor\projects\dev3_nomu\scripts\combined-migrations.sql
```

Individual migration files:
```
C:\Users\tlduf\.cursor\projects\dev3_nomu\supabase\migrations\
├── 001_initial_schema.sql
├── 002_rls_policies.sql
├── 003_utility_functions.sql
└── 004_realtime.sql
```

---

## Support

If you encounter issues:
1. Check Supabase logs: Dashboard > Database > Logs
2. Run test script: `npm run db:test-supabase`
3. Verify environment variables in `.env.local`
