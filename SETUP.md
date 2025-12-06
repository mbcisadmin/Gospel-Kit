# Church Setup Guide

This guide walks through setting up Gospel Kit for a new church, from repository creation to first deployment.

**Estimated Time:** 2-3 hours for complete setup

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] MinistryPlatform instance URL (e.g., `https://yourchurch.ministryplatform.com`)
- [ ] MP Admin access to create OAuth clients
- [ ] MP Admin access to create/register stored procedures
- [ ] SQL Server Management Studio (SSMS) access to MP database
- [ ] Node.js 20+ installed (`node --version`)
- [ ] Git installed
- [ ] GitHub account (for version control)
- [ ] Vercel account (for hosting) - optional but recommended
- [ ] Domain name for apps platform (e.g., `apps.yourchurch.org`)

---

## 🚀 Phase 1: Repository Setup

### Step 1: Clone the Template

```bash
# Clone the template
git clone <gospel-kit-template-url> yourchurch-apps
cd yourchurch-apps

# Remove template's git history
rm -rf .git

# Initialize fresh repository
git init
git add .
git commit -m "Initial commit from Gospel Kit template"
```

### Step 2: Customize Workspace Scope (Optional)

If you want to rename packages from `@church/*` to `@yourchurch/*`:

```bash
# Find and replace in all package.json files
find . -name "package.json" -type f -exec sed -i '' 's/@church/@yourchurch/g' {} \;

# Find and replace in all TypeScript files
find . -name "*.ts" -o -name "*.tsx" -type f -exec sed -i '' 's/@church/@yourchurch/g' {} \;
```

### Step 3: Install Dependencies

```bash
npm install
```

This installs all packages and links the monorepo workspaces.

### Step 4: Push to GitHub

```bash
# Create new repository on GitHub first, then:
git remote add origin https://github.com/yourchurch/apps.git
git branch -M main
git push -u origin main
```

---

## 🔐 Phase 2: MinistryPlatform Configuration

### Step 5: Create OAuth Client

1. Log into MinistryPlatform Admin Console
2. Navigate to **Platform Settings** → **OAuth Clients**
3. Click **Create New Client**
4. Configure:
   - **Client Name:** "Church Apps Platform"
   - **Client ID:** (auto-generated - save this)
   - **Client Secret:** (auto-generated - **save this securely**)
   - **Redirect URIs:**
     ```
     http://localhost:3000/api/auth/callback/ministryplatform
     https://apps.yourchurch.org/api/auth/callback/ministryplatform
     ```
   - **Scopes:**
     ```
     openid
     offline_access
     http://www.thinkministry.com/dataplatform/scopes/all
     ```
   - **Grant Types:**
     - Authorization Code
     - Client Credentials
     - Refresh Token

5. **Save** and note the Client ID and Secret

### Step 6: Create Required Stored Procedures

#### a) User Roles Procedure

Open SSMS and connect to your MP database, then run:

```sql
-- File: database/customizations/stored-procedures/api_Custom_GetUserRolesAndGroups_JSON.sql

CREATE OR ALTER PROCEDURE [dbo].[api_Custom_GetUserRolesAndGroups_JSON]
    @UserGUID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    SELECT DISTINCT r.Role_Name AS Roles
    FROM dp_Users u
    -- Security Roles
    LEFT JOIN dp_User_Roles ur ON u.User_ID = ur.User_ID
    LEFT JOIN dp_Roles r ON ur.Role_ID = r.Role_ID
    WHERE u.User_GUID = @UserGUID

    UNION

    SELECT ug.User_Group_Name AS Roles
    FROM dp_Users u
    -- User Groups
    LEFT JOIN dp_User_User_Groups uug ON u.User_ID = uug.User_ID
    LEFT JOIN dp_User_Groups ug ON uug.User_Group_ID = ug.User_Group_ID
    WHERE u.User_GUID = @UserGUID
    FOR JSON PATH;
END
GO

-- Grant permissions
GRANT EXECUTE ON [dbo].[api_Custom_GetUserRolesAndGroups_JSON] TO [APIUser];
GO
```

