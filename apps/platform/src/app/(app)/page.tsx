'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Lock,
  LogIn,
  Users,
  Calendar,
  HandHeart,
  UsersRound,
  BarChart3,
  Church,
  Wallet,
  Home,
  CalendarDays,
  Pin,
  Handshake,
  User,
  Building2,
  CheckSquare,
  AlertCircle,
  History,
} from 'lucide-react';
import { motion } from 'framer-motion';
import LogoSpinner from '@church/nextjs-ui/components/LogoSpinner';
import { HorizontalScroll } from '@church/nextjs-ui/components/HorizontalScroll';
import { SectionTitle } from '@church/nextjs-ui/components/SectionTitle';
import { EventCard } from '@church/nextjs-ui/components/EventCard';
import { DashboardCard } from '@church/nextjs-ui/components/DashboardCard';
import { GroupCard } from '@church/nextjs-ui/components/GroupCard';
import { PersonCard } from '@church/nextjs-ui/components/PersonCard';
import { BaseCard } from '@church/nextjs-ui/components/BaseCard';
import { createUnpinAction } from '@church/nextjs-ui/components/CardActions';
import ChurchLogo from '@/components/ChurchLogo';
import { SectionHeader } from '@church/nextjs-ui/components/SectionHeader';
import { TitleHighlight } from '@church/nextjs-ui/components/TitleHighlight';
import { RotatingSubtitle } from '@/components/RotatingSubtitle';
import { useTestingContext } from '@/components/TestingParamsProvider';
import { usePreserveParams } from '@/lib/usePreserveParams';
import { churchConfig, pageTitle } from '@/config/church';
import { DetailPanelPortal } from './_components/DetailPanelPortal';
import type { PersonDetail } from './_components/PersonDetailPanel';
import {
  getPinnedDashboardsForLevel,
  getPinnedGroupsForLevel,
  getPinnedPeopleForLevel,
  getPinnedEventsForLevel,
} from '@/lib/mockData';

// Map categories to their icons (matching nav)
const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Finance: Wallet,
  Prayer: HandHeart,
  Events: CalendarDays,
  Profile: User,
  Groups: UsersRound,
  People: Users,
  Facilities: Building2,
  Serving: Handshake,
  'Group Meeting': UsersRound,
  Event: CalendarDays,
};

// Type for pinned items - used to render the correct card component
type PinnedItem =
  | {
      id: string;
      type: 'event';
      title: string;
      day: string;
      date: string;
      time: string;
      eventType?: string;
      route: string;
    }
  | {
      id: string;
      type: 'dashboard';
      title: string;
      category?: string;
      stat?: string;
      statLabel?: string;
      route: string;
    }
  | {
      id: string;
      type: 'group';
      title: string;
      groupType?: string;
      memberCount?: number;
      nextMeeting?: string;
      route: string;
    }
  | {
      id: string;
      type: 'person';
      name: string;
      role?: string;
      initials?: string;
      avatarUrl?: string;
      route: string;
    };

// Mock data for widgets
const MOCK_UPCOMING = [
  {
    id: 1,
    title: 'Guest Services',
    subtitle: 'Serving',
    day: 'Sun',
    date: '9',
    time: '8:30 AM',
    route: '/serve/123',
  },
  {
    id: 2,
    title: 'McCord Life Group',
    subtitle: 'Group Meeting',
    day: 'Wed',
    date: '12',
    time: '7:00 PM',
    route: '/groups/123',
  },
  {
    id: 3,
    title: 'Staff Meeting',
    subtitle: 'Event',
    day: 'Thu',
    date: '13',
    time: '9:00 AM',
    route: '/events/456',
  },
  {
    id: 4,
    title: 'Worship Team',
    subtitle: 'Serving',
    day: 'Sun',
    date: '16',
    time: '7:00 AM',
    route: '/serve/456',
  },
  {
    id: 5,
    title: 'Winter Retreat',
    subtitle: 'Event',
    day: 'Fri',
    date: '21',
    time: '6:00 PM',
    route: '/events/789',
  },
  {
    id: 6,
    title: 'Youth Group',
    subtitle: 'Event',
    day: 'Sun',
    date: '23',
    time: '5:00 PM',
    route: '/events/101',
  },
  {
    id: 7,
    title: 'Prayer Meeting',
    subtitle: 'Event',
    day: 'Tue',
    date: '25',
    time: '6:30 PM',
    route: '/events/102',
  },
  {
    id: 8,
    title: 'Nursery',
    subtitle: 'Serving',
    day: 'Sun',
    date: '2',
    time: '9:00 AM',
    route: '/serve/789',
  },
];

