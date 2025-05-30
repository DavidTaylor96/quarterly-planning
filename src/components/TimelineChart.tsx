import React from 'react';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Bar,
  ComposedChart,
} from 'recharts';
import { TimelineData } from '../types';

interface TimelineChartProps {
  data: TimelineData[];
}

const TimelineChart: React.FC<TimelineChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-placeholder">
        <p>Enter capacity and feature data to see the timeline</p>
      </div>
    );
  }

  return (
    <div className="timeline-chart">
      <h3>Project Timeline</h3>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="week" 
              label={{ value: 'Week', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              label={{ value: 'Sprint Effort', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value, name) => [
                typeof value === 'number' ? value.toFixed(1) : value,
                name
              ]}
              labelFormatter={(week) => `Week ${week}`}
            />
            <Legend />
            <Bar 
              dataKey="capacityUsed" 
              fill="#8884d8" 
              name="Capacity Used per Sprint"
            />
            <Line 
              type="monotone" 
              dataKey="completedFeatures" 
              stroke="#82ca9d" 
              strokeWidth={3}
              name="Cumulative Work Completed"
            />
            <Line 
              type="monotone" 
              dataKey="remainingWork" 
              stroke="#ff7300" 
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Remaining Work"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TimelineChart;