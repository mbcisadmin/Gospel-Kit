# Neon PostgreSQL Database

Neon database migrations and schema files for custom application data.

## When to Use Neon vs MinistryPlatform

**Use Neon for:**
- ✅ Widget-specific data (prayer requests, voting responses)
- ✅ Anonymous submissions (no MP Contact_ID)
- ✅ Session/cache data
- ✅ Analytics and event tracking
- ✅ Data that doesn't fit MP's table structure

**Use MinistryPlatform for:**
- ✅ Core church data (contacts, events, groups, giving)
- ✅ Data managed by staff in MP portal
- ✅ Data needed for MP reporting

## Migration Structure

```
neon/
└── migrations/
    ├── 001_create_prayer_requests.sql
    ├── 002_add_prayer_categories.sql
    └── 003_create_widget_sessions.sql
```

## Migration Naming Convention

Use numbered prefixes with descriptive names:
- `001_create_table_name.sql`
- `002_add_column_to_table.sql`
- `003_create_indexes.sql`

## Example Migration

```sql
-- Migration: 001_create_prayer_requests.sql
-- Purpose: Create prayer requests table for prayer widget
-- Date: 2024-12-06

CREATE TABLE IF NOT EXISTS prayer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category_id INTEGER,
  contact_id INTEGER, -- Optional: link to MP Contact_ID if authenticated
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_anonymous BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  prayer_count INTEGER DEFAULT 0
);

-- Indexes for performance
CREATE INDEX idx_prayer_requests_created_at ON prayer_requests(created_at DESC);
CREATE INDEX idx_prayer_requests_category ON prayer_requests(category_id);
CREATE INDEX idx_prayer_requests_approved ON prayer_requests(is_approved) WHERE is_approved = TRUE;

-- Comments for documentation
COMMENT ON TABLE prayer_requests IS 'Prayer requests submitted via prayer widget';
COMMENT ON COLUMN prayer_requests.contact_id IS 'Optional link to MinistryPlatform Contact_ID';
```

## Best Practices

1. **Make migrations idempotent**
   - Use `IF NOT EXISTS` for tables
   - Use `IF EXISTS` for drops
   - Check for existing data before inserts

2. **Include rollback scripts**
   - Create `down` migrations to undo changes
   - Test rollback before deployment

3. **Document migrations**
   - Add header comments explaining purpose
   - Comment complex logic
   - Document relationships to other tables

4. **Version control everything**
   - Commit migrations before running
   - Never modify existing migrations (create new ones)

## Running Migrations

### Option 1: Neon SQL Editor (Web UI)
1. Open Neon Console → SQL Editor
2. Copy/paste migration SQL
3. Run and verify

### Option 2: psql CLI
```bash
psql $DATABASE_URL -f migrations/001_create_prayer_requests.sql
```

### Option 3: Migration Tool (Future)
When Neon integration is set up, use a migration tool like:
- Drizzle Kit
- Prisma Migrate
- node-postgres with custom migration runner

## Connecting to Neon

Environment variable (set in Vercel or .env):
```
DATABASE_URL=postgresql://user:pass@ep-xyz.us-east-2.aws.neon.tech/dbname
```

## Example Use Cases

### Prayer Widget
- `prayer_requests` - Prayer submissions
- `prayer_responses` - Who prayed for what
- `prayer_categories` - Category lookup

### Voting/Polls
- `polls` - Poll/vote configuration
- `poll_responses` - Anonymous votes
- `poll_results` - Aggregated results

### Widget Analytics
- `widget_sessions` - Session tracking
- `widget_events` - User interactions
- `widget_performance` - Performance metrics

## Coming Soon

Neon integration will be added when the first widget or app needs custom database storage.
For now, use MinistryPlatform for all data storage.