**Test it:**
```sql
-- Replace with actual User_GUID from dp_Users table
EXEC [dbo].[api_Custom_GetUserRolesAndGroups_JSON]
    @UserGUID = 'YOUR-USER-GUID-HERE';
```

#### b) Register Procedures in MP

1. In MP Admin Console, go to **Platform Tools** → **API Procedures**
2. Click **Create New**
3. Add:
   - **Procedure Name:** `api_Custom_GetUserRolesAndGroups_JSON`
   - **Description:** "Get all roles and groups for user authentication"
4. Save

### Step 7: Configure Table Permissions

Ensure your API user has permissions on these tables:
- `dp_Users`
- `dp_User_Roles`
- `dp_Roles`
- `dp_User_User_Groups`
- `dp_User_Groups`
- `Events` (for Counter app)
- `Congregations` (for campus selection)
- Any custom tables you'll create

---

## ⚙️ Phase 3: Application Configuration

### Step 8: Environment Variables

Create environment file at the **monorepo root**:

```bash
# From gospel-kit-template root directory
cp .env.example .env
```

**Why at root?** Environment variables are workspace-wide and shared across all apps. This matches the Vercel team-wide environment variables strategy.

Edit `.env`:

```env
# MinistryPlatform API
MINISTRY_PLATFORM_BASE_URL=https://yourchurch.ministryplatform.com
MINISTRY_PLATFORM_CLIENT_ID=your-client-id-from-step-5
MINISTRY_PLATFORM_CLIENT_SECRET=your-client-secret-from-step-5

# NextAuth
NEXTAUTH_SECRET=<run: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000

# Optional: Node Environment
NODE_ENV=development
```

Generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### Step 9: Branding Customization

Update branding colors in `apps/platform/src/app/globals.css`:

```css
:root {
  /* Church Branding Colors - Customize these for your church */
  --brand-primary: #61bc47;    /* Your primary brand color */
  --brand-secondary: #1c2b39;  /* Your secondary brand color */
}
```

Update church name:
1. Search for "Woodside Bible Church" and replace
2. Update page titles in components
3. Update PWA manifest in `apps/platform/src/app/api/manifest/route.ts`

### Step 10: Test Locally

```bash
# From monorepo root
npm run dev
```

Visit `http://localhost:3000`:
- [ ] Platform loads without errors
- [ ] Can sign in with MP credentials
- [ ] User menu shows your name and roles
- [ ] Counter app is accessible (if you have Events data)

**Troubleshooting:** If issues, run:
```bash
/mp-troubleshoot
```

---

## 🗄️ Phase 4: Custom Features (Optional)

### Step 11: Counter App Setup (Optional)

If you want to use the Counter app, you need:

#### a) Custom Table: Event_Metrics

```sql
-- File: database/customizations/tables/Event_Metrics.sql

CREATE TABLE [dbo].[Event_Metrics] (
    [Event_Metric_ID] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [Event_ID] INT NOT NULL,
    [Metric_ID] INT NOT NULL,
    [Numerical_Value] INT NOT NULL,
    [Group_ID] INT NULL,
    [Created_Date] DATETIME NOT NULL DEFAULT GETDATE(),
    [Created_By] INT NOT NULL,
    [Modified_Date] DATETIME NULL,
    [Modified_By] INT NULL,
    [Domain_ID] INT NOT NULL DEFAULT 1,
    CONSTRAINT [FK_Event_Metrics_Events]
        FOREIGN KEY ([Event_ID]) REFERENCES [dbo].[Events]([Event_ID]),
    CONSTRAINT [FK_Event_Metrics_Metrics]
        FOREIGN KEY ([Metric_ID]) REFERENCES [dbo].[Metrics]([Metric_ID])
);
GO

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON [dbo].[Event_Metrics] TO [APIUser];
GO
```

#### b) Metrics Table (if not exists)

```sql
CREATE TABLE [dbo].[Metrics] (
    [Metric_ID] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [Metric_Title] NVARCHAR(255) NOT NULL,
    [Is_Headcount] BIT NULL,
    [Domain_ID] INT NOT NULL DEFAULT 1
);
GO

-- Add default metrics
INSERT INTO [dbo].[Metrics] (Metric_Title, Is_Headcount, Domain_ID)
VALUES
    ('Total Attendance', 1, 1),
    ('First Time Guests', 0, 1),
    ('Salvations', 0, 1);
GO
```

