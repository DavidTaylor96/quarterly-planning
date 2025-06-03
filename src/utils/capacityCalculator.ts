import { addWeeks, addQuarters, startOfQuarter, endOfQuarter, format, isWithinInterval } from 'date-fns';
import { 
  TShirtSize, 
  FeatureInput, 
  CapacityInput, 
  CompletionEstimate, 
  QuarterlyBreakdown, 
  TimelineData,
  TeamMember,
  Role,
  AdvancedCapacityInput,
  EffectiveCapacity,
  HolidayPeriod
} from '../types';

export const T_SHIRT_SIZES: TShirtSize[] = [
  { size: 'XS', sprintRange: { min: 1, max: 1 }, averageSprints: 1 },
  { size: 'S', sprintRange: { min: 2, max: 4 }, averageSprints: 3 },
  { size: 'M', sprintRange: { min: 4, max: 12 }, averageSprints: 8 },
  { size: 'L', sprintRange: { min: 12, max: 24 }, averageSprints: 18 },
];

export function calculateTotalSprintsRequired(features: FeatureInput): number {
  const xsSpints = features.xs * T_SHIRT_SIZES[0].averageSprints;
  const sSpints = features.s * T_SHIRT_SIZES[1].averageSprints;
  const mSpints = features.m * T_SHIRT_SIZES[2].averageSprints;
  const lSpints = features.l * T_SHIRT_SIZES[3].averageSprints;
  
  return xsSpints + sSpints + mSpints + lSpints;
}

export function calculateCapacityPerSprint(capacity: CapacityInput): number {
  return capacity.totalManWeeks / capacity.sprintLengthWeeks;
}

export function calculateCompletionEstimate(
  features: FeatureInput,
  capacity: CapacityInput,
  startDate: Date = new Date()
): CompletionEstimate {
  const totalSprintsRequired = calculateTotalSprintsRequired(features);
  const capacityPerSprint = calculateCapacityPerSprint(capacity);
  
  const totalSprints = Math.ceil(totalSprintsRequired / capacityPerSprint);
  const totalWeeks = totalSprints * capacity.sprintLengthWeeks;
  const completionDate = addWeeks(startDate, totalWeeks);
  
  const quarterlyBreakdown = generateQuarterlyBreakdown(
    startDate,
    completionDate,
    totalSprintsRequired,
    capacity
  );

  return {
    totalSprints,
    totalWeeks,
    completionDate,
    quarterlyBreakdown,
  };
}

