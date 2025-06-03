import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Line, Area, AreaChart } from 'recharts';
import { Calendar, Users, Clock, TrendingUp, AlertTriangle, HelpCircle } from 'lucide-react';
import './App.css';
import TeamSummary from './components/TeamSummary';
import TeamManagementPage from './pages/TeamManagementPage';
import { TeamMember, Team, AdvancedCapacityInput, FeatureInput } from './types';
import { calculateTeamEffectiveCapacity } from './utils/capacityCalculator';
import { useTeamStore } from './store/teamStore';

const CapacityPlanningDashboard = () => {
  const [selectedQuarter, setSelectedQuarter] = useState('Q3');
  const [capacity, setCapacity] = useState(40); // man-weeks for selected quarter
  const [useTeamManagement, setUseTeamManagement] = useState(false);
  const [showTeamManagementPage, setShowTeamManagementPage] = useState(false);
  const [sprintLengthWeeks, setSprintLengthWeeks] = useState(2);
  
  const [features, setFeatures] = useState<FeatureInput>({
    xs: 5,
    s: 8,
    m: 4,
    l: 2
  });

  const { members } = useTeamStore();

  type TShirtSize = 'xs' | 's' | 'm' | 'l';

  // T-shirt size definitions (in sprints)
  const tshirtSizes: Record<TShirtSize, { min: number; max: number; avg: number; label: string; color: string }> = {
    xs: { min: 1, max: 1, avg: 1, label: 'XS (1 sprint)', color: '#10b981' },
    s: { min: 2, max: 4, avg: 3, label: 'S (2-4 sprints)', color: '#3b82f6' },
    m: { min: 4, max: 12, avg: 8, label: 'M (4-12 sprints)', color: '#f59e0b' },
    l: { min: 12, max: 24, avg: 18, label: 'L (12+ sprints)', color: '#ef4444' }
  };

  // Assuming 2-week sprints and 40 hours per week
  const hoursPerSprint = 80; // 2 weeks * 40 hours

  const calculations = useMemo(() => {
    let quarterCapacity: number;
    
    if (useTeamManagement && members.length > 0) {
      // Calculate team-based capacity for the quarter
      const quarterStartDate = new Date(2024, (parseInt(selectedQuarter.charAt(1)) - 1) * 3, 1);
      const quarterEndDate = new Date(2024, parseInt(selectedQuarter.charAt(1)) * 3, 0);
      
      const team: Team = {
        id: 'main-team',
        name: 'Development Team',
        members
      };
      
      const advancedCapacityInput: AdvancedCapacityInput = {
        team,
        sprintLengthWeeks,
        planningStartDate: quarterStartDate,
        planningEndDate: quarterEndDate,
      };
      
      const teamCapacities = calculateTeamEffectiveCapacity(advancedCapacityInput);
      const teamCapacityPerSprint = teamCapacities.reduce(
        (sum, member) => sum + member.effectiveCapacityPerSprint,
        0
      );
      
      // Convert to quarterly capacity (assuming 13 weeks per quarter)
      const sprintsPerQuarter = 13 / sprintLengthWeeks;
      quarterCapacity = teamCapacityPerSprint * sprintsPerQuarter;
    } else {
      // Use simple man-weeks calculation
      quarterCapacity = (capacity * 40) / hoursPerSprint;
    }

    // Calculate total effort needed (in sprints)
    const totalEffort = Object.entries(features).reduce((total, [size, count]) => {
      return total + (count * tshirtSizes[size as TShirtSize].avg);
    }, 0);

    // Calculate effort breakdown by t-shirt size
    const effortBreakdown = Object.entries(features).map(([size, count]) => ({
      name: tshirtSizes[size as TShirtSize].label,
      value: count * tshirtSizes[size as TShirtSize].avg,
      count: count,
      color: tshirtSizes[size as TShirtSize].color
    })).filter(item => item.value > 0);

    // Determine completion scenario
    const canCompleteInQuarter = totalEffort <= quarterCapacity;
    const utilizationRate = quarterCapacity > 0 ? (totalEffort / quarterCapacity * 100) : 0;
    
    // If work extends beyond selected quarter, estimate additional quarters needed
    let additionalQuartersNeeded = 0;
    let estimatedCompletionQuarter = selectedQuarter;
    
    if (!canCompleteInQuarter && quarterCapacity > 0) {
      const remainingWork = totalEffort - quarterCapacity;
      additionalQuartersNeeded = Math.ceil(remainingWork / quarterCapacity);
      
      // Calculate estimated completion quarter
      const quarterNum = parseInt(selectedQuarter.charAt(1));
      const totalQuartersNeeded = quarterNum + additionalQuartersNeeded;
      
      if (totalQuartersNeeded <= 4) {
        estimatedCompletionQuarter = `Q${totalQuartersNeeded}`;
      } else {
        const yearsAhead = Math.floor((totalQuartersNeeded - 1) / 4);
        const finalQuarter = ((totalQuartersNeeded - 1) % 4) + 1;
        estimatedCompletionQuarter = `Q${finalQuarter} ${yearsAhead > 0 ? `+${yearsAhead}Y` : ''}`;
      }
    }

    // Create quarterly timeline data for burndown chart
    const quartersToShow = Math.max(4, Math.ceil(totalEffort / quarterCapacity) + 1);
    const quarterlyData = [];
    let remainingWork = totalEffort;
    
    for (let i = 0; i < quartersToShow; i++) {
      const quarterName = `Q${((parseInt(selectedQuarter.charAt(1)) + i - 1) % 4) + 1}`;
      const workThisQuarter = Math.min(remainingWork, quarterCapacity);
      remainingWork = Math.max(0, remainingWork - quarterCapacity);
      
      quarterlyData.push({
        quarter: quarterName,
        capacity: quarterCapacity,
        plannedWork: workThisQuarter,
        remainingWork: remainingWork,
        cumulativeCompleted: totalEffort - remainingWork - workThisQuarter
      });
    }

    // Create chart data for current quarter planning
    const chartData = [{
      name: selectedQuarter,
      capacity: quarterCapacity,
      plannedWork: Math.min(totalEffort, quarterCapacity),
      overflow: Math.max(0, totalEffort - quarterCapacity)
    }];

    return {
      totalEffort,
      quarterCapacity,
      canCompleteInQuarter,
      utilizationRate,
      additionalQuartersNeeded,
      estimatedCompletionQuarter,
      effortBreakdown,
      chartData,
      quarterlyData,
      remainingWork: Math.max(0, totalEffort - quarterCapacity)
    };
  }, [capacity, features, selectedQuarter, useTeamManagement, members, sprintLengthWeeks]);

  const handleFeatureChange = (size: TShirtSize, value: string) => {
    setFeatures(prev => ({
      ...prev,
      [size]: parseInt(value) || 0
    }));
  };


  if (showTeamManagementPage) {
    return (
      <TeamManagementPage
        members={members}
        onMembersChange={() => {}} // No longer needed as store is used directly
        sprintLengthWeeks={sprintLengthWeeks}
        planningStartDate={new Date(2024, (parseInt(selectedQuarter.charAt(1)) - 1) * 3, 1)}
        planningEndDate={new Date(2024, parseInt(selectedQuarter.charAt(1)) * 3, 0)}
        onBack={() => setShowTeamManagementPage(false)}
      />
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Smart Capacity Planning Dashboard</h1>
        <p>Advanced team-based capacity planning with roles, holidays, and experience factors</p>
        
        <div className="mode-toggle">
          <span className="toggle-description">Planning Mode:</span>
          <div className="toggle-switch">
            <button
              className={`toggle-option ${!useTeamManagement ? 'active' : ''}`}
              onClick={() => setUseTeamManagement(false)}
            >
              Simple
            </button>
            <button
              className={`toggle-option ${useTeamManagement ? 'active' : ''}`}
              onClick={() => setUseTeamManagement(true)}
            >
              Team-based
            </button>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Quarter Selection & Capacity Input */}
        <div className="card">
          <div className="card-header">
            <Users className="card-icon" style={{color: '#3b82f6'}} />
            <h2>Planning Configuration</h2>
          </div>
          
          <div className="input-group">
            <label>Select Quarter</label>
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
            >
              <option value="Q1">Q1</option>
              <option value="Q2">Q2</option>
              <option value="Q3">Q3</option>
              <option value="Q4">Q4</option>
            </select>
          </div>

          <div className="input-group">
            <label>Sprint Length (weeks)</label>
            <input
              type="number"
              value={sprintLengthWeeks}
              onChange={(e) => setSprintLengthWeeks(parseInt(e.target.value) || 2)}
              min="1"
              max="4"
            />
          </div>

          {!useTeamManagement && (
            <div className="input-group">
              <label className="input-label-with-help">
                Available Capacity (Man-weeks)
                <div className="help-tooltip">
                  <HelpCircle size={16} className="help-icon" />
                  <div className="tooltip-content">
                    <strong>Base Capacity:</strong> The total available working time for your team in weeks. This represents the raw time available before considering holidays, experience levels, or role effectiveness.
                    <br/><br/>
                    <strong>Example:</strong> 5 people × 2 weeks = 10 man-weeks base capacity
                  </div>
                </div>
              </label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value) || 0)}
                min="0"
                placeholder="Enter man-weeks for this quarter"
              />
              <p className="capacity-info">
                Equals {((capacity * 40) / hoursPerSprint).toFixed(1)} sprints capacity
              </p>
            </div>
          )}
        </div>

        {/* Features Input */}
        <div className="card">
          <div className="card-header">
            <Clock className="card-icon" style={{color: '#10b981'}} />
            <h2>Feature Backlog</h2>
          </div>
          <div className="form-section-grid">
            {Object.entries(tshirtSizes).map(([size, config]) => (
              <div key={size} className="form-row">
                <label>{config.label}</label>
                <input
                  type="number"
                  value={features[size as TShirtSize]}
                  onChange={(e) => handleFeatureChange(size as TShirtSize, e.target.value)}
                  min="0"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Management */}
      {useTeamManagement && (
        <TeamSummary
          members={members}
          planningStartDate={new Date(2024, (parseInt(selectedQuarter.charAt(1)) - 1) * 3, 1)}
          planningEndDate={new Date(2024, parseInt(selectedQuarter.charAt(1)) * 3, 0)}
          onManageTeam={() => setShowTeamManagementPage(true)}
        />
      )}

      {/* Summary Cards */}
      <div className="grid-4">
        <div className="summary-card">
          <div className="summary-card-content">
            <TrendingUp className="summary-card-icon" style={{color: '#3b82f6'}} />
            <div className="summary-card-text">
              <p>Total Effort</p>
              <p>{calculations.totalEffort.toFixed(1)} sprints</p>
            </div>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-card-content">
            <Users className="summary-card-icon" style={{color: '#10b981'}} />
            <div className="summary-card-text">
              <p>{selectedQuarter} Capacity</p>
              <p>{calculations.quarterCapacity.toFixed(1)} sprints</p>
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-card-content">
            <Calendar className="summary-card-icon" style={{color: '#8b5cf6'}} />
            <div className="summary-card-text">
              <p>Est. Completion</p>
              <p>{calculations.estimatedCompletionQuarter}</p>
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-card-content">
            <Clock className="summary-card-icon" style={{color: '#f59e0b'}} />
            <div className="summary-card-text">
              <p>Capacity Usage</p>
              <p className={calculations.utilizationRate > 100 ? 'text-red' : ''}>
                {calculations.utilizationRate.toFixed(0)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Quarterly Timeline & Burndown Chart */}
        <div className="card">
          <h2 style={{marginBottom: '16px', fontSize: '1.25rem', fontWeight: '600'}}>Quarterly Burndown Timeline</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={calculations.quarterlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" />
              <YAxis label={{ value: 'Sprints', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                formatter={(value, name) => [
                  `${typeof value === 'number' ? value.toFixed(1) : value} sprints`,
                  name === 'capacity' ? 'Quarter Capacity' : 
                  name === 'plannedWork' ? 'Work This Quarter' : 'Remaining Work'
                ]}
              />
              <Legend />
              <Area dataKey="capacity" stackId="1" stroke="#e5e7eb" fill="#f3f4f6" name="Quarter Capacity" />
              <Area dataKey="plannedWork" stackId="2" stroke="#3b82f6" fill="#3b82f6" name="Work This Quarter" />
              <Line type="monotone" dataKey="remainingWork" stroke="#ef4444" strokeWidth={3} name="Remaining Work" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Capacity vs Work Bar Chart */}
        <div className="card">
          <h2 style={{marginBottom: '16px', fontSize: '1.25rem', fontWeight: '600'}}>{selectedQuarter} Capacity Planning</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={calculations.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: 'Sprints', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                formatter={(value, name) => [
                  `${typeof value === 'number' ? value.toFixed(1) : value} sprints`,
                  name === 'capacity' ? 'Available Capacity' : 
                  name === 'plannedWork' ? 'Planned Work' : 'Overflow Work'
                ]}
              />
              <Legend />
              <Bar dataKey="capacity" fill="#e5e7eb" name="Available Capacity" />
              <Bar dataKey="plannedWork" fill="#3b82f6" name="Planned Work" />
              {calculations.remainingWork > 0 && (
                <Bar dataKey="overflow" fill="#ef4444" name="Overflow Work" />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid-2">
        {/* Effort Breakdown Pie Chart */}
        <div className="card">
          <h2 style={{marginBottom: '16px', fontSize: '1.25rem', fontWeight: '600'}}>Effort Breakdown by Size</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={calculations.effortBreakdown}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value.toFixed(1)}`}
              >
                {calculations.effortBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${typeof value === 'number' ? value.toFixed(1) : value} sprints`, 'Effort']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Quarterly Capacity Comparison */}
        <div className="card">
          <h2 style={{marginBottom: '16px', fontSize: '1.25rem', fontWeight: '600'}}>Multi-Quarter View</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={calculations.quarterlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" />
              <YAxis label={{ value: 'Sprints', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                formatter={(value, name) => [
                  `${typeof value === 'number' ? value.toFixed(1) : value} sprints`,
                  name === 'capacity' ? 'Capacity' : 'Planned Work'
                ]}
              />
              <Legend />
              <Bar dataKey="capacity" fill="#e5e7eb" name="Capacity" />
              <Bar dataKey="plannedWork" fill="#3b82f6" name="Planned Work" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Planning Insights */}
      <div className="card">
        <h2 style={{marginBottom: '16px', fontSize: '1.25rem', fontWeight: '600'}}>Planning Insights & Completion Analysis</h2>
        <div>
          {calculations.canCompleteInQuarter ? (
            <div className="alert alert-success">
              <div className="alert-header">✅ Work Fits in {selectedQuarter}</div>
              <div className="alert-content">
                <p>
                  All planned work ({calculations.totalEffort.toFixed(1)} sprints) can be completed within {selectedQuarter} capacity 
                  ({calculations.quarterCapacity.toFixed(1)} sprints). You have {(calculations.quarterCapacity - calculations.totalEffort).toFixed(1)} sprints of buffer.
                </p>
                <p>
                  <strong>✓ On Track:</strong> Your team is on schedule to complete all features by the end of {selectedQuarter}.
                </p>
              </div>
            </div>
          ) : (
            <div className="alert alert-error">
              <div className="alert-header">
                <AlertTriangle className="alert-icon" />
                ⚠️ Work Extends Beyond {selectedQuarter}
              </div>
              <div className="alert-content">
                <p>
                  Your planned work ({calculations.totalEffort.toFixed(1)} sprints) exceeds {selectedQuarter} capacity 
                  ({calculations.quarterCapacity.toFixed(1)} sprints). 
                  {calculations.remainingWork.toFixed(1)} sprints will carry over.
                </p>
                <p>
                  <strong>⏰ Estimated completion:</strong> {calculations.estimatedCompletionQuarter} 
                  (assuming same capacity rate continues)
                </p>
                <p>
                  <strong>❌ Behind Schedule:</strong> You will NOT complete all features in time. Consider reducing scope or increasing capacity.
                </p>
              </div>
            </div>
          )}
          
          <div className="alert alert-info">
            <div className="alert-header">📊 Feature Breakdown</div>
            <div className="alert-content">
              <div className="feature-breakdown">
                {Object.entries(features).filter(([_, count]) => count > 0).map(([size, count]) => (
                  <div key={size} className="feature-breakdown-item">
                    <span>{tshirtSizes[size as TShirtSize].label}:</span>
                    <span>{count} features = {(count * tshirtSizes[size as TShirtSize].avg).toFixed(1)} sprints</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="alert alert-warning">
            <div className="alert-header">🎯 Recommendations</div>
            <div className="alert-content">
              {calculations.utilizationRate > 100 ? (
                <>
                  <p>• Consider reducing scope by {(calculations.totalEffort - calculations.quarterCapacity).toFixed(1)} sprints</p>
                  <p>• Or increase team capacity by {Math.ceil((calculations.totalEffort - calculations.quarterCapacity) / calculations.quarterCapacity * capacity)} man-weeks</p>
                  <p>• Focus on delivering high-priority features first</p>
                </>
              ) : (
                <>
                  <p>• You have {(calculations.quarterCapacity - calculations.totalEffort).toFixed(1)} sprints of spare capacity</p>
                  <p>• Consider adding more features or allocating time for technical debt</p>
                  <p>• Current plan provides good buffer for unexpected issues</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CapacityPlanningDashboard;