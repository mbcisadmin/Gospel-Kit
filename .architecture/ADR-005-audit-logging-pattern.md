# ADR-005: Audit Logging Pattern

**Status**: Accepted
**Date**: 2024-12-05

## Context

MinistryPlatform requires audit logging for stored procedure calls. Every stored procedure that modifies data requires a `$userId` parameter to track who made the change.

**Problem:** Developers might forget to pass `$userId`, causing:
- Runtime errors (MP rejects the call)
- Audit trail gaps (changes not attributed correctly)
- Security issues (bypassing audit logging)

**Requirements:**
- Enforce `$userId` at compile time (not runtime)
- Make it impossible to forget
- Clear error messages when missing
- Minimal developer friction

## Decision

**Use TypeScript types to enforce `$userId` parameter at compile time.**

**Implementation:**

### 1. Zod Schemas Include $userId

All data modification schemas include `$userId`:

```typescript
// packages/core/database/src/schemas/contacts.ts
import { z } from 'zod';

export const updateContactSchema = z.object({
  Contact_ID: z.number(),
  First_Name: z.string(),
  Last_Name: z.string(),
  Email_Address: z.string().email().nullable(),
  $userId: z.number(), // Required for audit logging
});

export type UpdateContactInput = z.infer<typeof updateContactSchema>;
```

### 2. Service Functions Require userId Parameter

Service layer functions take `userId` as separate parameter:

```typescript
// apps/platform/src/services/contactService.ts
import { updateContactSchema, UpdateContactInput } from '@church/database';

export async function updateContact(
  data: Omit<UpdateContactInput, '$userId'>, // Data without $userId
  userId: number                              // userId required separately
) {
  // Merge data with userId for MP call
  const payload = updateContactSchema.parse({
    ...data,
    $userId: userId,
  });

  return await mp.storedProcedure('api_UpdateContact', payload);
}
```

### 3. API Routes Get userId from Session

```typescript
// apps/platform/src/app/api/contacts/route.ts
import { auth } from '@/auth';
import { updateContact } from '@/services/contactService';

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const data = await request.json();

  // userId comes from authenticated session
  const result = await updateContact(data, session.contactId);

  return Response.json(result);
}
```

### 4. TypeScript Enforces at Compile Time

**This fails at compile time:**
```typescript
// ❌ TypeScript error: Argument of type '{ Contact_ID: number }'
// is not assignable to parameter of type 'number'
await updateContact({ Contact_ID: 123 }); // Missing userId!
```

**This compiles:**
```typescript
// ✅ TypeScript happy
await updateContact({ Contact_ID: 123, First_Name: 'John' }, userId);
```

## Consequences

### Positive Consequences

✅ **Compile-time safety** - Can't forget `$userId`
✅ **Clear errors** - TypeScript tells you exactly what's missing
✅ **Impossible to bypass** - No way to call service without userId
✅ **Self-documenting** - Types show what's required
✅ **Runtime validation** - Zod validates `$userId` is a number
✅ **Audit compliance** - All MP changes are tracked

### Negative Consequences

❌ **Extra parameter** - Every service call needs userId
  - **Mitigation:** Usually comes from session, one line of code

❌ **Verbose in some cases** - `Omit<UpdateContactInput, '$userId'>` is wordy
  - **Mitigation:** Accept the verbosity for safety

❌ **Can't use schema directly** - Must split data and userId
  - **Mitigation:** Pattern is consistent across codebase

### Neutral Consequences

- Service layer knows about MinistryPlatform's audit requirements
  - This is appropriate - services are MP-specific
- Can't use schema types directly for service parameters
  - Use `Omit<Type, '$userId'>` pattern

## Examples

### Example 1: Updating Contact

**Schema:**
```typescript
// packages/core/database/src/schemas/contacts.ts
export const updateContactSchema = z.object({
  Contact_ID: z.number(),
  First_Name: z.string(),
  $userId: z.number(),
});

export type UpdateContactInput = z.infer<typeof updateContactSchema>;
```

