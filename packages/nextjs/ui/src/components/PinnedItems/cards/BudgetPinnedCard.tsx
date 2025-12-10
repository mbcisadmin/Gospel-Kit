'use client';

import { User } from 'lucide-react';
import type { PinnedItem } from '@church/database';

interface BudgetPinnedCardProps {
  item: PinnedItem;
}

function calculatePercentage(actual: string, expected: string): number {
  const actualNum = parseFloat(actual.replace(/[$,]/g, ''));
  const expectedNum = parseFloat(expected.replace(/[$,]/g, ''));
  if (expectedNum === 0) return 0;
  return (actualNum / expectedNum) * 100;
}

export function BudgetPinnedCard({ item }: BudgetPinnedCardProps) {
  const { title, subtitle, stats } = item.item_data;

  // Extract expenses and income from stats
  const expenses = stats?.find((s) => s.label === 'Expenses');
  const income = stats?.find((s) => s.label === 'Income');

  const expensesPercent =
    expenses?.actual && expenses?.expected
      ? calculatePercentage(expenses.actual, expenses.expected)
      : 0;
  const incomePercent =
    income?.actual && income?.expected ? calculatePercentage(income.actual, income.expected) : 0;

  return (
    <div className="p-6">
      <h2 className="text-foreground mb-4 pr-8 text-lg font-bold transition-colors hover:text-[#61BC47]">
        {title}
      </h2>

      {subtitle && (
        <div className="text-muted-foreground hover:text-foreground mb-3 flex items-center gap-2 text-sm transition-colors">
          <User className="h-4 w-4" />
          <span>{subtitle}</span>
        </div>
      )}

      <div className="border-border space-y-4 border-t pt-4">
        {expenses && (
          <div className="border-border/50 border-b pb-3">
            <div className="text-foreground mb-2 text-xs font-semibold">Expenses</div>
            <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className={`h-full rounded-full transition-all ${
                  expensesPercent < 90
                    ? 'bg-[#61bc47]'
                    : expensesPercent < 100
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(expensesPercent, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">actual</span>
                <span className="text-foreground text-sm font-bold">{expenses.actual}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-muted-foreground text-xs">expected</span>
                <span className="text-foreground text-sm font-bold">{expenses.expected}</span>
              </div>
            </div>
          </div>
        )}

        {income && (
          <div>
            <div className="text-foreground mb-2 text-xs font-semibold">Income</div>
            <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className={`h-full rounded-full transition-all ${
                  incomePercent < 90
                    ? 'bg-[#61bc47]'
                    : incomePercent < 100
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(incomePercent, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">actual</span>
                <span className="text-foreground text-sm font-bold">{income.actual}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-muted-foreground text-xs">expected</span>
                <span className="text-foreground text-sm font-bold">{income.expected}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
