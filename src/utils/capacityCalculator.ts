import { addWeeks, addQuarters, startOfQuarter, endOfQuarter, format } from 'date-fns';
import { TShirtSize, FeatureInput, CapacityInput, CompletionEstimate, QuarterlyBreakdown, TimelineData } from '../types';

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