'use client';

import { PageActions, PageActionButton } from '../components/PageActions';
import { usePageActions } from './PageActionsContext';

/**
 * Desktop action bar — reads from PageActionsContext, renders PageActionButtons
 * inline wherever it's placed (typically in a SectionHeader's `actions` prop).
 *
 * Hidden on mobile (md:flex). Returns null when there are no actions.
 */
export function DesktopActionBar() {
  const allActions = usePageActions();

  // Filter to non-selfRendered, visible actions
  const actions = allActions.filter((a) => !a.selfRendered);

  if (actions.length === 0) return null;

  return (
    <PageActions className="hidden md:flex">
      {actions.map((action) => {
        const hasBadge = action.badge != null && action.badge > 0;
        return (
          <div key={action.key} className="relative">
            <PageActionButton
              icon={action.icon}
              label={action.label}
              onClick={action.onAction}
              variant={action.variant}
            />
            {hasBadge && (
              <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900" />
            )}
          </div>
        );
      })}
    </PageActions>
  );
}
