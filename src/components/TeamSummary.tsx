import React from 'react';
import { Users, ArrowRight, Plus, TrendingUp } from 'lucide-react';
import { TeamMember } from '../types';
import { calculateMemberEffectiveCapacity } from '../utils/capacityCalculator';
import { analyzeTeamCapacity } from '../utils/teamInsights';

interface TeamSummaryProps {
  members: TeamMember[];
  planningStartDate: Date;
  planningEndDate: Date;
  onManageTeam: () => void;
}

const TeamSummary: React.FC<TeamSummaryProps> = ({
  members,
  planningStartDate,
  planningEndDate,
  onManageTeam,
}) => {
  const totalEffectiveCapacity = members.reduce((total, member) => {
    const capacity = calculateMemberEffectiveCapacity(
      member,
      planningStartDate,
      planningEndDate
    );
    return total + capacity.effectiveCapacityPerSprint;
  }, 0);

  const teamInsights = analyzeTeamCapacity(members, planningStartDate, planningEndDate);

  if (members.length === 0) {
    return (
      <div className="card team-summary-empty">
        <div className="card-header">
          <Users className="card-icon" style={{color: '#3b82f6'}} />
          <h2>Team Configuration</h2>
        </div>
        <div className="empty-state">
          <Users size={48} className="empty-icon" />
          <h3>No team members added</h3>
          <p>Add team members to get accurate capacity planning based on roles, experience, and availability.</p>
          <button onClick={onManageTeam} className="manage-team-btn primary">
            <Plus size={16} />
            Add Team Members
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card team-summary">
      <div className="card-header">
        <Users className="card-icon" style={{color: '#3b82f6'}} />
        <h2>Team Overview</h2>
        <button onClick={onManageTeam} className="manage-team-btn">
          Manage Team
          <ArrowRight size={16} />
        </button>
      </div>
      
      <div className="team-stats">
        <div className="stat-card">
          <div className="stat-value">{members.length}</div>
          <div className="stat-label">Team Members</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalEffectiveCapacity.toFixed(1)}</div>
          <div className="stat-label">Effective Capacity<br/>(weeks/sprint)</div>
        </div>
      </div>

      {teamInsights.keyInsights.length > 0 && (
        <div className="team-insights">
          <h4>
            <TrendingUp size={16} />
            Capacity Insights
          </h4>
          <div className="insights-list">
            {teamInsights.keyInsights.map((insight, index) => (
              <div key={index} className="insight-item">
                <div className="insight-content">
                  {insight}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="team-capacity-breakdown">
        <h4>Senior vs Junior Capacity</h4>
        <div className="capacity-breakdown-stats">
          <div className="breakdown-item">
            <span className="breakdown-label">Senior Engineers (SSE/EL)</span>
            <span className="breakdown-value">{teamInsights.seniorEngineersCapacity.toFixed(1)}w</span>
            <span className="breakdown-percentage">
              {totalEffectiveCapacity > 0 ? Math.round((teamInsights.seniorEngineersCapacity / totalEffectiveCapacity) * 100) : 0}%
            </span>
          </div>
          <div className="breakdown-item">
            <span className="breakdown-label">Other Engineers</span>
            <span className="breakdown-value">{teamInsights.juniorEngineersCapacity.toFixed(1)}w</span>
            <span className="breakdown-percentage">
              {totalEffectiveCapacity > 0 ? Math.round((teamInsights.juniorEngineersCapacity / totalEffectiveCapacity) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      <div className="team-members-preview">
        <h4>Team Members</h4>
        <div className="members-list">
          {members.slice(0, 4).map(member => (
            <div key={member.id} className="member-preview">
              <div className="member-info">
                <span className="member-name">{member.name}</span>
                <span className="member-role">{member.role}</span>
              </div>
              <div className="member-capacity">
                {calculateMemberEffectiveCapacity(
                  member,
                  planningStartDate,
                  planningEndDate
                ).effectiveCapacityPerSprint.toFixed(1)}w
              </div>
            </div>
          ))}
          {members.length > 4 && (
            <div className="member-preview more">
              <span>+{members.length - 4} more members</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamSummary;