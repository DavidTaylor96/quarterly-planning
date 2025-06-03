import { TeamMember, Role } from '../types';
import { calculateMemberEffectiveCapacity } from './capacityCalculator';

export interface TeamInsights {
  newStartersCount: number;
  holidayImpactedMembers: number;
  totalHolidayDays: number;
  seniorEngineersCapacity: number;
  juniorEngineersCapacity: number;
  upskilllingMembers: number;
  keyInsights: string[];
  capacityDistribution: {
    role: Role;
    count: number;
    totalCapacity: number;
    averageCapacity: number;
  }[];
  tenureDistribution: {
    category: string;
    count: number;
    totalCapacity: number;
  }[];
}

export const analyzeTeamCapacity = (
  members: TeamMember[],
  planningStartDate: Date,
  planningEndDate: Date
): TeamInsights => {
  if (members.length === 0) {
    return {
      newStartersCount: 0,
      holidayImpactedMembers: 0,
      totalHolidayDays: 0,
      seniorEngineersCapacity: 0,
      juniorEngineersCapacity: 0,
      upskilllingMembers: 0,
      keyInsights: [],
      capacityDistribution: [],
      tenureDistribution: []
    };
  }

  // Calculate individual capacities
  const memberCapacities = members.map(member => ({
    member,
    capacity: calculateMemberEffectiveCapacity(member, planningStartDate, planningEndDate)
  }));

  // Analyze new starters (team tenure < 6 months)
  const newStartersCount = members.filter(m => m.teamTenureMonths < 6).length;

  // Analyze holiday impact
  const holidayImpactedMembers = members.filter(m => m.holidays.length > 0).length;
  const totalHolidayDays = members.reduce((total, member) => {
    return total + member.holidays.reduce((memberTotal, holiday) => {
      const start = new Date(holiday.startDate);
      const end = new Date(holiday.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return memberTotal + days;
    }, 0);
  }, 0);

  // Analyze upskilling members
  const upskilllingMembers = members.filter(m => m.isUpskilling).length;

  // Analyze senior vs junior capacity
  const seniorRoles = ['SSE', 'EL'];
  const seniorMembers = memberCapacities.filter(mc => seniorRoles.includes(mc.member.role));
  const juniorMembers = memberCapacities.filter(mc => !seniorRoles.includes(mc.member.role));

  const seniorEngineersCapacity = seniorMembers.reduce((total, mc) => total + mc.capacity.effectiveCapacityPerSprint, 0);
  const juniorEngineersCapacity = juniorMembers.reduce((total, mc) => total + mc.capacity.effectiveCapacityPerSprint, 0);

  // Role distribution analysis
  const roleGroups = members.reduce((acc, member) => {
    const capacity = memberCapacities.find(mc => mc.member.id === member.id)?.capacity.effectiveCapacityPerSprint || 0;
    if (!acc[member.role]) {
      acc[member.role] = { count: 0, totalCapacity: 0 };
    }
    acc[member.role].count++;
    acc[member.role].totalCapacity += capacity;
    return acc;
  }, {} as Record<Role, { count: number; totalCapacity: number }>);

  const capacityDistribution = Object.entries(roleGroups).map(([role, data]) => ({
    role: role as Role,
    count: data.count,
    totalCapacity: data.totalCapacity,
    averageCapacity: data.totalCapacity / data.count
  }));

  // Tenure distribution
  const tenureGroups = members.reduce((acc, member) => {
    const capacity = memberCapacities.find(mc => mc.member.id === member.id)?.capacity.effectiveCapacityPerSprint || 0;
    
    let category: string;
    if (member.teamTenureMonths < 3) {
      category = 'New (< 3 months)';
    } else if (member.teamTenureMonths < 12) {
      category = 'Ramping (3-12 months)';
    } else {
      category = 'Established (12+ months)';
    }
    
    if (!acc[category]) {
      acc[category] = { count: 0, totalCapacity: 0 };
    }
    acc[category].count++;
    acc[category].totalCapacity += capacity;
    return acc;
  }, {} as Record<string, { count: number; totalCapacity: number }>);

  const tenureDistribution = Object.entries(tenureGroups).map(([category, data]) => ({
    category,
    count: data.count,
    totalCapacity: data.totalCapacity
  }));

  // Generate key insights
  const keyInsights: string[] = [];

  // New starters insight
  if (newStartersCount > 0) {
    const newStarterPercentage = Math.round((newStartersCount / members.length) * 100);
    if (newStarterPercentage >= 30) {
      keyInsights.push(`⚠️ High new starter impact: ${newStartersCount} members (${newStarterPercentage}%) are new to the team (<6mo), reducing overall velocity`);
    } else if (newStarterPercentage >= 15) {
      keyInsights.push(`🔄 Moderate onboarding load: ${newStartersCount} new team members may need additional support`);
    }
  }

  // Holiday impact insight
  if (holidayImpactedMembers > 0) {
    const holidayPercentage = Math.round((holidayImpactedMembers / members.length) * 100);
    if (holidayPercentage >= 40) {
      keyInsights.push(`🏖️ Significant holiday impact: ${holidayImpactedMembers} members (${holidayPercentage}%) have planned time off totaling ${totalHolidayDays} days`);
    } else if (totalHolidayDays >= 10) {
      keyInsights.push(`📅 Moderate holiday impact: ${totalHolidayDays} total holiday days across ${holidayImpactedMembers} members`);
    }
  }

  // Senior capacity insight
  const totalCapacity = seniorEngineersCapacity + juniorEngineersCapacity;
  if (totalCapacity > 0) {
    const seniorPercentage = Math.round((seniorEngineersCapacity / totalCapacity) * 100);
    if (seniorPercentage >= 60) {
      keyInsights.push(`🎯 Strong senior capacity: ${seniorPercentage}% of capacity from SSE/EL level (${seniorEngineersCapacity.toFixed(1)}w/sprint) - good for complex features`);
    } else if (seniorPercentage <= 30) {
      keyInsights.push(`⚡ Junior-heavy team: Only ${seniorPercentage}% senior capacity - may need more mentoring time for complex features`);
    } else {
      keyInsights.push(`⚖️ Balanced experience mix: ${seniorPercentage}% senior capacity provides good balance of delivery and mentoring`);
    }
  }

  // Upskilling insight
  if (upskilllingMembers > 0) {
    const upskillPercentage = Math.round((upskilllingMembers / members.length) * 100);
    if (upskillPercentage >= 25) {
      keyInsights.push(`📚 High learning overhead: ${upskilllingMembers} members (${upskillPercentage}%) are upskilling, reducing sprint capacity by ~20%`);
    } else if (upskilllingMembers >= 2) {
      keyInsights.push(`🚀 Learning in progress: ${upskilllingMembers} members are upskilling in new technologies/domains`);
    }
  }

  // Role distribution insight
  const hasQE = capacityDistribution.some(d => d.role === 'QE' || d.role === 'SQE');
  const hasDevOps = capacityDistribution.some(d => d.role === 'DevOps');
  
  if (!hasQE && members.length >= 3) {
    keyInsights.push(`🧪 No dedicated QE capacity - development team will need to handle testing, potentially slowing feature delivery`);
  }
  
  if (!hasDevOps && members.length >= 5) {
    keyInsights.push(`⚙️ No dedicated DevOps capacity - deployment and infrastructure work may slow down development velocity`);
  }

  // Tenure concerns
  const newMembersCount = tenureDistribution.find(d => d.category === 'New (< 3 months)')?.count || 0;
  if (newMembersCount > 0 && members.length <= 4) {
    keyInsights.push(`👶 High mentoring need: ${newMembersCount} very new members in small team will require significant senior support`);
  }

  return {
    newStartersCount,
    holidayImpactedMembers,
    totalHolidayDays,
    seniorEngineersCapacity,
    juniorEngineersCapacity,
    upskilllingMembers,
    keyInsights,
    capacityDistribution,
    tenureDistribution
  };
};