export interface TShirtSize {
  size: 'XS' | 'S' | 'M' | 'L';
  sprintRange: {
    min: number;
    max: number;
  };
  averageSprints: number;
}

export interface FeatureInput {
  xs: number;
  s: number;
  m: number;
  l: number;
}

export interface CapacityInput {
  totalManWeeks: number;
  sprintLengthWeeks: number;
}

export interface TimelineData {
  quarter: string;
  week: number;
  completedFeatures: number;
  remainingWork: number;
  capacityUsed: number;
}

export interface CompletionEstimate {
  totalSprints: number;
  totalWeeks: number;
  completionDate: Date;
  quarterlyBreakdown: QuarterlyBreakdown[];
}

export interface QuarterlyBreakdown {
  quarter: string;
  startDate: Date;
  endDate: Date;
  featuresCompleted: number;
  capacityUsed: number;
  remainingCapacity: number;
}

export type Role = 'SE' | 'SSE' | 'EL' | 'QE' | 'SQE' | 'DevOps';


export interface TeamMember {
  id: string;
  name: string;
  role: Role;
  baseCapacityPerSprint: number; // Full-time weeks per sprint (usually 2 for 2-week sprint)
  roleEffectiveness: number; // % of time spent on feature work (0.4-0.9)
  companyTenureMonths: number;
  teamTenureMonths: number;
  isUpskilling: boolean; // Currently learning new tech/domain
  holidays: HolidayPeriod[];
}

export interface HolidayPeriod {
  id: string;
  startDate: Date;
  endDate: Date;
  type: 'PTO' | 'Holiday' | 'Training' | 'Conference' | 'Sick';
  description?: string;
}

export interface Team {
  id: string;
  name: string;
  members: TeamMember[];
}

export interface AdvancedCapacityInput {
  team: Team;
  sprintLengthWeeks: number;
  planningStartDate: Date;
  planningEndDate: Date;
}

export interface EffectiveCapacity {
  memberId: string;
  memberName: string;
  baseCapacity: number;
  roleEffectiveness: number;
  tenureModifier: number;
  holidayReduction: number;
  effectiveCapacityPerSprint: number;
}