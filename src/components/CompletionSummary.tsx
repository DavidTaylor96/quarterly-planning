import React from 'react';
import { format } from 'date-fns';
import { CompletionEstimate } from '../types';

interface CompletionSummaryProps {
  estimate: CompletionEstimate | null;
}

const CompletionSummary: React.FC<CompletionSummaryProps> = ({ estimate }) => {
  if (!estimate) {
    return (
      <div className="completion-summary">
        <h3>Completion Estimate</h3>
        <p>Enter capacity and feature data to see completion estimates</p>
      </div>
    );
  }

  return (
    <div className="completion-summary">
      <h3>Completion Estimate</h3>
      
      <div className="summary-stats">
        <div className="stat-item">
          <label>Total Sprints Required:</label>
          <span className="stat-value">{estimate.totalSprints}</span>
        </div>
        <div className="stat-item">
          <label>Total Weeks:</label>
          <span className="stat-value">{estimate.totalWeeks}</span>
        </div>
        <div className="stat-item">
          <label>Estimated Completion:</label>
          <span className="stat-value completion-date">
            {format(estimate.completionDate, 'MMM dd, yyyy')}
          </span>
        </div>
      </div>

      <div className="quarterly-breakdown">
        <h4>Quarterly Breakdown</h4>
        <div className="quarters-grid">
          {estimate.quarterlyBreakdown.map((quarter, index) => (
            <div key={index} className="quarter-card">
              <h5>{quarter.quarter}</h5>
              <div className="quarter-details">
                <div className="quarter-stat">
                  <label>Work Completed:</label>
                  <span>{quarter.featuresCompleted.toFixed(1)} sprint points</span>
                </div>
                <div className="quarter-stat">
                  <label>Capacity Used:</label>
                  <span>{quarter.capacityUsed.toFixed(1)} sprint points</span>
                </div>
                <div className="quarter-stat">
                  <label>Remaining Capacity:</label>
                  <span>{quarter.remainingCapacity.toFixed(1)} sprint points</span>
                </div>
                <div className="quarter-period">
                  {format(quarter.startDate, 'MMM dd')} - {format(quarter.endDate, 'MMM dd, yyyy')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="context-text">
        <h4>Planning Context</h4>
        <p>
          Based on your current capacity of <strong>{estimate.totalSprints}</strong> sprints 
          and the feature workload, you can expect to complete all features by{' '}
          <strong>{format(estimate.completionDate, 'MMM dd, yyyy')}</strong>.
        </p>
        <p>
          This estimate assumes consistent team velocity and uses average sprint estimates 
          for each T-shirt size. Consider adding buffer time for scope changes, 
          dependencies, and unexpected complexities.
        </p>
      </div>

      <div className="methodology-explainer">
        <h4>How We Calculate Capacity</h4>
        
        <div className="explainer-section">
          <h5>Base Capacity</h5>
          <p>
            Each team member starts with their <strong>base capacity</strong> (typically 2 weeks per sprint for full-time work). 
            This represents the theoretical maximum time available.
          </p>
        </div>

        <div className="explainer-section">
          <h5>Role Effectiveness</h5>
          <p>
            Different roles spend different amounts of time on feature development:
          </p>
          <ul>
            <li><strong>Mid-level Engineers:</strong> 85% - High coding focus</li>
            <li><strong>Senior Engineers:</strong> 70% - Code reviews, mentoring overhead</li>
            <li><strong>Tech Leads:</strong> 50% - Split between leadership and coding</li>
            <li><strong>Principal Engineers:</strong> 40% - Architecture, strategy focus</li>
            <li><strong>Engineering Managers:</strong> 30% - Primarily management duties</li>
            <li><strong>Junior Engineers:</strong> 60% - Learning time, need for guidance</li>
          </ul>
        </div>

        <div className="explainer-section">
          <h5>Experience Modifiers</h5>
          <p>
            Experience level affects how efficiently someone uses their coding time:
          </p>
          <ul>
            <li><strong>Expert:</strong> 100% effectiveness - Fully productive</li>
            <li><strong>Proficient:</strong> 90% effectiveness - Occasional guidance needed</li>
            <li><strong>Developing:</strong> 75% effectiveness - Regular support required</li>
            <li><strong>Novice:</strong> 60% effectiveness - Significant learning curve</li>
          </ul>
          <p>
            Additional factors: New team members (first 1-6 months) and those learning new 
            technologies have reduced effectiveness during ramp-up periods.
          </p>
        </div>

        <div className="explainer-section">
          <h5>Final Calculation</h5>
          <p>
            <strong>Effective Capacity = Base Capacity × Role Effectiveness × Experience Modifier × (1 - Holiday Time)</strong>
          </p>
          <p>
            Example: A Senior Engineer (70% role effectiveness) who is Proficient (90% experience) 
            with 1 week holiday in a 10-week period = 2 weeks × 70% × 90% × 90% = 1.13 weeks per sprint.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompletionSummary;