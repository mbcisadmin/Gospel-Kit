'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import {
  User,
  MapPin,
  X,
  CalendarDays,
  HandCoins,
  UsersRound,
  Handshake,
  LogOut,
  Sun,
  Moon,
  Bell,
} from 'lucide-react';
import {
  MOCK_NOTIFICATIONS,
  type Notification,
  formatTimestamp,
} from '@/components/NotificationsSheet';
import { usePreserveParams } from '@/lib/usePreserveParams';
import { churchConfig } from '@/config/church';

// ============================================================================
// Constants
// ============================================================================

const BRAND_GREEN_GRADIENT = 'var(--brand-gradient)';

const MY_STUFF_ITEMS = [
  { label: 'Events', route: '/me/events', icon: CalendarDays },
  { label: 'Giving', route: '/me/giving', icon: HandCoins },
  { label: 'Groups', route: '/me/groups', icon: UsersRound },
  { label: 'Serving', route: '/me/serving', icon: Handshake },
];

// ============================================================================
// Types
// ============================================================================

interface ProfileAddress {
  line1: string | null;
  line2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
}

interface HouseholdMember {
  contactId: number;
  firstName: string | null;
  lastName: string | null;
  position: string | null;
  email: string | null;
  mobilePhone: string | null;
  age: number | null;
  imageUrl: string | null;
}

interface ProfileData {
  address: ProfileAddress | null;
  householdMembers: HouseholdMember[];
}

// ============================================================================
// ProfileOverlay Component
// ============================================================================

interface ProfileOverlayProps {
  open: boolean;
  onClose: () => void;
}