const MOCK_NEEDS_ATTENTION = [
  {
    id: 1,
    title: '3 budget requests',
    category: 'Finance',
    route: '/finance/budget-requests',
    priority: 'high',
  },
  { id: 2, title: '5 prayer requests', category: 'Prayer', route: '/prayer', priority: 'medium' },
  { id: 3, title: 'Registration closing', category: 'Events', route: '/events', priority: 'high' },
  { id: 4, title: 'Update profile', category: 'Profile', route: '/me', priority: 'low' },
  { id: 5, title: 'Review roster', category: 'Groups', route: '/groups', priority: 'medium' },
  { id: 6, title: 'Approve expense', category: 'Finance', route: '/finance', priority: 'high' },
  {
    id: 7,
    title: 'New member follow-up',
    category: 'People',
    route: '/people',
    priority: 'medium',
  },
  { id: 8, title: 'Room conflict', category: 'Facilities', route: '/facilities', priority: 'low' },
];

// Mock data for recently visited items
const MOCK_RECENT: Array<{
  id: string;
  type: 'dashboard' | 'person' | 'group' | 'event';
  title: string;
  subtitle?: string;
  stat?: string;
  statLabel?: string;
  category?: string;
  route: string;
  avatarUrl?: string;
  initials?: string;
}> = [
  {
    id: 'recent-1',
    type: 'dashboard',
    title: 'Circles',
    category: 'Engagement',
    stat: '24.3k',
    statLabel: 'people',
    route: '/analytics/dashboards/circles',
  },
  {
    id: 'recent-2',
    type: 'person',
    title: 'Sarah Johnson',
    subtitle: 'Small Groups Director',
    avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
    initials: 'SJ',
    route: '/people/search/101',
  },
  {
    id: 'recent-3',
    type: 'group',
    title: 'Downtown Young Adults',
    subtitle: 'Leader',
    stat: '12',
    statLabel: 'members',
    route: '/groups/1',
  },
  {
    id: 'recent-4',
    type: 'dashboard',
    title: 'Giving',
    category: 'Finance',
    stat: '$182k',
    statLabel: 'MTD',
    route: '/analytics/dashboards/giving',
  },
];

