# ADR-004: Abstraction Guidelines

**Status**: Accepted
**Date**: 2024-12-05

## Context

Gospel Kit is a template that gets cloned by individual churches. After cloning:

- **Gospel Kit Template** → Shared codebase (this repo)
- **Woodside's Deployment** → Woodside's private fork
- **Trinity's Deployment** → Trinity's private fork
- **etc.**

**Developer workflow:**
1. Build feature in Woodside's deployment
2. Realize: "Other churches I work with would benefit from this"
3. Extract to Gospel Kit template
4. Pull Gospel Kit updates into other church deployments
5. All churches get the improvement

**Problem:** How do I decide what should be extracted back to Gospel Kit vs kept in individual church deployments?

**Key insight:** Once cloned, individual deployments can have church-specific code. The question isn't "is this church-agnostic?" but rather **"Should this go back in Gospel Kit so my other church clients can use it?"**

## Decision

Use the **Multi-Church Reuse Framework** to decide what gets abstracted to Gospel Kit.

### Framework: Should This Be in Gospel Kit?

Ask these questions when building features in any church deployment:

#### 1. Would 2+ of my church clients use this?

**YES → Consider abstracting**
- Carousel component
- Contact search
- Event registration
- Common UI patterns
- MP API helpers

**NO → Keep in church deployment**
- Woodside's annual meeting content
- Specific approval workflows
- Custom business rules
- Church-specific integrations

#### 2. Is the CORE LOGIC reusable?

Even if the feature is church-specific, ask: "Is there a reusable core?"

**Example 1: Annual Meeting**
- ❌ Annual meeting content → Church-specific
- ✅ Annual meeting PAGE TEMPLATE → Reusable
- **Decision:** Extract template to Gospel Kit, content stays in church deployment

**Example 2: Budget Approval**
- ❌ Woodside's 3-tier approval process → Church-specific
- ✅ Generic approval workflow component → Reusable
- **Decision:** Extract approval UI to Gospel Kit, Woodside's rules stay local

**Example 3: Carousel**
- ✅ Entire carousel → Reusable
- **Decision:** Extract entire thing to Gospel Kit

#### 3. Can I make it generic without much effort?

**If making it generic is easy:**
- Build it generic from the start
- Use props instead of hardcoding
- Easier to extract later

**If making it generic is hard:**
- Build church-specific version now
- Extract later if other churches need it
- Don't over-engineer

### Decision Matrix

| Feature Type | Multi-Church Use? | Core Reusable? | Decision |
|--------------|-------------------|----------------|----------|
| UI Component (Carousel, Modal, Table) | Likely yes | Yes | **Extract to Gospel Kit** |
| MP API Helper | Likely yes | Yes | **Extract to Gospel Kit** |
| Data Schema (Contact, Event) | Likely yes | Yes | **Extract to Gospel Kit** |
| Business Logic (Approval Workflow) | Maybe | Sometimes | **Extract core, keep rules local** |
| Content (Annual Meeting) | No | No | **Keep in church deployment** |
| Integration (Church-specific API) | No | Maybe | **Keep local unless core is generic** |

## Implementation Strategy

### When Building in a Church Deployment

**Step 1: Build for the church**
- Solve their problem first
- Don't over-abstract prematurely
- Get it working

**Step 2: Identify reusable parts**
- Ask: "Would this help my other churches?"
- Identify the generic core
- Note what's church-specific

**Step 3: Extract if beneficial**
- Move generic code to Gospel Kit
- Make it configurable (props, CSS vars)
- Update church deployment to use Gospel Kit version
- Test in original church

**Step 4: Pull into other churches**
- Update Gospel Kit in other deployments
- Customize for each church (colors, content)
- All churches benefit

### Code Structure for Easy Extraction

**Make code extraction-ready from the start:**

✅ **Good - Easy to extract:**
```typescript
// Generic component with props
export function Carousel({
  items,
  autoPlay = true,
  interval = 5000
}: CarouselProps) {
  return (
    <div className="carousel">
      {items.map(item => (
        <div key={item.id}>{item.content}</div>
      ))}
    </div>
  );
}

// Woodside usage
<Carousel items={woodsidePhotos} autoPlay />
```

❌ **Bad - Hard to extract:**
```typescript
// Hardcoded Woodside data
export function WoodsideCarousel() {
  const photos = [
    { src: '/woodside-logo.png', alt: 'Woodside' },
    // ... hardcoded Woodside photos
  ];

  return (
    <div className="carousel">
      <h2>Welcome to Woodside Bible Church</h2>
      {/* Woodside-specific markup */}
    </div>
  );
}
```

**If you need Woodside-specific behavior:**

```typescript
// In Gospel Kit: packages/nextjs/ui/carousel/
export function Carousel({ items, renderItem }: CarouselProps) {
  return (
    <div className="carousel">
      {items.map((item, i) => (
        <div key={i}>{renderItem(item)}</div>
      ))}
    </div>
  );
}

// In Woodside deployment:
<Carousel
  items={woodsideData}
  renderItem={(item) => <WoodsideCustomCard data={item} />}
/>
```

