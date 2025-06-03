import React, { useState, useEffect } from 'react';
import { TeamMember, Role } from '../types';
import { calculateMemberEffectiveCapacity, getRoleEffectiveness } from '../utils/capacityCalculator';
import { useTeamStore } from '../store/teamStore';
import { Plus, Edit2, Trash2, Users, Calendar, TrendingUp } from 'lucide-react';
import HolidayManagement from './HolidayManagement';

interface TeamManagementProps {
  sprintLengthWeeks: number;
  planningStartDate: Date;
  planningEndDate: Date;
}

const TeamManagement: React.FC<TeamManagementProps> = ({
  sprintLengthWeeks,
  planningStartDate,
  planningEndDate,
}) => {
  const { members: storedMembers, addMember, updateMember, deleteMember } = useTeamStore();
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);


  const roles: Role[] = [
    'SE',
    'SSE', 
    'EL',
    'QE',
    'SQE',
    'DevOps'
  ];


  const createNewMember = (): TeamMember => ({
    id: Date.now().toString(),
    name: '',
    role: 'SE',
    baseCapacityPerSprint: sprintLengthWeeks,
    roleEffectiveness: getRoleEffectiveness('SE'),
    companyTenureMonths: 12,
    teamTenureMonths: 6,
    isUpskilling: false,
    holidays: [],
  });

  const handleAddMember = () => {
    setEditingMember(createNewMember());
    setShowAddForm(true);
  };

  const handleSaveMember = (member: TeamMember) => {
    if (showAddForm) {
      addMember(member);
      setShowAddForm(false);
    } else {
      updateMember(member.id, member);
    }
    setEditingMember(null);
  };

  const handleDeleteMember = (memberId: string) => {
    deleteMember(memberId);
  };

  const handleCancel = () => {
    setEditingMember(null);
    setShowAddForm(false);
  };

  return (
    <div className="team-management">
      <div className="team-header">
        <div className="header-content">
          <Users className="header-icon" />
          <h3>Team Management</h3>
          <div className="team-count-badge">{storedMembers.length} members</div>
        </div>
        <button onClick={handleAddMember} className="add-member-btn">
          <Plus size={16} />
          Add Team Member
        </button>
      </div>

      {editingMember && (
        <MemberForm
          member={editingMember}
          roles={roles}
          onSave={handleSaveMember}
          onCancel={handleCancel}
          isNew={showAddForm}
        />
      )}

      <div className="team-members">
        {storedMembers.map(member => {
          const effectiveCapacity = calculateMemberEffectiveCapacity(
            member,
            planningStartDate,
            planningEndDate
          );

          return (
            <div key={member.id} className="member-card">
              <div className="member-header">
                <div className="member-title">
                  <h4>{member.name}</h4>
                  <span className="role-badge">{member.role}</span>
                </div>
                <div className="member-actions">
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setEditingMember(member);
                      setShowAddForm(false);
                    }}
                    className="edit-btn"
                    title="Edit member"
                    type="button"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteMember(member.id);
                    }}
                    className="delete-btn"
                    title="Delete member"
                    type="button"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="member-details">
                <div className="detail-grid">
                  <div className="detail-item">
                    <TrendingUp className="detail-icon" size={14} />
                    <span className="label">Team Tenure:</span>
                    <span className="value">{member.teamTenureMonths}mo</span>
                  </div>
                  <div className="detail-item">
                    <TrendingUp className="detail-icon" size={14} />
                    <span className="label">Company Tenure:</span>
                    <span className="value">{member.companyTenureMonths}mo</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">🎯</span>
                    <span className="label">Upskilling:</span>
                    <span className={`value ${member.isUpskilling ? 'upskilling' : ''}`}>
                      {member.isUpskilling ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <Calendar className="detail-icon" size={14} />
                    <span className="label">Holidays:</span>
                    <span className="value">{member.holidays.length} periods</span>
                  </div>
                </div>
              </div>

              <div className="capacity-breakdown">
                <h5>Effective Capacity</h5>
                <div className="capacity-details">
                  <div className="capacity-row">
                    <span>Base Capacity:</span>
                    <span>{effectiveCapacity.baseCapacity.toFixed(1)} weeks/sprint</span>
                  </div>
                  <div className="capacity-row">
                    <span>Role Effectiveness:</span>
                    <span>{(effectiveCapacity.roleEffectiveness * 100).toFixed(0)}%</span>
                  </div>
                  <div className="capacity-row">
                    <span>Tenure Modifier:</span>
                    <span>{(effectiveCapacity.tenureModifier * 100).toFixed(0)}%</span>
                  </div>
                  <div className="capacity-row">
                    <span>Holiday Reduction:</span>
                    <span>{(effectiveCapacity.holidayReduction * 100).toFixed(0)}%</span>
                  </div>
                  <div className="capacity-row effective">
                    <span><strong>Effective Capacity:</strong></span>
                    <span><strong>{effectiveCapacity.effectiveCapacityPerSprint.toFixed(1)} weeks/sprint</strong></span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="team-summary">
        <h4>Team Summary</h4>
        <div className="summary-stats">
          <div className="stat">
            <span className="stat-label">Total Members:</span>
            <span className="stat-value">{storedMembers.length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Total Effective Capacity:</span>
            <span className="stat-value">
              {storedMembers.reduce((total, member) => {
                const capacity = calculateMemberEffectiveCapacity(
                  member,
                  planningStartDate,
                  planningEndDate
                );
                return total + capacity.effectiveCapacityPerSprint;
              }, 0).toFixed(1)} weeks/sprint
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface MemberFormProps {
  member: TeamMember;
  roles: Role[];
  onSave: (member: TeamMember) => void;
  onCancel: () => void;
  isNew: boolean;
}

const MemberForm: React.FC<MemberFormProps> = ({
  member,
  roles,
  onSave,
  onCancel,
  isNew,
}) => {
  const [formData, setFormData] = useState<TeamMember>(member);
  const [showHolidays, setShowHolidays] = useState(false);

  // Update form data when member prop changes
  React.useEffect(() => {
    setFormData(member);
  }, [member]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      const updatedMember = {
        ...formData,
        roleEffectiveness: getRoleEffectiveness(formData.role),
      };
      onSave(updatedMember);
    }
  };

  const handleChange = (field: keyof TeamMember, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="member-form-overlay">
      <form className="member-form" onSubmit={handleSubmit}>
        <h4>{isNew ? 'Add Team Member' : 'Edit Team Member'}</h4>
        
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Role:</label>
          <select
            value={formData.role}
            onChange={(e) => handleChange('role', e.target.value as Role)}
          >
            {roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Base Capacity (weeks per sprint):</label>
          <input
            type="number"
            value={formData.baseCapacityPerSprint}
            onChange={(e) => handleChange('baseCapacityPerSprint', parseFloat(e.target.value) || 0)}
            min="0"
            max="4"
            step="0.1"
          />
        </div>


        <div className="form-group">
          <label>Company Tenure (months):</label>
          <input
            type="number"
            value={formData.companyTenureMonths}
            onChange={(e) => handleChange('companyTenureMonths', parseInt(e.target.value) || 0)}
            min="0"
          />
        </div>

        <div className="form-group">
          <label>Team Tenure (months):</label>
          <input
            type="number"
            value={formData.teamTenureMonths}
            onChange={(e) => handleChange('teamTenureMonths', parseInt(e.target.value) || 0)}
            min="0"
          />
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={formData.isUpskilling}
              onChange={(e) => handleChange('isUpskilling', e.target.checked)}
            />
            Currently upskilling (learning new tech/domain)
          </label>
        </div>

        <div className="form-group">
          <label>Holidays & Time Off:</label>
          <div className="holidays-section">
            <span>{formData.holidays.length} holiday periods</span>
            <button 
              type="button" 
              onClick={() => setShowHolidays(!showHolidays)}
              className="manage-holidays-btn"
            >
              {showHolidays ? 'Hide' : 'Manage'} Holidays
            </button>
          </div>
        </div>

        {showHolidays && (
          <div className="holidays-container">
            <HolidayManagement
              holidays={formData.holidays}
              onHolidaysChange={(holidays) => handleChange('holidays', holidays)}
              memberName={formData.name || 'New Member'}
            />
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="save-btn">
            {isNew ? 'Add Member' : 'Save Changes'}
          </button>
          <button type="button" onClick={onCancel} className="cancel-btn">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeamManagement;