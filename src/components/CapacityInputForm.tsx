import React from 'react';
import { FeatureInput, CapacityInput } from '../types';

interface CapacityInputFormProps {
  features: FeatureInput;
  capacity: CapacityInput;
  onFeaturesChange: (features: FeatureInput) => void;
  onCapacityChange: (capacity: CapacityInput) => void;
}

const CapacityInputForm: React.FC<CapacityInputFormProps> = ({
  features,
  capacity,
  onFeaturesChange,
  onCapacityChange,
}) => {
  const handleFeatureChange = (size: keyof FeatureInput, value: string) => {
    const numValue = parseInt(value) || 0;
    onFeaturesChange({
      ...features,
      [size]: numValue,
    });
  };

  const handleCapacityChange = (field: keyof CapacityInput, value: string) => {
    const numValue = parseFloat(value) || 0;
    onCapacityChange({
      ...capacity,
      [field]: numValue,
    });
  };

  return (
    <div className="capacity-input-form">
      <div className="form-section">
        <h3>Team Capacity</h3>
        <div className="input-group">
          <label>
            Total Man-Weeks Available:
            <input
              type="number"
              value={capacity.totalManWeeks}
              onChange={(e) => handleCapacityChange('totalManWeeks', e.target.value)}
              min="0"
              step="0.5"
            />
          </label>
        </div>
        <div className="input-group">
          <label>
            Sprint Length (weeks):
            <input
              type="number"
              value={capacity.sprintLengthWeeks}
              onChange={(e) => handleCapacityChange('sprintLengthWeeks', e.target.value)}
              min="1"
              step="0.5"
            />
          </label>
        </div>
      </div>

      <div className="form-section">
        <h3>Feature Counts by T-Shirt Size</h3>
        <div className="tshirt-inputs">
          <div className="input-group">
            <label>
              XS Features (1 sprint):
              <input
                type="number"
                value={features.xs}
                onChange={(e) => handleFeatureChange('xs', e.target.value)}
                min="0"
              />
            </label>
          </div>
          <div className="input-group">
            <label>
              S Features (2-4 sprints):
              <input
                type="number"
                value={features.s}
                onChange={(e) => handleFeatureChange('s', e.target.value)}
                min="0"
              />
            </label>
          </div>
          <div className="input-group">
            <label>
              M Features (4-12 sprints):
              <input
                type="number"
                value={features.m}
                onChange={(e) => handleFeatureChange('m', e.target.value)}
                min="0"
              />
            </label>
          </div>
          <div className="input-group">
            <label>
              L Features (12+ sprints):
              <input
                type="number"
                value={features.l}
                onChange={(e) => handleFeatureChange('l', e.target.value)}
                min="0"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CapacityInputForm;