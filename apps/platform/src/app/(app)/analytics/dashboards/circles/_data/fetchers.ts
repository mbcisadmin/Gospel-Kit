import type {
  FilterConfig,
  MilestoneSection,
  OverTimeData,
  ParticipantRow,
  FiscalPeriod,
} from './types';
import {
  mockFetchFilters,
  mockFetchParticipants,
  mockFetchMilestones,
  mockFetchFiscalPeriods,
  mockFetchOverTimeData,
} from './mock-data';

// Circles dashboard always uses mock data — the stored procedures are
// Granger-specific and won't exist on other MP instances. The dashboard
// serves as a demo/example of the charting patterns.

export async function fetchFilters(): Promise<FilterConfig[]> {
  return mockFetchFilters();
}

export async function fetchParticipants(): Promise<ParticipantRow[]> {
  return mockFetchParticipants();
}

export async function fetchMilestones(): Promise<MilestoneSection[]> {
  return mockFetchMilestones();
}

export async function fetchFiscalPeriods(): Promise<FiscalPeriod[]> {
  return mockFetchFiscalPeriods();
}

export async function fetchOverTimeData(asOfFiscalPeriodId?: number): Promise<OverTimeData> {
  return mockFetchOverTimeData(asOfFiscalPeriodId);
}
