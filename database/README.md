# Database

SQL scripts, migrations, and database documentation organized by database system.

## Structure

```
database/
├── ministry-platform/    # MinistryPlatform SQL files
│   ├── baseline/         # Reference SQL for MP built-in tables
│   ├── customizations/   # SQL for custom MP tables and fields
│   └── migrations/       # One-time migration scripts
└── neon/                 # Neon PostgreSQL files
    └── migrations/       # Neon schema migrations
```

## MinistryPlatform (`ministry-platform/`)

### `baseline/`
Reference SQL documentation for MinistryPlatform's built-in tables that you use:
- View definitions
- Field documentation
- Relationships

**Example:** `baseline/dp_Events.sql` - Documents the Events table structure

### `customizations/`
SQL to create your church-specific customizations in MinistryPlatform:
- Custom tables
- Custom fields added to MP tables
- Custom stored procedures
- Custom views

**Example:** `customizations/create_event_metrics_table.sql`

### `migrations/`
One-time migration scripts for updating existing data:
- Data transformations
- Bulk updates
- Historical data fixes

**Example:** `migrations/2024-12-01-migrate-old-metrics.sql`

## Neon PostgreSQL (`neon/`)

### `migrations/`
Schema migrations for Neon database:
- Table creation
- Schema changes
- Indexes and constraints

**Example:** `neon/migrations/001_create_prayer_requests.sql`

**Use Neon for:**
- Widget-specific data (prayer requests, voting)
- Anonymous submissions
- Session/cache data
- Analytics and tracking
- Data that doesn't fit MP's structure

## Best Practices

### MinistryPlatform SQL
- ✅ Always include `Domain_ID` in custom tables
- ✅ Document field purposes and constraints
- ✅ Version control all customizations
- ✅ Test in development MP instance first

### Neon Migrations
- ✅ Use numbered prefixes (001_, 002_, etc.)
- ✅ Include rollback scripts
- ✅ Make migrations idempotent (can run multiple times safely)
- ✅ Document migration purpose in comments

## Running SQL

### MinistryPlatform
Run SQL via:
1. MinistryPlatform admin portal (Tools → SQL Query)
2. Direct SSMS/SQL Server connection
3. Stored procedure creation via API

### Neon
Run migrations via:
1. Neon SQL Editor (web UI)
2. `psql` CLI
3. Migration tools (Drizzle, Prisma, etc.)

## Environment-Specific Notes

- **Development:** Test all SQL in dev MP instance first
- **Production:** Review all SQL with team before running
- **Backup:** Always backup before running migrations
