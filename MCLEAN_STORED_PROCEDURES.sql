-- ================================================================================
-- McLean Bible Church - Required Stored Procedures for Gospel Kit Apps Platform
-- ================================================================================
--
-- This file contains all stored procedures needed for the apps platform to work.
-- Execute these scripts in SQL Server Management Studio (SSMS) on the
-- MinistryPlatform database.
--
-- After creating these procedures, they must also be registered in MP to the Administrator Security Role:
-- ================================================================================

-- ================================================================================
-- 1. api_Custom_GetUserRolesAndGroups_JSON
-- ================================================================================
-- PURPOSE: Fetches all roles and groups for a user during authentication
-- CRITICAL: Required for login to work - authentication will fail without this
-- CALLED BY: @church/nextjs-auth package during every session
-- ================================================================================

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

-- Grant permissions to API user
GRANT EXECUTE ON [dbo].[api_Custom_GetUserRolesAndGroups_JSON] TO [APIUser];
GO

-- ================================================================================
-- TEST THE PROCEDURE:
-- Replace 'YOUR-USER-GUID-HERE' with an actual User_GUID from dp_Users table
-- ================================================================================
-- EXEC [dbo].[api_Custom_GetUserRolesAndGroups_JSON]
--     @UserGUID = 'YOUR-USER-GUID-HERE';
-- ================================================================================


-- ================================================================================
-- 2. api_Custom_GetCongregationsWithSVG
-- ================================================================================
-- PURPOSE: Fetches active congregations/campuses for campus selection
-- OPTIONAL: Only needed if using the Counter app or multi-campus features
-- CALLED BY: Counter app and other campus-aware micro-apps
-- ================================================================================

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

-- Grant permissions to API user
GRANT EXECUTE ON [dbo].[api_Custom_GetCongregationsWithSVG] TO [APIUser];
GO

-- ================================================================================
-- TEST THE PROCEDURE:
-- ================================================================================
-- EXEC [dbo].[api_Custom_GetCongregationsWithSVG];
-- ================================================================================


-- ================================================================================
-- AFTER RUNNING THESE SCRIPTS:
-- ================================================================================
--
-- 1. Verify both procedures exist:
--    SELECT name FROM sys.procedures WHERE name LIKE 'api_Custom%'
--
-- 2. Register in MinistryPlatform Admin Console:
--    a. Log into MP Admin Console
--    b. Navigate to: Platform Tools → API Procedures
--    c. Click "Create New" for each procedure:
--
--       Procedure 1:
--       - Procedure Name: api_Custom_GetUserRolesAndGroups_JSON
--       - Description: Get all roles and groups for user authentication
--       - Save
--
--       Procedure 2:
--       - Procedure Name: api_Custom_GetCongregationsWithSVG
--       - Description: Get active congregations for campus selection
--       - Save
--
-- 3. Verify table permissions for API user:
--    The API user needs SELECT permission on:
--    - dp_Users
--    - dp_User_Roles
--    - dp_Roles
--    - dp_User_User_Groups
--    - dp_User_Groups
--    - Congregations
--
-- 4. Test the connection:
--    Run: node test-stored-procedures.mjs
--
-- ================================================================================
