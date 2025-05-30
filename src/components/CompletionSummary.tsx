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
    </div>
  );
};

export default CompletionSummary;