function generateQuarterlyBreakdown(
  startDate: Date,
  endDate: Date,
  totalWork: number,
  capacity: CapacityInput
): QuarterlyBreakdown[] {
  const breakdown: QuarterlyBreakdown[] = [];
  let currentDate = startOfQuarter(startDate);
  let remainingWork = totalWork;
  
  while (currentDate < endDate) {
    const quarterEnd = endOfQuarter(currentDate);
    const weeksInQuarter = Math.ceil((quarterEnd.getTime() - currentDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const sprintsInQuarter = Math.floor(weeksInQuarter / capacity.sprintLengthWeeks);
    const capacityThisQuarter = sprintsInQuarter * calculateCapacityPerSprint(capacity);
    
    const workCompletedThisQuarter = Math.min(remainingWork, capacityThisQuarter);
    remainingWork -= workCompletedThisQuarter;
    
    breakdown.push({
      quarter: format(currentDate, 'yyyy Q'),
      startDate: currentDate,
      endDate: quarterEnd,
      featuresCompleted: workCompletedThisQuarter,
      capacityUsed: workCompletedThisQuarter,
      remainingCapacity: capacityThisQuarter - workCompletedThisQuarter,
    });
    
    currentDate = addQuarters(currentDate, 1);
  }
  
  return breakdown;
}

export function generateTimelineData(
  features: FeatureInput,
  capacity: CapacityInput,
  startDate: Date = new Date()
): TimelineData[] {
  const totalWork = calculateTotalSprintsRequired(features);
  const capacityPerSprint = calculateCapacityPerSprint(capacity);
  const timelineData: TimelineData[] = [];
  
  let remainingWork = totalWork;
  let currentDate = startDate;
  let week = 0;
  
  while (remainingWork > 0) {
    const workThisSprint = Math.min(remainingWork, capacityPerSprint);
    remainingWork -= workThisSprint;
    
    timelineData.push({
      quarter: format(currentDate, 'yyyy Q'),
      week: week + 1,
      completedFeatures: totalWork - remainingWork,
      remainingWork,
      capacityUsed: workThisSprint,
    });
    
    currentDate = addWeeks(currentDate, capacity.sprintLengthWeeks);
    week += capacity.sprintLengthWeeks;
  }
  
  return timelineData;
}

// Advanced team-based capacity calculations

export function getRoleEffectiveness(role: Role): number {
  const roleEffectiveness: Record<Role, number> = {
    'SE': 0.7,        // 70% - Senior Engineer: code reviews, mentoring
    'SSE': 0.8,       // 80% - Staff Senior Engineer: high productivity with some mentoring
    'EL': 0.5,        // 50% - Engineering Lead (line manager and lead software engineer): split between leading and coding
    'QE': 0.75,       // 75% - Quality Engineer: focused on testing and quality
    'SQE': 0.8,       // 80% - Senior Quality Engineer: experienced QE with mentoring duties
    'DevOps': 0.85,   // 85% - DevOps Engineer: specialized infrastructure work
  };
  return roleEffectiveness[role];
}

export function getTenureModifier(
  teamTenureMonths: number,
  companyTenureMonths: number,
  isUpskilling: boolean
): number {
  // Team tenure adjustment (ramp-up time)
  let tenureModifier = 1.0;
  if (teamTenureMonths < 1) {
    tenureModifier = 0.5; // First month - very low productivity
  } else if (teamTenureMonths < 3) {
    tenureModifier = 0.7; // 1-3 months - still ramping up
  } else if (teamTenureMonths < 6) {
    tenureModifier = 0.85; // 3-6 months - getting comfortable
  }
  
  // Company tenure adjustment (company-specific knowledge)
  let companyModifier = 1.0;
  if (companyTenureMonths < 1) {
    companyModifier = 0.8; // New to company processes
  } else if (companyTenureMonths < 6) {
    companyModifier = 0.9; // Still learning company way
  }
  
  // Upskilling penalty
  const upskillingModifier = isUpskilling ? 0.8 : 1.0; // 20% reduction if learning new tech
  
  return tenureModifier * companyModifier * upskillingModifier;
}

export function calculateHolidayReduction(
  holidays: HolidayPeriod[],
  planningStartDate: Date,
  planningEndDate: Date
): number {
  const planningInterval = { start: planningStartDate, end: planningEndDate };
  let totalHolidayWeeks = 0;
  
  holidays.forEach(holiday => {
    
    // Check if holiday overlaps with planning period
    if (
      isWithinInterval(holiday.startDate, planningInterval) ||
      isWithinInterval(holiday.endDate, planningInterval) ||
      (holiday.startDate <= planningStartDate && holiday.endDate >= planningEndDate)
    ) {
      // Calculate overlap
      const overlapStart = holiday.startDate > planningStartDate ? holiday.startDate : planningStartDate;
      const overlapEnd = holiday.endDate < planningEndDate ? holiday.endDate : planningEndDate;
      
      const overlapWeeks = Math.max(0, (overlapEnd.getTime() - overlapStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
      totalHolidayWeeks += overlapWeeks;
    }
  });
  
  const totalPlanningWeeks = (planningEndDate.getTime() - planningStartDate.getTime()) / (7 * 24 * 60 * 60 * 1000);
  return Math.min(1, totalHolidayWeeks / totalPlanningWeeks); // Cap at 100% reduction
}

export function calculateMemberEffectiveCapacity(
  member: TeamMember,
  planningStartDate: Date,
  planningEndDate: Date
): EffectiveCapacity {
  const roleEffectiveness = getRoleEffectiveness(member.role);
  const tenureModifier = getTenureModifier(
    member.teamTenureMonths,
    member.companyTenureMonths,
    member.isUpskilling
  );
  const holidayReduction = calculateHolidayReduction(
    member.holidays,
    planningStartDate,
    planningEndDate
  );
  
  const effectiveCapacityPerSprint = 
    member.baseCapacityPerSprint * 
    roleEffectiveness * 
    tenureModifier * 
    (1 - holidayReduction);
  
  return {
    memberId: member.id,
    memberName: member.name,
    baseCapacity: member.baseCapacityPerSprint,
    roleEffectiveness,
    tenureModifier,
    holidayReduction,
    effectiveCapacityPerSprint,
  };
}

export function calculateTeamEffectiveCapacity(
  capacityInput: AdvancedCapacityInput
): EffectiveCapacity[] {
  return capacityInput.team.members.map(member =>
    calculateMemberEffectiveCapacity(
      member,
      capacityInput.planningStartDate,
      capacityInput.planningEndDate
    )
  );
}

export function calculateAdvancedCompletionEstimate(
  features: FeatureInput,
  capacityInput: AdvancedCapacityInput
): CompletionEstimate {
  const memberCapacities = calculateTeamEffectiveCapacity(capacityInput);
  const totalTeamCapacityPerSprint = memberCapacities.reduce(
    (sum, member) => sum + member.effectiveCapacityPerSprint,
    0
  );
  
  const totalSprintsRequired = calculateTotalSprintsRequired(features);
  const totalSprints = Math.ceil(totalSprintsRequired / totalTeamCapacityPerSprint);
  const totalWeeks = totalSprints * capacityInput.sprintLengthWeeks;
  const completionDate = addWeeks(capacityInput.planningStartDate, totalWeeks);
  
  // Convert to legacy CapacityInput format for quarterly breakdown
  const legacyCapacity: CapacityInput = {
    totalManWeeks: totalTeamCapacityPerSprint * capacityInput.sprintLengthWeeks,
    sprintLengthWeeks: capacityInput.sprintLengthWeeks,
  };
  
  const quarterlyBreakdown = generateQuarterlyBreakdown(
    capacityInput.planningStartDate,
    completionDate,
    totalSprintsRequired,
    legacyCapacity
  );
  
  return {
    totalSprints,
    totalWeeks,
    completionDate,
    quarterlyBreakdown,
  };
}