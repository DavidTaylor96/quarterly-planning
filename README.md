# Capacity Planning Dashboard

A dynamic TypeScript React application for capacity planning using T-shirt sizing methodology with advanced team management capabilities.

## Features

- **T-shirt Sizing**: XS (1 sprint), S (2-4 sprints), M (4-12 sprints), L (12+ sprints)
- **Dynamic Input**: Enter team capacity in man-weeks and feature counts
- **Visual Timeline**: Interactive charts showing project progression
- **Quarterly Breakdown**: See capacity utilization by quarter
- **Completion Estimates**: Accurate delivery predictions
- **🆕 Team Management**: Add, edit, and manage team members with persistent storage
- **🆕 Individual Capacity Calculation**: Realistic capacity based on role, experience, and tenure
- **🆕 Holiday Management**: Track time off and adjust capacity accordingly
- **🆕 Persistent Storage**: Team data automatically saved using Zustand

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Usage

### Team Management

1. **Add Team Members**:
   - Click "Add Team Member" to create new team member profiles
   - Enter member details: name, role, experience level, tenure
   - Set base capacity per sprint and upskilling status
   - Manage holidays and time off periods

2. **Team Member Details**:
   - **Roles**: Junior Engineer, Mid-level Engineer, Senior Engineer, Tech Lead, Principal Engineer, Engineering Manager
   - **Experience Levels**: Novice, Developing, Proficient, Expert
   - **Capacity Factors**: Base capacity, role effectiveness, experience modifiers, holiday reductions

### Capacity Planning

1. **Enter Planning Period**:
   - Set planning start and end dates
   - Define sprint length in weeks (typically 2)

2. **Input Feature Counts**:
   - XS Features: Simple tasks (1 sprint each)
   - S Features: Small features (2-4 sprints each)
   - M Features: Medium features (4-12 sprints each)  
   - L Features: Large features (12+ sprints each)

3. **View Results**:
   - Timeline chart showing work progression
   - Quarterly capacity breakdown
   - Estimated completion date
   - Individual team member capacity contributions

## T-shirt Size Reference

| Size | Sprint Range | Average Sprints | Use Case |
|------|-------------|----------------|----------|
| XS   | 1           | 1              | Bug fixes, small tasks |
| S    | 2-4         | 3              | Small features |
| M    | 4-12        | 8              | Medium features |
| L    | 12+         | 18             | Large initiatives |

## Capacity Calculation

The application uses sophisticated capacity calculations based on multiple factors:

### Role Effectiveness
- **Junior Engineer**: 0.6x base capacity
- **Mid-level Engineer**: 0.8x base capacity
- **Senior Engineer**: 1.0x base capacity
- **Tech Lead**: 0.85x base capacity (accounting for leadership duties)
- **Principal Engineer**: 0.9x base capacity
- **Engineering Manager**: 0.3x base capacity

### Experience Modifiers
- **Company Tenure**: Gradual increase over 24 months (up to +20%)
- **Team Tenure**: Gradual increase over 12 months (up to +15%)
- **Experience Level**: Novice (0.7x), Developing (0.85x), Proficient (1.0x), Expert (1.15x)
- **Upskilling**: -20% when learning new technologies

### Holiday Impact
- Automatically reduces capacity based on scheduled time off during planning period

## Data Persistence

Team member data is automatically saved to browser storage using Zustand's persist middleware. Your team configurations will be restored when you reload the application.

## Technology Stack

- **React 18** with TypeScript
- **Zustand** for state management with persistence
- **Recharts** for data visualization
- **date-fns** for date calculations
- **Lucide React** for icons
- **Vite** for build tooling

## Development

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking