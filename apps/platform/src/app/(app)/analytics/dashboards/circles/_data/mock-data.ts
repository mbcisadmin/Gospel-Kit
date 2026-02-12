import type {
  FilterConfig,
  ParticipantRow,
  MilestoneSection,
  FiscalPeriod,
  OverTimeData,
  CircleName,
  CircleStats,
} from './types';

// ---------------------------------------------------------------------------
// Deterministic pseudo-random number generator (mulberry32)
// ---------------------------------------------------------------------------
function createRng(seed: number) {
  let s = seed;
  return function next(): number {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function fmt(n: number): string {
  return n.toLocaleString('en-US');
}

// ---------------------------------------------------------------------------
// 1. Mock Filters
// ---------------------------------------------------------------------------
export const MOCK_FILTERS: FilterConfig[] = [
  {
    key: 'engagement',
    label: 'Engagement',
    defaultLabel: 'All Engagement',
    pluralLabel: 'Levels',
    options: [
      { value: '1', label: 'Fully Engaged' },
      { value: '2', label: 'Partially Engaged' },
      { value: '3', label: 'Lapsing' },
      { value: '4', label: 'Observing' },
      { value: '5', label: 'Lapsed' },
    ],
  },
  {
    key: 'campus',
    label: 'Campus',
    defaultLabel: 'All Campuses',
    pluralLabel: 'Campuses',
    options: [
      { value: '1', label: 'Main Campus' },
      { value: '2', label: 'North Campus' },
      { value: '3', label: 'Online' },
    ],
  },
  {
    key: 'participantType',
    label: 'Participant Type',
    defaultLabel: 'All Types',
    pluralLabel: 'Types',
    options: [
      { value: '1', label: 'Church Family' },
      { value: '2', label: 'Attendee' },
      { value: '3', label: 'Guest' },
      { value: '4', label: 'Regular Attender' },
    ],
  },
  {
    key: 'householdPosition',
    label: 'Household Position',
    defaultLabel: 'All Positions',
    pluralLabel: 'Positions',
    options: [
      { value: '1', label: 'Head of Household' },
      { value: '2', label: 'Spouse' },
      { value: '3', label: 'Minor Child' },
      { value: '4', label: 'Adult Child' },
      { value: '5', label: 'Other' },
    ],
  },
  {
    key: 'maritalStatus',
    label: 'Marital Status',
    defaultLabel: 'All Statuses',
    pluralLabel: 'Statuses',
    options: [
      { value: '1', label: 'Single' },
      { value: '2', label: 'Married' },
      { value: '3', label: 'Divorced' },
      { value: '4', label: 'Widowed' },
    ],
  },
  {
    key: 'gender',
    label: 'Gender',
    defaultLabel: 'All Genders',
    pluralLabel: 'Genders',
    options: [
      { value: '1', label: 'Male' },
      { value: '2', label: 'Female' },
    ],
  },
];

// ---------------------------------------------------------------------------
// 2. Mock Participants (800 rows, deterministic)
// ---------------------------------------------------------------------------

const CIRCLE_DISTRIBUTION: { circle: string; weight: number }[] = [
  { circle: 'Community', weight: 0.35 },
  { circle: 'Crowd', weight: 0.25 },
  { circle: 'Congregation', weight: 0.2 },
  { circle: 'Committed', weight: 0.13 },
  { circle: 'Core', weight: 0.07 },
];

const ENGAGEMENT_BY_CIRCLE: Record<string, { label: string; weight: number }[]> = {
  Community: [
    { label: 'Observing', weight: 0.4 },
    { label: 'Lapsed', weight: 0.3 },
    { label: 'Lapsing', weight: 0.15 },
    { label: 'Partially Engaged', weight: 0.1 },
    { label: 'Fully Engaged', weight: 0.05 },
  ],
  Crowd: [
    { label: 'Partially Engaged', weight: 0.35 },
    { label: 'Observing', weight: 0.25 },
    { label: 'Lapsing', weight: 0.2 },
    { label: 'Fully Engaged', weight: 0.12 },
    { label: 'Lapsed', weight: 0.08 },
  ],
  Congregation: [
    { label: 'Partially Engaged', weight: 0.35 },
    { label: 'Fully Engaged', weight: 0.3 },
    { label: 'Lapsing', weight: 0.15 },
    { label: 'Observing', weight: 0.12 },
    { label: 'Lapsed', weight: 0.08 },
  ],
  Committed: [
    { label: 'Fully Engaged', weight: 0.55 },
    { label: 'Partially Engaged', weight: 0.25 },
    { label: 'Lapsing', weight: 0.12 },
    { label: 'Observing', weight: 0.05 },
    { label: 'Lapsed', weight: 0.03 },
  ],
  Core: [
    { label: 'Fully Engaged', weight: 0.7 },
    { label: 'Partially Engaged', weight: 0.2 },
    { label: 'Lapsing', weight: 0.07 },
    { label: 'Observing', weight: 0.02 },
    { label: 'Lapsed', weight: 0.01 },
  ],
};

const CAMPUS_WEIGHTS = [
  { label: 'Main Campus', weight: 0.55 },
  { label: 'North Campus', weight: 0.3 },
  { label: 'Online', weight: 0.15 },
];

const TYPE_BY_CIRCLE: Record<string, { label: string; weight: number }[]> = {
  Community: [
    { label: 'Guest', weight: 0.45 },
    { label: 'Attendee', weight: 0.35 },
    { label: 'Regular Attender', weight: 0.12 },
    { label: 'Church Family', weight: 0.08 },
  ],
  Crowd: [
    { label: 'Attendee', weight: 0.4 },
    { label: 'Regular Attender', weight: 0.3 },
    { label: 'Guest', weight: 0.18 },
    { label: 'Church Family', weight: 0.12 },
  ],
  Congregation: [
    { label: 'Regular Attender', weight: 0.4 },
    { label: 'Church Family', weight: 0.35 },
    { label: 'Attendee', weight: 0.2 },
    { label: 'Guest', weight: 0.05 },
  ],
  Committed: [
    { label: 'Church Family', weight: 0.6 },
    { label: 'Regular Attender', weight: 0.3 },
    { label: 'Attendee', weight: 0.08 },
    { label: 'Guest', weight: 0.02 },
  ],
  Core: [
    { label: 'Church Family', weight: 0.8 },
    { label: 'Regular Attender', weight: 0.15 },
    { label: 'Attendee', weight: 0.05 },
  ],
};

const HOUSEHOLD_WEIGHTS = [
  { label: 'Head of Household', weight: 0.4 },
  { label: 'Spouse', weight: 0.28 },
  { label: 'Minor Child', weight: 0.12 },
  { label: 'Adult Child', weight: 0.12 },
  { label: 'Other', weight: 0.08 },
];

const MARITAL_WEIGHTS = [
  { label: 'Married', weight: 0.52 },
  { label: 'Single', weight: 0.32 },
  { label: 'Divorced', weight: 0.1 },
  { label: 'Widowed', weight: 0.06 },
];

const GENDER_WEIGHTS = [
  { label: 'Female', weight: 0.54 },
  { label: 'Male', weight: 0.46 },
];

function weightedPick(rng: () => number, items: { label: string; weight: number }[]): string {
  const r = rng();
  let cumulative = 0;
  for (const item of items) {
    cumulative += item.weight;
    if (r < cumulative) return item.label;
  }
  return items[items.length - 1].label;
}

function pickCircle(rng: () => number): string {
  const r = rng();
  let cumulative = 0;
  for (const entry of CIRCLE_DISTRIBUTION) {
    cumulative += entry.weight;
    if (r < cumulative) return entry.circle;
  }
  return CIRCLE_DISTRIBUTION[CIRCLE_DISTRIBUTION.length - 1].circle;
}

function generateParticipants(): ParticipantRow[] {
  const rng = createRng(42_867);
  const rows: ParticipantRow[] = [];

  for (let i = 0; i < 800; i++) {
    const circle = pickCircle(rng);
    const engagement = weightedPick(rng, ENGAGEMENT_BY_CIRCLE[circle]);
    const campus = weightedPick(rng, CAMPUS_WEIGHTS);
    const participantType = weightedPick(rng, TYPE_BY_CIRCLE[circle]);
    const householdPosition = weightedPick(rng, HOUSEHOLD_WEIGHTS);
    const maritalStatus = weightedPick(rng, MARITAL_WEIGHTS);
    const gender = weightedPick(rng, GENDER_WEIGHTS);

    rows.push({
      Circle: circle,
      Engagement_Level: engagement,
      Congregation_Name: campus,
      Participant_Type: participantType,
      Household_Position: householdPosition,
      Marital_Status: maritalStatus,
      Gender: gender,
    });
  }

  return rows;
}

export const MOCK_PARTICIPANTS: ParticipantRow[] = generateParticipants();

// ---------------------------------------------------------------------------
// 3. Mock Milestones
// ---------------------------------------------------------------------------

const MP_BASE = 'https://example.ministryplatform.com/tables';

export const MOCK_MILESTONES: MilestoneSection[] = [
  {
    circle: 'community',
    title: 'Community',
    tooltip: 'The outermost circle - people with some connection to the church',
    milestones: [
      {
        name: 'Website Visit',
        totalAssigned: '3,214',
        firstInCircle: '+ 1,842',
        description: 'Tracked a visit to the church website or landing page',
        mpUrl: `${MP_BASE}/milestones/1`,
      },
      {
        name: 'Social Media Follow',
        totalAssigned: '2,687',
        firstInCircle: '+ 1,105',
        description: 'Followed the church on a social media platform',
        mpUrl: `${MP_BASE}/milestones/2`,
      },
      {
        name: 'First Time Guest',
        totalAssigned: '1,436',
        firstInCircle: '+ 983',
        description: 'Visited a service or event for the first time',
        mpUrl: `${MP_BASE}/milestones/3`,
      },
      {
        name: 'Event Attendee',
        totalAssigned: '1,891',
        firstInCircle: '+ 624',
        description: 'Attended a community event or outreach',
        mpUrl: `${MP_BASE}/milestones/4`,
      },
    ],
  },
  {
    circle: 'crowd',
    title: 'Crowd',
    tooltip: 'People who attend services and events',
    milestones: [
      {
        name: 'Second Visit',
        totalAssigned: '2,105',
        firstInCircle: '+ 1,248',
        description: 'Returned for a second service or event',
        mpUrl: `${MP_BASE}/milestones/5`,
      },
      {
        name: 'Attended 3+ Times',
        totalAssigned: '1,647',
        firstInCircle: '+ 892',
        description: 'Attended three or more services within 90 days',
        mpUrl: `${MP_BASE}/milestones/6`,
      },
      {
        name: 'Signed Up for Newsletter',
        totalAssigned: '1,382',
        firstInCircle: '+ 415',
        description: 'Subscribed to a church email newsletter',
        mpUrl: `${MP_BASE}/milestones/7`,
      },
      {
        name: 'Kids Check-In',
        totalAssigned: '987',
        firstInCircle: '+ 372',
        description: 'Checked children into kids ministry for the first time',
        mpUrl: `${MP_BASE}/milestones/8`,
      },
    ],
  },
  {
    circle: 'congregation',
    title: 'Congregation',
    tooltip: 'Regular attenders who are connected and growing',
    milestones: [
      {
        name: 'Membership Class',
        totalAssigned: '1,284',
        firstInCircle: '+ 847',
        description: 'Completed a membership or newcomers class',
        mpUrl: `${MP_BASE}/milestones/9`,
      },
      {
        name: 'Baptism',
        totalAssigned: '743',
        firstInCircle: '+ 612',
        description: 'Was baptized at the church',
        mpUrl: `${MP_BASE}/milestones/10`,
      },
      {
        name: 'Regular Attender (6mo)',
        totalAssigned: '1,518',
        firstInCircle: '+ 534',
        description: 'Attended regularly for at least six months',
        mpUrl: `${MP_BASE}/milestones/11`,
      },
      {
        name: 'Joined a Group',
        totalAssigned: '1,096',
        firstInCircle: '+ 489',
        description: 'Signed up and participated in a small group or class',
        mpUrl: `${MP_BASE}/milestones/12`,
      },
      {
        name: 'Connected Card Submitted',
        totalAssigned: '864',
        firstInCircle: '+ 312',
        description: 'Filled out a connection or communication card',
        mpUrl: `${MP_BASE}/milestones/13`,
      },
    ],
  },
  {
    circle: 'committed',
    title: 'Committed',
    tooltip: 'Active members who serve, give, and participate in groups',
    milestones: [
      {
        name: 'Serving on Team',
        totalAssigned: '682',
        firstInCircle: '+ 412',
        description: 'Actively serving on a ministry team',
        mpUrl: `${MP_BASE}/milestones/14`,
      },
      {
        name: 'Small Group Leader',
        totalAssigned: '184',
        firstInCircle: '+ 98',
        description: 'Leading or co-leading a small group',
        mpUrl: `${MP_BASE}/milestones/15`,
      },
      {
        name: 'Completed Growth Track',
        totalAssigned: '521',
        firstInCircle: '+ 276',
        description: 'Completed the multi-week spiritual growth track',
        mpUrl: `${MP_BASE}/milestones/16`,
      },
      {
        name: 'Tithing Member',
        totalAssigned: '437',
        firstInCircle: '+ 189',
        description: 'Regular financial contributor to the church',
        mpUrl: `${MP_BASE}/milestones/17`,
      },
    ],
  },
  {
    circle: 'core',
    title: 'Core',
    tooltip: 'Leaders and deeply committed members who multiply ministry',
    milestones: [
      {
        name: 'Ministry Leader',
        totalAssigned: '156',
        firstInCircle: '+ 102',
        description: 'Leads a ministry area or department',
        mpUrl: `${MP_BASE}/milestones/18`,
      },
      {
        name: 'Elder/Deacon',
        totalAssigned: '42',
        firstInCircle: '+ 42',
        description: 'Serving as an elder or deacon',
        mpUrl: `${MP_BASE}/milestones/19`,
      },
      {
        name: 'Multiplying Leader',
        totalAssigned: '87',
        firstInCircle: '+ 65',
        description: 'A leader who is developing and raising up new leaders',
        mpUrl: `${MP_BASE}/milestones/20`,
      },
      {
        name: 'Staff/Pastoral',
        totalAssigned: '34',
        firstInCircle: '+ 34',
        description: 'Church staff or pastoral team member',
        mpUrl: `${MP_BASE}/milestones/21`,
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// 4. Mock Fiscal Periods (Dec 2024 - Feb 2026, 15 months)
// ---------------------------------------------------------------------------

function generateFiscalPeriods(): FiscalPeriod[] {
  const periods: FiscalPeriod[] = [];
  let id = 112; // Start from Dec 2024

  // Dec 2024
  const dec2024 = new Date(2024, 11, 1);
  periods.push({
    id,
    name: `Dec 2024`,
    label: dec2024.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
  });
  id++;

  // Jan 2025 - Dec 2025
  for (let month = 0; month < 12; month++) {
    const date = new Date(2025, month, 1);
    const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const shortMonth = date.toLocaleDateString('en-US', { month: 'short' });
    periods.push({
      id,
      name: `${shortMonth} 2025`,
      label,
    });
    id++;
  }

  // Jan 2026 - Feb 2026
  for (let month = 0; month < 2; month++) {
    const date = new Date(2026, month, 1);
    const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const shortMonth = date.toLocaleDateString('en-US', { month: 'short' });
    periods.push({
      id,
      name: `${shortMonth} 2026`,
      label,
    });
    id++;
  }

  return periods;
}

export const MOCK_FISCAL_PERIODS: FiscalPeriod[] = generateFiscalPeriods();

// ---------------------------------------------------------------------------
// 5. Mock OverTimeData
// ---------------------------------------------------------------------------

// Base values at Jan 2024 and targets at Dec 2025
const CIRCLE_BASE: Record<CircleName, number> = {
  community: 4200,
  crowd: 2800,
  congregation: 1800,
  committed: 900,
  core: 350,
};

const CIRCLE_TARGET: Record<CircleName, number> = {
  community: 4800,
  crowd: 3200,
  congregation: 2100,
  committed: 1050,
  core: 420,
};

// Monthly movement base ranges (new joins per month)
const MOVEMENT_BASE: Record<CircleName, { min: number; max: number }> = {
  community: { min: 80, max: 160 },
  crowd: { min: 45, max: 95 },
  congregation: { min: 25, max: 55 },
  committed: { min: 10, max: 28 },
  core: { min: 3, max: 12 },
};

function generateOverTimeData(asOfPeriodId?: number): OverTimeData {
  const rng = createRng(71_953);
  const circleKeys: CircleName[] = ['community', 'crowd', 'congregation', 'committed', 'core'];

  // Determine which periods to include
  const selectedId = asOfPeriodId ?? MOCK_FISCAL_PERIODS[MOCK_FISCAL_PERIODS.length - 1].id;
  const selectedIndex = MOCK_FISCAL_PERIODS.findIndex((p) => p.id === selectedId);
  const endIndex = selectedIndex >= 0 ? selectedIndex : MOCK_FISCAL_PERIODS.length - 1;

  // Show up to 13 months ending at the selected period
  const allPeriods = MOCK_FISCAL_PERIODS.slice(0, endIndex + 1);
  const periods = allPeriods.slice(-13);

  const labels: string[] = [];
  const fullLabels: string[] = [];

  const inCircle: Record<CircleName, number[]> = {
    community: [],
    crowd: [],
    congregation: [],
    committed: [],
    core: [],
  };

  const movement: Record<CircleName, number[]> = {
    community: [],
    crowd: [],
    congregation: [],
    committed: [],
    core: [],
  };

  for (let i = 0; i < periods.length; i++) {
    const period = periods[i];
    const parts = period.name.split(' ');
    labels.push(parts[0]);
    fullLabels.push(period.label);

    const progress = periods.length > 1 ? i / (periods.length - 1) : 1;

    // Parse month from period name for seasonal effects
    const monthStr = period.name.split(' ')[0];
    const monthMap: Record<string, number> = {
      Jan: 0,
      Feb: 1,
      Mar: 2,
      Apr: 3,
      May: 4,
      Jun: 5,
      Jul: 6,
      Aug: 7,
      Sep: 8,
      Oct: 9,
      Nov: 10,
      Dec: 11,
    };
    const monthNum = monthMap[monthStr] ?? 0;

    for (const circle of circleKeys) {
      // Smooth growth with small noise
      const base = CIRCLE_BASE[circle];
      const target = CIRCLE_TARGET[circle];
      const noise = (rng() - 0.5) * (target - base) * 0.06;

      // Add seasonal bumps in Sep-Oct (back to school / fall kickoff)
      const seasonalBump = monthNum >= 8 && monthNum <= 10 ? (target - base) * 0.03 : 0;

      const value = Math.round(base + (target - base) * progress + noise + seasonalBump);
      inCircle[circle].push(value);

      // Movement: new joins per month
      const { min, max } = MOVEMENT_BASE[circle];
      const movementVal = Math.round(min + rng() * (max - min));
      movement[circle].push(movementVal);
    }
  }

  // Build stats from the generated data
  const lastIdx = periods.length - 1;
  const firstIdx = 0;

  function buildStats(circle: CircleName): CircleStats {
    const latestVal = inCircle[circle][lastIdx];
    const firstVal = inCircle[circle][firstIdx];
    const change = firstVal > 0 ? ((latestVal - firstVal) / firstVal) * 100 : 0;
    const newVal = movement[circle][lastIdx];
    return {
      total: fmt(latestVal),
      newCount: fmt(newVal),
      change: `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`,
    };
  }

  const circleStats = {} as Record<CircleName, CircleStats>;
  let latestTotal = 0;
  let firstTotal = 0;
  let totalNew = 0;

  for (const circle of circleKeys) {
    circleStats[circle] = buildStats(circle);
    latestTotal += inCircle[circle][lastIdx];
    firstTotal += inCircle[circle][firstIdx];
    totalNew += movement[circle][lastIdx];
  }

  const overallChange = firstTotal > 0 ? ((latestTotal - firstTotal) / firstTotal) * 100 : 0;

  const asOf = periods[lastIdx].label;

  return {
    asOf,
    labels,
    fullLabels,
    overviewStats: {
      total: fmt(latestTotal),
      newCount: fmt(totalNew),
      change: `${overallChange >= 0 ? '+' : ''}${overallChange.toFixed(1)}%`,
    },
    circleStats,
    inCircle,
    movement,
    fiscalPeriods: MOCK_FISCAL_PERIODS,
    selectedPeriodId: selectedId,
  };
}

// Pre-generate default (full range) for caching
const DEFAULT_OVER_TIME_DATA = generateOverTimeData();

// ---------------------------------------------------------------------------
// 6. Mock Fetcher Functions
// ---------------------------------------------------------------------------

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function mockFetchFilters(): Promise<FilterConfig[]> {
  await delay(60);
  return MOCK_FILTERS;
}

export async function mockFetchParticipants(): Promise<ParticipantRow[]> {
  await delay(80);
  return MOCK_PARTICIPANTS;
}

export async function mockFetchMilestones(): Promise<MilestoneSection[]> {
  await delay(70);
  return MOCK_MILESTONES;
}

export async function mockFetchFiscalPeriods(): Promise<FiscalPeriod[]> {
  await delay(50);
  return MOCK_FISCAL_PERIODS;
}

export async function mockFetchOverTimeData(asOfFiscalPeriodId?: number): Promise<OverTimeData> {
  await delay(90);
  if (asOfFiscalPeriodId == null) {
    return DEFAULT_OVER_TIME_DATA;
  }
  return generateOverTimeData(asOfFiscalPeriodId);
}