#### c) Congregations Stored Procedure

```sql
-- File: database/customizations/stored-procedures/api_Custom_GetCongregationsWithSVG.sql

CREATE OR ALTER PROCEDURE [dbo].[api_Custom_GetCongregationsWithSVG]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        c.Congregation_ID,
        c.Congregation_Name,
        c.Start_Date,
        c.End_Date
    FROM Congregations c
    WHERE c.Start_Date <= GETDATE()
      AND (c.End_Date IS NULL OR c.End_Date >= GETDATE())
    ORDER BY c.Congregation_Name
    FOR JSON PATH;
END
GO

GRANT EXECUTE ON [dbo].[api_Custom_GetCongregationsWithSVG] TO [APIUser];
GO
```

Register in MP Admin Console → API Procedures.

---

## 🚀 Phase 5: Deployment

### Step 12: Deploy to Vercel

#### a) Connect Repository

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure build settings:
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/platform`
   - **Build Command:** `cd ../.. && npm run build --filter=@church/apps-platform`
   - **Install Command:** `npm install`
   - **Output Directory:** `.next` (default)

#### b) Set Environment Variables

**Recommended Approach: Team-Wide + Project-Specific**

Since you'll likely have multiple projects (apps platform, microsites, etc.) sharing the same MinistryPlatform instance:

1. **Team Settings** → **Environment Variables** (shared across all projects):
   - `MINISTRY_PLATFORM_BASE_URL=https://yourchurch.ministryplatform.com`
   - `MINISTRY_PLATFORM_CLIENT_ID=<your-client-id>`
   - `MINISTRY_PLATFORM_CLIENT_SECRET=<your-client-secret>`

2. **Project Settings** → **Environment Variables** (unique per project):
   - `NEXTAUTH_SECRET=<your-generated-secret>`
   - `NEXTAUTH_URL=https://apps.yourchurch.org` (or specific project URL)
   - `NODE_ENV=production`

**Why this approach?**
- MP credentials are shared across all your church's apps
- Each app has its own auth secret and URL
- No duplication when you add microsites, widgets, etc.

**Important:** Use different `NEXTAUTH_SECRET` for each project/environment!

#### c) Deploy

Click **Deploy** and wait for build to complete.

### Step 13: Configure Custom Domain

1. In Vercel dashboard → Settings → Domains
2. Add your domain: `apps.yourchurch.org`
3. Follow Vercel's DNS instructions to point your domain
4. Wait for SSL certificate to provision (~10 minutes)

### Step 14: Update MP OAuth Redirect

Now that you have your production URL:

1. Go back to MP Admin Console → OAuth Clients
2. Edit your OAuth client
3. Ensure redirect URI includes:
   ```
   https://apps.yourchurch.org/api/auth/callback/ministryplatform
   ```
4. Save

### Step 15: Test Production

Visit `https://apps.yourchurch.org`:
- [ ] Platform loads over HTTPS
- [ ] SSL certificate is valid
- [ ] Can sign in with MP credentials
- [ ] All functionality works as in local development

---

## 📱 Phase 6: PWA Setup (Optional)

### Step 16: Create App Icons

Create icons in these sizes:
- `192x192` - Standard icon
- `512x512` - Large icon
- `180x180` - Apple touch icon

Place in `apps/platform/public/`:
- `/icon-192.png`
- `/icon-512.png`
- `/apple-touch-icon.png`

### Step 17: Update Manifest

Edit `apps/platform/src/app/api/manifest/route.ts`:

```typescript
name: "Your Church Apps",
short_name: "Church Apps",
description: "Ministry applications for Your Church Name",
```

### Step 18: Test PWA Installation

On mobile device:
1. Visit `https://apps.yourchurch.org`
2. Look for "Add to Home Screen" prompt
3. Install and test as standalone app

---

## 📊 Phase 7: Add to Applications Table (Optional)

To show apps in the main dashboard, add them to your database:

