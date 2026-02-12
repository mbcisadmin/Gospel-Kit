import { MinistryPlatformClient, ProcedureService } from '@church/ministry-platform';

// Types for the stored procedure response
export interface UserProfileData {
  User: {
    ContactID: number;
    UserID: number;
    UserGUID: string;
    FirstName: string | null;
    Nickname: string | null;
    LastName: string | null;
    Email: string | null;
    MobilePhone: string | null;
    ImageGuid: string | null;
    HouseholdID: number | null;
  } | null;
  IsAdmin: boolean;
  Roles: string[];
  Address: {
    Line1: string | null;
    Line2: string | null;
    City: string | null;
    State: string | null;
    Zip: string | null;
  } | null;
  HouseholdMembers: HouseholdMember[];
}

export interface HouseholdMember {
  ContactID: number;
  FirstName: string | null;
  LastName: string | null;
  Position: string | null;
  Email: string | null;
  MobilePhone: string | null;
  Age: number | null;
  ImageGuid: string | null;
}

// API response type (with image URLs built)
export interface UserProfileResponse {
  user: {
    contactId: number;
    userId: number;
    userGuid: string;
    firstName: string | null;
    nickname: string | null;
    lastName: string | null;
    email: string | null;
    mobilePhone: string | null;
    imageUrl: string | null;
    householdId: number | null;
  } | null;
  isAdmin: boolean;
  roles: string[];
  address: {
    line1: string | null;
    line2: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
  } | null;
  householdMembers: {
    contactId: number;
    firstName: string | null;
    lastName: string | null;
    position: string | null;
    email: string | null;
    mobilePhone: string | null;
    age: number | null;
    imageUrl: string | null;
  }[];
}

/**
 * Get complete user profile including household and address
 * @param userGuid - The user's GUID from OAuth token
 * @param adminRoleId - Optional admin role ID to check
 * @returns Full user profile with address and household members
 */
export async function getUserProfile(
  userGuid: string,
  adminRoleId?: number | null
): Promise<UserProfileResponse | null> {
  const mpClient = new MinistryPlatformClient();
  const procedureService = new ProcedureService(mpClient);

  const result = (await procedureService.executeProcedureWithBody(
    'api_TheHub_GetUserProfile_JSON',
    {
      '@UserGUID': userGuid,
      '@AdminRoleID': adminRoleId ?? null,
    }
  )) as unknown as any[][];

  // Parse the JSON response
  let profileData: UserProfileData | null = null;

  if (result && result.length > 0 && Array.isArray(result[0]) && result[0].length > 0) {
    const resultObject = result[0][0];
    const jsonKey = Object.keys(resultObject)[0];
    const jsonString = resultObject[jsonKey];
    profileData = JSON.parse(jsonString) as UserProfileData;
  }

  if (!profileData?.User) {
    return null;
  }

  // Build image URLs
  const fileUrl = process.env.NEXT_PUBLIC_MINISTRY_PLATFORM_FILE_URL;

  const buildImageUrl = (guid: string | null): string | null => {
    if (!guid || !fileUrl) return null;
    return `${fileUrl}/${guid}`;
  };

  return {
    user: {
      contactId: profileData.User.ContactID,
      userId: profileData.User.UserID,
      userGuid: profileData.User.UserGUID,
      firstName: profileData.User.FirstName,
      nickname: profileData.User.Nickname,
      lastName: profileData.User.LastName,
      email: profileData.User.Email,
      mobilePhone: profileData.User.MobilePhone,
      imageUrl: buildImageUrl(profileData.User.ImageGuid),
      householdId: profileData.User.HouseholdID,
    },
    isAdmin: profileData.IsAdmin,
    roles: profileData.Roles,
    address: profileData.Address
      ? {
          line1: profileData.Address.Line1,
          line2: profileData.Address.Line2,
          city: profileData.Address.City,
          state: profileData.Address.State,
          zip: profileData.Address.Zip,
        }
      : null,
    householdMembers: profileData.HouseholdMembers.map((member) => ({
      contactId: member.ContactID,
      firstName: member.FirstName,
      lastName: member.LastName,
      position: member.Position,
      email: member.Email,
      mobilePhone: member.MobilePhone,
      age: member.Age,
      imageUrl: buildImageUrl(member.ImageGuid),
    })),
  };
}