// Mock detail data for people — keyed by name for lookup from any section
const PEOPLE_DETAILS: Record<string, PersonDetail> = {
  'Sarah Johnson': {
    id: '101',
    name: 'Sarah Johnson',
    title: 'Small Groups Director',
    department: 'Discipleship',
    phone: '(555) 123-4510',
    email: 'sarah@example.com',
    imageUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
    bio: 'Sarah leads the small groups ministry, helping people find authentic community. She has a heart for connecting people and equipping leaders to foster meaningful relationships.',
    location: 'Main Campus, Office 108',
  },
  'Michael Chen': {
    id: '102',
    name: 'Michael Chen',
    title: 'Worship Pastor',
    department: 'Worship',
    phone: '(555) 123-4511',
    email: 'michael@example.com',
    imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    bio: 'Michael leads worship across all campuses, blending traditional and contemporary styles to create engaging worship experiences that draw people closer to God.',
    location: 'Main Campus, Auditorium Wing',
  },
  'Emily Rodriguez': {
    id: '103',
    name: 'Emily Rodriguez',
    title: 'Kids Ministry Lead',
    department: 'Kids',
    phone: '(555) 123-4512',
    email: 'emily@example.com',
    imageUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
    bio: "Emily oversees all children's programming from birth through 5th grade. She is passionate about creating safe, fun environments where kids can learn about Jesus.",
    location: 'Main Campus, Kids Wing',
  },
  'David Thompson': {
    id: '104',
    name: 'David Thompson',
    title: 'Executive Pastor',
    department: 'Executive',
    phone: '(555) 123-4513',
    email: 'david@example.com',
    imageUrl: 'https://randomuser.me/api/portraits/men/75.jpg',
    bio: 'David oversees day-to-day operations, staff development, and strategic planning. He brings decades of leadership experience to help the church run effectively.',
    location: 'Main Campus, Office 202',
  },
  'Jessica Williams': {
    id: '105',
    name: 'Jessica Williams',
    title: 'Communications Director',
    department: 'Communications',
    phone: '(555) 123-4514',
    email: 'jessica@example.com',
    imageUrl: 'https://randomuser.me/api/portraits/women/90.jpg',
    bio: 'Jessica leads all communications, marketing, and social media efforts. She is focused on clear, compelling messaging that helps people take their next step.',
    location: 'Main Campus, Office 106',
  },
  'James Miller': {
    id: '106',
    name: 'James Miller',
    title: 'Facilities Manager',
    department: 'Operations',
    phone: '(555) 123-4515',
    email: 'james@example.com',
    imageUrl: 'https://randomuser.me/api/portraits/men/46.jpg',
    bio: 'James manages all church facilities across campuses, ensuring every space is welcoming, safe, and ready for ministry. He coordinates maintenance, renovations, and event setups.',
    location: 'Main Campus, Facilities Office',
  },
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function EmptyStateNotLoggedIn() {
  return (
    <div className="flex flex-col items-center px-6 pt-16 text-center md:pt-24">
      {/* Big central church logo watermark */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.03 }}
        transition={{ duration: 1.5, delay: 0.3 }}
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <ChurchLogo className="h-[60vw] max-h-[500px] w-[60vw] max-w-[500px]" />
      </motion.div>

      <section className="relative z-10 flex flex-col items-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-foreground mb-4 text-5xl font-black tracking-tighter uppercase md:mb-6 md:text-8xl"
        >
          <TitleHighlight animation="underline" inset="1rem">
            Welcome
          </TitleHighlight>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-muted-foreground mt-2 text-sm font-medium tracking-widest uppercase md:text-base"
        >
          You&apos;ve found the Church Hub
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.1 }}
          className="text-muted-foreground mt-6 max-w-md text-sm tracking-wide md:text-base"
        >
          This is where {churchConfig.name} staff and volunteers access dashboards, tools, and
          resources. Sign in with your Ministry Platform account to get started.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.4 }}
          onClick={() => signIn('ministryplatform')}
          className="bg-primary text-primary-foreground hover:bg-primary/90 mt-8 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold tracking-wide uppercase transition-colors"
        >
          <LogIn className="h-4 w-4" />
          Sign In
        </motion.button>
      </section>
    </div>
  );
}

function EmptyStateNoPermissions() {
  return (
    <div className="flex flex-col items-center px-6 pt-16 text-center md:pt-24">
      <section className="relative flex flex-col items-center">
        <SectionHeader
          title="Nothing Here Yet"
          subtitle="Your account doesn't have access to any apps"
          icon={Lock}
          variant="watermark"
          as="h1"
          className="mb-4"
        />
        <p className="text-muted-foreground max-w-md text-sm tracking-wide md:text-base">
          Looks like your account hasn't been set up with permissions yet. If you think this is a
          mistake, reach out to your supervisor or the tech team and they can get you sorted out.
        </p>
      </section>
    </div>
  );
}