## Consequences

### Positive Consequences

✅ **Clear decision framework** - Know what to abstract vs keep local
✅ **Faster development** - Don't over-abstract prematurely
✅ **Reusable code** - Gospel Kit improves over time
✅ **Happy clients** - All churches benefit from improvements
✅ **Less duplication** - Build once, use across churches
✅ **Easier maintenance** - Fix bug once, all churches get fix

### Negative Consequences

❌ **Requires discipline** - Must remember to extract reusable code
  - **Mitigation:** Review code before marking task complete

❌ **Extract too early** - Might make generic before understanding needs
  - **Mitigation:** Extract after 2nd church needs it (not 1st)

❌ **Extract too late** - Might duplicate code across churches
  - **Mitigation:** Review existing churches when building new features

### Neutral Consequences

- Gospel Kit template grows over time (expected)
- Some features stay church-specific (expected)
- Extraction is manual process (could automate later)

## Examples

### Example 1: Building Carousel in Woodside

**Scenario:** Woodside needs image carousel for homepage.

**Step 1: Build for Woodside**
```typescript
// apps/platform/src/components/WoodsideCarousel.tsx
export function WoodsideCarousel() {
  const photos = useWoodsidePhotos();
  return <div>{/* carousel implementation */}</div>;
}
```

**Step 2: Identify reusable parts**
- ✅ Carousel logic → Generic
- ✅ UI component → Generic
- ❌ Woodside photos → Specific

**Step 3: Extract to Gospel Kit**
```typescript
// packages/nextjs/ui/carousel/carousel.tsx
export function Carousel({ items, ...props }: CarouselProps) {
  return <div>{/* carousel implementation */}</div>;
}

// apps/platform/src/app/page.tsx (Woodside)
import { Carousel } from '@church/nextjs-ui/carousel';

export default function HomePage() {
  const woodsidePhotos = useWoodsidePhotos();
  return <Carousel items={woodsidePhotos} />;
}
```

**Step 4: Use in Trinity deployment**
```typescript
// Trinity's deployment
import { Carousel } from '@church/nextjs-ui/carousel';

export default function HomePage() {
  const trinityPhotos = useTrinityPhotos();
  return <Carousel items={trinityPhotos} />;
}
```

### Example 2: Woodside Annual Meeting

**Scenario:** Woodside needs annual meeting microsite.

**Step 1: Build for Woodside**
- Build complete Woodside annual meeting site
- Hardcoded content, Woodside-specific flow

**Step 2: Identify reusable parts**
- ✅ Page layout → Generic template
- ✅ Time-based content switching → Generic logic
- ❌ Woodside's content → Specific
- ❌ Woodside's budget vote → Specific

**Step 3: Extract template only**
```typescript
// Gospel Kit: packages/nextjs/ui/annual-meeting/
export function AnnualMeetingTemplate({
  phase,
  preContent,
  duringContent,
  postContent
}: TemplateProps) {
  if (phase === 'pre') return preContent;
  if (phase === 'during') return duringContent;
  return postContent;
}

// Woodside deployment:
<AnnualMeetingTemplate
  phase={currentPhase}
  preContent={<WoodsidePreMeeting />}
  duringContent={<WoodsideLiveMeeting />}
  postContent={<WoodsideRecap />}
/>
```

**Step 4: Trinity uses template**
```typescript
// Trinity deployment:
<AnnualMeetingTemplate
  phase={currentPhase}
  preContent={<TrinityPreMeeting />}
  duringContent={<TrinityLiveMeeting />}
  postContent={<TrinityRecap />}
/>
```

### Example 3: MP API Helper

**Scenario:** Need to fetch contact with household data.

**Decision:** This is a standard MP pattern → Extract immediately

```typescript
// Gospel Kit: packages/core/ministry-platform/src/contacts.ts
export async function getContactWithHouseholds(
  contactId: number,
  userId: number
) {
  return await storedProcedure('api_GetContactWithHouseholds', {
    contactId,
    $userId: userId,
  });
}

// Any church deployment:
import { getContactWithHouseholds } from '@church/ministry-platform';

const contact = await getContactWithHouseholds(123, session.contactId);
```

## Special Cases

### "I'm not sure if other churches will need this"

**Answer:** Build it church-specific first. Extract when 2nd church needs it.

### "This is 90% generic, 10% Woodside-specific"

**Answer:** Extract the 90%, pass the 10% as props/render props.

### "I work with only one church"

**Answer:** Still use this framework. You might add churches later, and Gospel Kit benefits community.

## Review Process

**Before marking a feature "complete," ask:**

1. ✅ Did I build anything that could help other churches?
2. ✅ Did I extract the reusable parts to Gospel Kit?
3. ✅ Is the code structured for easy extraction if needed later?

## References

- [Rule of Three (refactoring)](https://en.wikipedia.org/wiki/Rule_of_three_(computer_programming))
- [YAGNI Principle](https://en.wikipedia.org/wiki/You_aren%27t_gonna_need_it)
- [DRY Principle](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself)
