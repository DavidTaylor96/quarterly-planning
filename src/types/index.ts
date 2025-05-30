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