export default function ProfileOverlay({ open, onClose }: ProfileOverlayProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const { buildUrl } = usePreserveParams();

  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [originOffset, setOriginOffset] = useState<{ x: number; y: number } | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Swipe-to-dismiss on mobile (left or right)
  const dragX = useMotionValue(0);
  const absDragX = useTransform(dragX, (v) => Math.abs(v));
  const backdropOpacity = useTransform(absDragX, [0, 300], [1, 0]);
  const DISMISS_THRESHOLD = 100;

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayName = [session?.firstName, session?.lastName].filter(Boolean).join(' ') || 'User';
  const initials =
    `${session?.firstName?.charAt(0) ?? ''}${session?.lastName?.charAt(0) ?? ''}`.toUpperCase();

  useEffect(() => {
    setMounted(true);
  }, []);

  // ---- Measure avatar position to anchor the animation ----
  useEffect(() => {
    if (!open) return;
    // Find the visible avatar (the one with non-zero dimensions)
    const avatars = document.querySelectorAll<HTMLElement>('[data-profile-avatar]');
    let avatarRect: DOMRect | null = null;
    avatars.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) avatarRect = r;
    });
    if (!avatarRect) return;

    // The modal is centered in the viewport by flexbox, so its resting
    // center is roughly (viewportW/2, viewportH/2). We want the collapsed
    // point to be the avatar center.
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const avatarCx = (avatarRect as DOMRect).left + (avatarRect as DOMRect).width / 2;
    const avatarCy = (avatarRect as DOMRect).top + (avatarRect as DOMRect).height / 2;

    // Offset in px from modal center to avatar center
    setOriginOffset({
      x: avatarCx - vw / 2,
      y: avatarCy - vh / 2,
    });
  }, [open]);

  // ---- Focus management ----
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      const timer = setTimeout(() => closeButtonRef.current?.focus(), 350);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    if (!open && previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [open]);

  // ---- Close on Escape ----
  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  // ---- Close on route change ----
  const pathnameRef = useRef(pathname);
  useEffect(() => {
    if (open && pathname !== pathnameRef.current) {
      onClose();
    }
    pathnameRef.current = pathname;
  }, [pathname, open, onClose]);

  // ---- Fetch profile data ----
  const fetchProfile = useCallback(async () => {
    setIsLoadingProfile(true);
    try {
      const response = await fetch('/api/profile');
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      setProfileData({
        address: data.address ?? null,
        householdMembers: data.householdMembers ?? [],
      });
    } catch {
      setProfileData({
        address: null,
        householdMembers: [],
      });
    } finally {
      setIsLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      dragX.set(0);
      fetchProfile();
    }
  }, [open, fetchProfile, dragX]);

  // ---- Handlers ----
  const handleSignOut = async () => {
    const idToken = session?.idToken;
    await signOut({ redirect: false });
    const params = new URLSearchParams({
      post_logout_redirect_uri: window.location.origin,
    });
    if (idToken) params.set('id_token_hint', idToken);
    window.location.href = `${churchConfig.mpBaseUrl}/oauth/connect/endsession?${params.toString()}`;
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notification: Notification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
    );
    if (notification.url) {
      onClose();
      router.push(buildUrl(notification.url));
    }
  };

  const formatAddress = () => {
    if (!profileData?.address) return 'No address on file';
    const addr = profileData.address;
    const parts = [];
    if (addr.line1) parts.push(addr.line1);
    if (addr.line2) parts.push(addr.line2);
    if (addr.city || addr.state || addr.zip) {
      parts.push(`${addr.city || ''}, ${addr.state || ''} ${addr.zip || ''}`.trim());
    }
    return parts.length > 0 ? parts.join(', ') : 'No address on file';
  };

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      if (Math.abs(info.offset.x) > DISMISS_THRESHOLD || Math.abs(info.velocity.x) > 500) {
        onClose();
      }
    },
    [onClose]
  );

  const navigateTo = (route: string) => {
    onClose();
    router.push(buildUrl(route));
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="profile-backdrop"
            className="fixed inset-0 z-[65] bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={isMobile ? { opacity: backdropOpacity } : undefined}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Modal — swooshes out from the avatar (top-right), macOS genie style */}
          <div className="pointer-events-none fixed inset-0 z-[65] flex items-start justify-center p-4 pt-16 md:items-center md:pt-4">
            <motion.div
              ref={modalRef}
              key="profile-modal"
              initial={
                originOffset
                  ? { scale: 0.01, x: originOffset.x, y: originOffset.y }
                  : { scale: 0.01, x: '40%', y: '-40%' }
              }
              animate={{ scale: 1, x: 0, y: 0 }}
              exit={
                originOffset
                  ? { scale: 0.01, x: originOffset.x, y: originOffset.y }
                  : { scale: 0.01, x: '40%', y: '-40%' }
              }
              transition={{
                type: 'tween',
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1],
              }}
              // Swipe left/right to dismiss on mobile
              drag={isMobile ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.4}
              onDragEnd={handleDragEnd}
              style={isMobile ? { x: dragX } : undefined}
              className="bg-card pointer-events-auto flex max-h-[calc(100dvh-5rem)] w-full max-w-2xl flex-col overflow-hidden shadow-2xl md:max-h-[calc(100dvh-4rem)]"
            >
              {/* Header — green gradient with avatar */}
              <div
                className="relative shrink-0 overflow-hidden px-6 pt-6 pb-8"
                style={{ background: BRAND_GREEN_GRADIENT }}
              >
                {/* Watermark */}
                <div className="pointer-events-none absolute right-2 bottom-2 md:top-1/2 md:-right-4 md:bottom-auto md:-translate-y-1/2">
                  <User className="h-28 w-28 text-white opacity-10 md:h-40 md:w-40" />
                </div>

                {/* Close button */}
                <button
                  ref={closeButtonRef}
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
                  aria-label="Close profile"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Avatar + Name */}
                <div className="relative z-10 flex items-center gap-5">
                  {/* Avatar */}
                  <div className="rounded-full border-2 border-white/30 p-1">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-white/20">
                      {session?.image ? (
                        <img
                          src={session.image}
                          alt={displayName}
                          className="h-full w-full object-cover"
                        />
                      ) : initials ? (
                        <span className="text-2xl font-semibold text-white">{initials}</span>
                      ) : (
                        <User className="h-8 w-8 text-white" />
                      )}
                    </div>
                  </div>

                  {/* Name + email */}
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-semibold text-white">{displayName}</h2>
                    {session?.email && (
                      <p className="mt-0.5 text-sm text-white/70">{session.email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 gap-px border-t sm:grid-cols-2">
                  {/* Notifications */}
                  <div className="border-border/50 border-b sm:col-span-2">
                    <div className="flex items-center justify-between px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                          <Bell className="text-primary h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="text-foreground text-sm font-medium">Notifications</h3>
                          <p className="text-muted-foreground text-xs">
                            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                          </p>
                        </div>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-primary text-xs font-medium hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    {notifications.filter((n) => !n.read).length > 0 && (
                      <div className="border-border/50 border-t">
                        {notifications
                          .filter((n) => !n.read)
                          .map((n) => (
                            <button
                              key={n.id}
                              onClick={() => handleNotificationClick(n)}
                              className="hover:bg-muted/50 border-border/50 flex w-full items-start gap-3 border-b px-5 py-3 text-left transition-colors last:border-b-0"
                            >
                              <div className="bg-primary mt-1.5 h-2 w-2 shrink-0 rounded-full" />
                              <div className="min-w-0 flex-1">
                                <p className="text-foreground text-sm font-medium">{n.title}</p>
                                {n.description && (
                                  <p className="text-muted-foreground mt-0.5 text-xs">
                                    {n.description}
                                  </p>
                                )}
                              </div>
                            </button>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  <div className="border-border/50 border-b px-5 py-4 sm:border-r">
                    <h3 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
                      Address
                    </h3>
                    {isLoadingProfile ? (
                      <div className="bg-muted-foreground/10 h-4 w-3/4 animate-pulse" />
                    ) : profileData?.address?.line1 ? (
                      <div className="flex items-center gap-2">
                        <MapPin className="text-muted-foreground h-4 w-4 shrink-0" />
                        <p className="text-foreground text-sm">{formatAddress()}</p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No address on file</p>
                    )}
                  </div>

                  {/* Household */}
                  <div className="border-border/50 border-b px-5 py-4">
                    <h3 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
                      Household
                    </h3>
                    {isLoadingProfile ? (
                      <div className="space-y-2">
                        <div className="bg-muted-foreground/10 h-4 w-1/2 animate-pulse" />
                        <div className="bg-muted-foreground/10 h-4 w-1/3 animate-pulse" />
                      </div>
                    ) : profileData?.householdMembers?.length ? (
                      <div className="flex flex-col gap-2">
                        {profileData.householdMembers.map((member) => (
                          <div key={member.contactId} className="flex items-center gap-2.5">
                            <div className="bg-muted-foreground/20 flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full">
                              {member.imageUrl ? (
                                <img
                                  src={member.imageUrl}
                                  alt={`${member.firstName} ${member.lastName}`}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <User className="text-muted-foreground h-3.5 w-3.5" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-foreground text-sm">
                                {member.firstName} {member.lastName}
                              </p>
                              <p className="text-muted-foreground text-xs">{member.position}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No household members</p>
                    )}
                  </div>

                  {/* My Stuff — 4 items inline */}
                  <div className="border-border/50 border-b px-5 py-4 sm:col-span-2">
                    <h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
                      My Stuff
                    </h3>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {MY_STUFF_ITEMS.map((item) => {
                        const ItemIcon = item.icon;
                        return (
                          <button
                            key={item.route}
                            onClick={() => navigateTo(item.route)}
                            className="hover:bg-muted flex flex-col items-center gap-1.5 py-3 text-center transition-colors"
                          >
                            <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                              <ItemIcon className="text-primary h-5 w-5" />
                            </div>
                            <span className="text-foreground text-xs font-medium">
                              {item.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div className="border-border/50 flex items-center justify-between border-b px-5 py-3 sm:col-span-2">
                    <button
                      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                      className="flex items-center gap-1.5 hover:bg-transparent"
                    >
                      <Sun
                        className={`h-4 w-4 transition-colors ${theme === 'light' ? 'text-foreground' : 'text-muted-foreground/40'}`}
                      />
                      <div className="bg-muted flex h-5 w-9 items-center rounded-full px-0.5">
                        <div
                          className={`bg-foreground/70 h-4 w-4 rounded-full transition-all duration-200 ${theme === 'dark' ? 'translate-x-3.5' : 'translate-x-0'}`}
                        />
                      </div>
                      <Moon
                        className={`h-4 w-4 transition-colors ${theme === 'dark' ? 'text-foreground' : 'text-muted-foreground/40'}`}
                      />
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 text-sm text-red-500 hover:bg-transparent hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