**Service:**
```typescript
// apps/platform/src/services/contactService.ts
export async function updateContact(
  data: Omit<UpdateContactInput, '$userId'>,
  userId: number
) {
  const payload = updateContactSchema.parse({ ...data, $userId: userId });
  return await mp.storedProcedure('api_UpdateContact', payload);
}
```

**Usage:**
```typescript
// API route or server component
const session = await auth();

await updateContact(
  {
    Contact_ID: 123,
    First_Name: 'John',
  },
  session.contactId // userId from session
);
```

### Example 2: Creating Event Participant

**Schema:**
```typescript
export const createParticipantSchema = z.object({
  Event_ID: z.number(),
  Participant_ID: z.number(),
  Participation_Status_ID: z.number(),
  $userId: z.number(),
});
```

**Service:**
```typescript
export async function registerForEvent(
  data: Omit<CreateParticipantInput, '$userId'>,
  userId: number
) {
  const payload = createParticipantSchema.parse({ ...data, $userId: userId });
  return await mp.storedProcedure('api_CreateEventParticipant', payload);
}
```

**Usage:**
```typescript
// User registering for event
await registerForEvent(
  {
    Event_ID: eventId,
    Participant_ID: session.contactId,
    Participation_Status_ID: 2, // Registered
  },
  session.contactId // Audit: who registered
);
```

## Pattern Variations

### Read-Only Operations

Read operations **don't require** `$userId` (no audit needed):

```typescript
export const getContactSchema = z.object({
  Contact_ID: z.number(),
  // No $userId - read-only operation
});

export async function getContact(contactId: number) {
  return await mp.storedProcedure('api_GetContact', { Contact_ID: contactId });
}
```

### Bulk Operations

For bulk operations, pass userId once:

```typescript
export async function updateMultipleContacts(
  contacts: Omit<UpdateContactInput, '$userId'>[],
  userId: number
) {
  // Add userId to each contact
  const payloads = contacts.map(contact =>
    updateContactSchema.parse({ ...contact, $userId: userId })
  );

  return await Promise.all(
    payloads.map(payload => mp.storedProcedure('api_UpdateContact', payload))
  );
}
```

## Alternatives Considered

### Alternative 1: Runtime Check Only

Check for `$userId` at runtime with error:

```typescript
function storedProcedure(name: string, params: any) {
  if (!params.$userId) {
    throw new Error('Missing $userId for audit logging');
  }
  // ...
}
```

**Rejected because:**
- Errors happen at runtime (after deployment)
- Easy to miss in testing
- No IDE autocomplete/hints

### Alternative 2: Global Context

Store userId in global context/middleware:

```typescript
// Middleware sets global userId
globalThis.__userId = session.contactId;

// Service uses global
await updateContact({ Contact_ID: 123 }); // Gets userId from global
```

**Rejected because:**
- Harder to test (mocking globals)
- Less explicit (magic behavior)
- Doesn't work in serverless (no shared state)
- Implicit dependencies are antipattern

### Alternative 3: Automatic from Session

Automatically extract userId from session in service:

```typescript
async function updateContact(data: UpdateContactInput) {
  const session = await auth();
  const payload = { ...data, $userId: session.contactId };
  // ...
}
```

**Rejected because:**
- Services shouldn't call `auth()` directly (breaks separation of concerns)
- Harder to test (must mock auth in every test)
- Less flexible (what if userId comes from elsewhere?)

## Migration Path

If Gospel Kit adds a centralized way to handle userId (e.g., MP client wrapper), we can:

1. Create wrapper that accepts userId in constructor
2. Services use wrapper instance
3. Wrapper adds userId to all calls

But for now, explicit parameters are clearest and safest.

## References

- [MinistryPlatform API Documentation](https://www.ministryplatform.com/api)
- [Zod Documentation](https://zod.dev/)
- [TypeScript Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys)
