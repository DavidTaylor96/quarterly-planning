import React, { useState } from 'react';
import { HolidayPeriod } from '../types';

interface HolidayManagementProps {
  holidays: HolidayPeriod[];
  onHolidaysChange: (holidays: HolidayPeriod[]) => void;
  memberName: string;
}

const HolidayManagement: React.FC<HolidayManagementProps> = ({
  holidays,
  onHolidaysChange,
  memberName,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<HolidayPeriod | null>(null);

  const holidayTypes: HolidayPeriod['type'][] = ['PTO', 'Holiday', 'Sick'];

  const createNewHoliday = (): HolidayPeriod => ({
    id: Date.now().toString(),
    startDate: new Date(),
    endDate: new Date(),
    type: 'PTO',
    description: '',
  });

  const handleAddHoliday = () => {
    setEditingHoliday(createNewHoliday());
    setShowAddForm(true);
  };

  const handleSaveHoliday = (holiday: HolidayPeriod) => {
    if (showAddForm) {
      onHolidaysChange([...holidays, holiday]);
      setShowAddForm(false);
    } else {
      onHolidaysChange(holidays.map(h => h.id === holiday.id ? holiday : h));
    }
    setEditingHoliday(null);
  };

  const handleDeleteHoliday = (holidayId: string) => {
    onHolidaysChange(holidays.filter(h => h.id !== holidayId));
  };

  const handleCancel = () => {
    setEditingHoliday(null);
    setShowAddForm(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  const calculateDays = (start: Date, end: Date) => {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  return (
    <div className="holiday-management">
      <div className="holiday-header">
        <div className="header-content">
          <h4>Time Off - {memberName}</h4>
          <span className="holiday-count">
            {holidays.length} {holidays.length === 1 ? 'period' : 'periods'}
          </span>
        </div>
        <button onClick={handleAddHoliday} className="add-holiday-btn">
          + Add Time Off
        </button>
      </div>

      {(editingHoliday || showAddForm) && (
        <HolidayForm
          holiday={editingHoliday!}
          holidayTypes={holidayTypes}
          onSave={handleSaveHoliday}
          onCancel={handleCancel}
          isNew={showAddForm}
        />
      )}

      <div className="holidays-list">
        {holidays.length === 0 ? (
          <div className="no-holidays">
            <span>No time off scheduled</span>
          </div>
        ) : (
          holidays.map(holiday => (
            <div key={holiday.id} className="holiday-item">
              <div className="holiday-main">
                <div className="holiday-period">
                  <span className="date-range">
                    {formatDate(holiday.startDate)}
                    {holiday.startDate.getTime() !== holiday.endDate.getTime() && 
                      ` - ${formatDate(holiday.endDate)}`
                    }
                  </span>
                  <span className="duration">
                    {calculateDays(holiday.startDate, holiday.endDate)} 
                    {calculateDays(holiday.startDate, holiday.endDate) === 1 ? ' day' : ' days'}
                  </span>
                </div>
                <span className={`holiday-type type-${holiday.type.toLowerCase()}`}>
                  {holiday.type}
                </span>
              </div>
              <div className="holiday-actions">
                <button 
                  onClick={() => setEditingHoliday(holiday)}
                  className="edit-btn"
                  title="Edit"
                >
                  ✏️
                </button>
                <button 
                  onClick={() => handleDeleteHoliday(holiday.id)}
                  className="delete-btn"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {holidays.length > 0 && (
        <div className="holiday-summary">
          <span className="summary-total">
            Total: {holidays.reduce((total, holiday) => 
              total + calculateDays(holiday.startDate, holiday.endDate), 0
            )} days off
          </span>
        </div>
      )}
    </div>
  );
};

interface HolidayFormProps {
  holiday: HolidayPeriod;
  holidayTypes: HolidayPeriod['type'][];
  onSave: (holiday: HolidayPeriod) => void;
  onCancel: () => void;
  isNew: boolean;
}

const HolidayForm: React.FC<HolidayFormProps> = ({
  holiday,
  holidayTypes,
  onSave,
  onCancel,
  isNew,
}) => {
  const [formData, setFormData] = useState<HolidayPeriod>(holiday);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.startDate <= formData.endDate) {
      onSave(formData);
    }
  };

  const handleChange = (field: keyof HolidayPeriod, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="holiday-form-overlay">
      <form className="holiday-form compact" onSubmit={handleSubmit}>
        <h5>{isNew ? 'Add Time Off' : 'Edit Time Off'}</h5>
        
        <div className="form-row">
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              value={formatDateForInput(formData.startDate)}
              onChange={(e) => handleChange('startDate', new Date(e.target.value))}
              required
            />
          </div>

          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              value={formatDateForInput(formData.endDate)}
              onChange={(e) => handleChange('endDate', new Date(e.target.value))}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Type</label>
          <select
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value as HolidayPeriod['type'])}
          >
            {holidayTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" className="save-btn">
            {isNew ? 'Add' : 'Save'}
          </button>
          <button type="button" onClick={onCancel} className="cancel-btn">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default HolidayManagement;