function AttentionItemCard({
  item,
  onClick,
}: {
  item: (typeof MOCK_NEEDS_ATTENTION)[0];
  onClick: () => void;
}) {
  const WatermarkIcon = CATEGORY_ICONS[item.category] || AlertCircle;

  const priorityStyles = {
    high: {
      bg: 'bg-red-100 hover:bg-red-100',
      border: 'border-red-200',
      category: 'text-destructive/70',
      title: 'text-destructive',
      watermark: 'text-red-300',
      shadow: 'rgba(239, 68, 68, 0.3)',
    },
    medium: {
      bg: 'bg-amber-100 hover:bg-amber-100',
      border: 'border-amber-200',
      category: 'text-amber-600/70',
      title: 'text-amber-700',
      watermark: 'text-amber-300',
      shadow: 'rgba(245, 158, 11, 0.3)',
    },
    low: {
      bg: 'bg-sky-100 hover:bg-sky-100',
      border: 'border-sky-200',
      category: 'text-sky-600/70',
      title: 'text-sky-700',
      watermark: 'text-sky-300',
      shadow: 'rgba(14, 165, 233, 0.3)',
    },
  };

  const styles = priorityStyles[item.priority as keyof typeof priorityStyles] || priorityStyles.low;

  return (
    <BaseCard
      onClick={onClick}
      className={`justify-center overflow-hidden ${styles.bg} ${styles.border}`}
      shadowColor={styles.shadow}
    >
      {/* Watermark */}
      <WatermarkIcon className={`absolute right-1 bottom-1 h-12 w-12 ${styles.watermark}`} />

      <p
        className={`relative z-10 text-[9px] font-semibold tracking-wider uppercase ${styles.category}`}
      >
        {item.category}
      </p>
      <p
        className={`relative z-10 line-clamp-2 text-center text-xs leading-tight font-bold tracking-wide uppercase ${styles.title}`}
      >
        {item.title}
      </p>
    </BaseCard>
  );
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { accessLevel } = useTestingContext();
  const { buildUrl } = usePreserveParams();
  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';
  const [loading, setLoading] = useState(true);
  const [selectedPerson, setSelectedPerson] = useState<PersonDetail | null>(null);

  useEffect(() => {
    document.title = pageTitle();
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  function handlePersonClick(name: string) {
    const details = PEOPLE_DETAILS[name];
    if (details) setSelectedPerson(details);
  }

  // Get pinned items based on access level
  const pinnedDashboards = getPinnedDashboardsForLevel(accessLevel);
  const pinnedGroups = getPinnedGroupsForLevel(accessLevel);
  const pinnedPeople = getPinnedPeopleForLevel(accessLevel);
  const pinnedEvents = getPinnedEventsForLevel(accessLevel);

  // Build pinned items array from mock data, interleaving types for visual variety
  const pinnedItems: PinnedItem[] = [];

  // Interleave items from different categories
  const maxLen = Math.max(
    pinnedDashboards.length,
    pinnedGroups.length,
    pinnedEvents.length,
    pinnedPeople.length
  );

  for (let i = 0; i < maxLen; i++) {
    if (pinnedDashboards[i]) {
      pinnedItems.push({
        id: `dashboard-${pinnedDashboards[i].id}`,
        type: 'dashboard',
        title: pinnedDashboards[i].label,
        category: pinnedDashboards[i].category,
        stat: pinnedDashboards[i].stat,
        statLabel: pinnedDashboards[i].statLabel,
        route: pinnedDashboards[i].route,
      });
    }
    if (pinnedGroups[i]) {
      pinnedItems.push({
        id: `group-${pinnedGroups[i].id}`,
        type: 'group',
        title: pinnedGroups[i].name,
        groupType: pinnedGroups[i].role,
        memberCount: pinnedGroups[i].members,
        nextMeeting: pinnedGroups[i].nextMeeting,
        route: pinnedGroups[i].route,
      });
    }
    if (pinnedEvents[i]) {
      // Parse the date string to get day/date
      const eventDate = new Date(pinnedEvents[i].date);
      const isRecurring = pinnedEvents[i].date.includes('Every');
      pinnedItems.push({
        id: `event-${pinnedEvents[i].id}`,
        type: 'event',
        title: pinnedEvents[i].title,
        day: isRecurring
          ? pinnedEvents[i].date.split(' ')[1]?.slice(0, 3) || 'Sun'
          : eventDate.toLocaleDateString('en-US', { weekday: 'short' }),
        date: isRecurring ? '•' : eventDate.getDate().toString(),
        time: pinnedEvents[i].time?.split(' - ')[0] || '',
        eventType: pinnedEvents[i].role,
        route: pinnedEvents[i].route,
      });
    }
    if (pinnedPeople[i]) {
      const initials = `${pinnedPeople[i].firstName[0]}${pinnedPeople[i].lastName[0]}`;
      pinnedItems.push({
        id: `person-${pinnedPeople[i].id}`,
        type: 'person',
        name: `${pinnedPeople[i].firstName} ${pinnedPeople[i].lastName}`,
        role: pinnedPeople[i].role,
        initials,
        avatarUrl: pinnedPeople[i].imageUrl,
        route: pinnedPeople[i].route,
      });
    }
  }

  // Filter upcoming items based on access level
  const filteredUpcoming =
    accessLevel === 'low'
      ? MOCK_UPCOMING.slice(0, 3)
      : accessLevel === 'medium'
        ? MOCK_UPCOMING.slice(0, 5)
        : MOCK_UPCOMING;

  // Filter attention items based on access level
  const filteredAttention =
    accessLevel === 'low'
      ? MOCK_NEEDS_ATTENTION.slice(0, 2)
      : accessLevel === 'medium'
        ? MOCK_NEEDS_ATTENTION.slice(0, 4)
        : MOCK_NEEDS_ATTENTION;

  // Show loading state
  if (isLoading || loading) {
    return (
      <div className="-mx-4 -mt-12 md:-mx-6 md:-mt-16 lg:-mx-8">
        {/* Animated header - positioned at top of main area */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="px-4 pt-12 md:px-6 md:pt-16 lg:px-8"
        >
          <h1 className="text-foreground text-2xl font-bold tracking-tighter uppercase sm:text-3xl md:text-7xl lg:text-8xl">
            <TitleHighlight animation="ellipses" duration={0.8}>
              Loading
            </TitleHighlight>
          </h1>
          <p className="text-muted-foreground mt-1 pl-6 text-sm font-normal tracking-widest uppercase md:text-base">
            Getting things ready for you
          </p>
        </motion.header>

        {/* Logo spinner - centered in the main white area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <LogoSpinner logo={<ChurchLogo className="text-foreground" />} />
        </motion.div>
      </div>
    );
  }

  // Not logged in
  if (!isAuthenticated) {
    return <EmptyStateNotLoggedIn />;
  }

  const firstName = session?.firstName || 'there';

  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        className="flex max-w-full min-w-0 flex-col gap-6 overflow-x-hidden md:flex md:h-full md:flex-col md:justify-between md:gap-0 md:overflow-visible"
        onClick={() => selectedPerson && setSelectedPerson(null)}
      >
        {/* Welcome Header */}
        <header className="mb-6 min-w-0 overflow-hidden md:mb-12 md:overflow-visible">
          <SectionHeader
            title={
              <>
                <TitleHighlight animation="underline" inset="1rem">
                  {getGreeting()}
                </TitleHighlight>
                , {firstName}
              </>
            }
            subtitle={<RotatingSubtitle initialDelay={1400} />}
            icon={Home}
            variant="watermark"
            className="mb-0"
          />
        </header>

        {/* Pinned Section - scrollable horizontally */}
        {pinnedItems.length > 0 && (
          <section className="flex min-w-0 flex-col md:mb-8">
            <SectionTitle
              icon={Pin}
              title="Pinned"
              subtitle="Your go-to spots"
              iconAnimation="poke"
              animationFrequency="occasional"
            />
            <HorizontalScroll>
              {pinnedItems.map((item) => {
                // Create unpin action for all pinned cards
                const unpinAction = createUnpinAction(() => {
                  // TODO: Implement actual unpin logic
                  console.log('Unpin:', item.id);
                });

                switch (item.type) {
                  case 'event':
                    return (
                      <EventCard
                        key={item.id}
                        title={item.title}
                        day={item.day}
                        date={item.date}
                        time={item.time}
                        type={item.eventType}
                        onClick={() => router.push(buildUrl(item.route))}
                        actions={[unpinAction]}
                      />
                    );
                  case 'dashboard':
                    return (
                      <DashboardCard
                        key={item.id}
                        title={item.title}
                        category={item.category}
                        stat={item.stat}
                        statLabel={item.statLabel}
                        onClick={() => router.push(buildUrl(item.route))}
                        actions={[unpinAction]}
                      />
                    );
                  case 'group':
                    return (
                      <GroupCard
                        key={item.id}
                        title={item.title}
                        type={item.groupType}
                        memberCount={item.memberCount}
                        nextMeeting={item.nextMeeting}
                        onClick={() => router.push(buildUrl(item.route))}
                        actions={[unpinAction]}
                      />
                    );
                  case 'person':
                    return (
                      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                      <div key={item.id} onClick={(e) => e.stopPropagation()}>
                        <PersonCard
                          name={item.name}
                          role={item.role}
                          initials={item.initials}
                          avatarUrl={item.avatarUrl}
                          onClick={() => handlePersonClick(item.name)}
                          actions={[unpinAction]}
                        />
                      </div>
                    );
                  default:
                    return null;
                }
              })}
            </HorizontalScroll>
          </section>
        )}

        {/* Tasks Section */}
        <section className="flex min-w-0 flex-col md:mb-8">
          <SectionTitle
            icon={CheckSquare}
            title="Tasks"
            subtitle="A few things waiting on you"
            iconAnimation="bounce"
            animationFrequency="occasional"
          />
          {filteredAttention.length > 0 ? (
            <HorizontalScroll
              action="View all"
              onAction={() => router.push(buildUrl('/notifications'))}
            >
              {filteredAttention.map((item) => (
                <AttentionItemCard
                  key={item.id}
                  item={item}
                  onClick={() => router.push(buildUrl(item.route))}
                />
              ))}
            </HorizontalScroll>
          ) : (
            <p className="text-muted-foreground py-8 text-center text-sm">All caught up!</p>
          )}
        </section>

        {/* Recent Section */}
        <section className="flex min-w-0 flex-col md:mb-8">
          <SectionTitle
            icon={History}
            title="Recent"
            subtitle="Pick up where you left off"
            iconAnimation="tilt"
            animationFrequency="occasional"
          />
          <HorizontalScroll>
            {MOCK_RECENT.map((item) => {
              switch (item.type) {
                case 'dashboard':
                  return (
                    <DashboardCard
                      key={item.id}
                      title={item.title}
                      category={item.category}
                      stat={item.stat}
                      statLabel={item.statLabel}
                      onClick={() => router.push(buildUrl(item.route))}
                    />
                  );
                case 'person':
                  return (
                    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                    <div key={item.id} onClick={(e) => e.stopPropagation()}>
                      <PersonCard
                        name={item.title}
                        role={item.subtitle}
                        avatarUrl={item.avatarUrl}
                        initials={item.initials}
                        onClick={() => handlePersonClick(item.title)}
                      />
                    </div>
                  );
                case 'group':
                  return (
                    <GroupCard
                      key={item.id}
                      title={item.title}
                      type={item.subtitle}
                      memberCount={item.stat ? parseInt(item.stat) : undefined}
                      onClick={() => router.push(buildUrl(item.route))}
                    />
                  );
                default:
                  return null;
              }
            })}
          </HorizontalScroll>
        </section>

        {/* What's Next */}
        <section className="flex min-w-0 flex-col">
          <SectionTitle
            icon={CalendarDays}
            title="What's Next"
            subtitle="Coming up on your calendar"
            iconAnimation="shake"
            animationFrequency="occasional"
          />
          {filteredUpcoming.length > 0 ? (
            <HorizontalScroll
              action="View all"
              onAction={() => router.push(buildUrl('/me/events'))}
            >
              {filteredUpcoming.map((item) => (
                <EventCard
                  key={item.id}
                  title={item.title}
                  day={item.day}
                  date={item.date}
                  time={item.time}
                  type={item.subtitle}
                  icon={CATEGORY_ICONS[item.subtitle]}
                  onClick={() => router.push(buildUrl(item.route))}
                />
              ))}
            </HorizontalScroll>
          ) : (
            <p className="text-muted-foreground py-8 text-center text-sm">Nothing scheduled</p>
          )}
        </section>
      </div>

      <DetailPanelPortal
        person={selectedPerson}
        onClose={() => setSelectedPerson(null)}
        profileUrl={selectedPerson ? buildUrl(`/people/search/${selectedPerson.id}`) : undefined}
      />
    </>
  );
}