```sql
CREATE TABLE [dbo].[Applications] (
    [Application_ID] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [Application_Name] NVARCHAR(255) NOT NULL,
    [Application_Key] NVARCHAR(100) NOT NULL,
    [Description] NVARCHAR(500) NULL,
    [Icon] NVARCHAR(100) NULL,  -- Lucide icon name
    [Route] NVARCHAR(255) NOT NULL,
    [Sort_Order] INT NOT NULL DEFAULT 0,
    [Requires_Authentication] BIT NOT NULL DEFAULT 1,
    [Domain_ID] INT NOT NULL DEFAULT 1
);
GO

-- Add Counter app
INSERT INTO [dbo].[Applications]
    (Application_Name, Application_Key, Description, Icon, Route, Sort_Order)
VALUES
    ('Counter', 'counter', 'Track event metrics in real-time', 'Activity', '/counter', 1);
GO
```

Then create API route at `apps/platform/src/app/api/applications/route.ts` to fetch these.

---

## ✅ Post-Setup Checklist

After completing setup:

- [ ] All environment variables are set correctly
- [ ] OAuth client is configured in MP
- [ ] Required stored procedures are created and registered
- [ ] Can sign in and see user roles
- [ ] Production deployment is live and working
- [ ] Custom domain is configured with SSL
- [ ] Team members have been granted MP access
- [ ] Backup of environment variables stored securely
- [ ] Documentation updated with church-specific notes

---

## 🎓 Next Steps

### Learn the Skills

Familiarize yourself with Claude skills:
```bash
/new-micro-app      # Create your first custom app
/new-api-route      # Add API endpoints
/new-entity         # Define data schemas
/new-stored-proc    # Create MP procedures
/mp-troubleshoot    # Debug issues
```

### Create Your First App

Use the skill to scaffold a new micro-app:
```bash
/new-micro-app
```

Example apps to build:
- **Volunteer Scheduler** - Sign-ups for serving teams
- **Prayer Requests** - Submit and manage prayer needs
- **Small Groups** - Browse and join groups
- **Giving Dashboard** - View contribution history
- **Event Check-in** - QR code attendance tracking

### Customize Further

- Add your church's fonts
- Customize the theme colors
- Add church logo to header
- Create custom email templates
- Set up analytics (Google Analytics, etc.)

---

## 🐛 Common Setup Issues

### "401 Unauthorized" on Login

**Cause:** OAuth configuration mismatch

**Fix:**
1. Verify `MINISTRY_PLATFORM_CLIENT_ID` and `CLIENT_SECRET` are correct
2. Check redirect URI in MP exactly matches your app URL
3. Ensure scopes include `openid`, `offline_access`, and MP API scope

### "Failed to fetch roles"

**Cause:** Stored procedure not registered or wrong name

**Fix:**
1. Verify `api_Custom_GetUserRolesAndGroups_JSON` exists in database
2. Check it's registered in MP Admin Console → API Procedures
3. Test procedure directly in SSMS with your User_GUID

### Build Fails on Vercel

**Cause:** Workspace dependencies not resolving

**Fix:**
1. Ensure build command includes `cd ../..` to run from monorepo root
2. Verify all `@church/*` packages are in `package.json` dependencies
3. Check build logs for specific TypeScript errors

### Counter App Shows No Events

**Cause:** Missing data or permissions

**Fix:**
1. Ensure Events table has data for today's date
2. Check API user has SELECT permission on Events table
3. Verify Event_Type_ID filter matches your MP data

---

## 📞 Getting Help

If you encounter issues:

1. **Check the skills:** Run `/mp-troubleshoot` for common problems
2. **Review logs:** Check Vercel deployment logs and browser console
3. **Test MP directly:** Use Postman or MP's API Console
4. **Simplify:** Create minimal reproduction case
5. **SQL Server Profiler:** Watch actual queries being executed

---

## 🎉 You're Ready!

Your Gospel Kit instance is now set up and ready for development. Start building custom apps for your church!

**Remember:**
- Always test locally before deploying
- Use TypeScript types from `@church/database`
- Enforce userId on all CREATE/UPDATE operations
- Follow the patterns in the Counter app
- Use Claude skills to accelerate development

Happy building! 🚀
