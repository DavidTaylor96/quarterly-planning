import React from 'react';
import { ArrowLeft } from 'lucide-react';
import TeamManagement from '../components/TeamManagement';

interface TeamManagementPageProps {
  sprintLengthWeeks: number;
  planningStartDate: Date;
  planningEndDate: Date;
  onBack: () => void;
}

const TeamManagementPage: React.FC<TeamManagementPageProps> = ({
  sprintLengthWeeks,
  planningStartDate,
  planningEndDate,
  onBack,
}) => {
  return (
    <div className="team-management-page">
      <div className="page-header">
        <button onClick={onBack} className="back-btn">
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <div className="page-title">
          <h1>Team Management</h1>
          <p>Configure your team members, roles, and availability</p>
        </div>
      </div>

      <TeamManagement
        sprintLengthWeeks={sprintLengthWeeks}
        planningStartDate={planningStartDate}
        planningEndDate={planningEndDate}
      />
    </div>
  );
};

export default TeamManagementPage;