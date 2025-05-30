# Capacity Planning Dashboard

A dynamic TypeScript React application for capacity planning using T-shirt sizing methodology.

## Features

- **T-shirt Sizing**: XS (1 sprint), S (2-4 sprints), M (4-12 sprints), L (12+ sprints)
- **Dynamic Input**: Enter team capacity in man-weeks and feature counts
- **Visual Timeline**: Interactive charts showing project progression
- **Quarterly Breakdown**: See capacity utilization by quarter
- **Completion Estimates**: Accurate delivery predictions

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

1. **Enter Team Capacity**:
   - Total man-weeks available
   - Sprint length in weeks (typically 2)

2. **Input Feature Counts**:
   - XS Features: Simple tasks (1 sprint each)
   - S Features: Small features (2-4 sprints each)
   - M Features: Medium features (4-12 sprints each)  
   - L Features: Large features (12+ sprints each)

3. **View Results**:
   - Timeline chart showing work progression
   - Quarterly capacity breakdown
   - Estimated completion date

## T-shirt Size Reference

| Size | Sprint Range | Average Sprints | Use Case |
|------|-------------|----------------|----------|
| XS   | 1           | 1              | Bug fixes, small tasks |
| S    | 2-4         | 3              | Small features |
| M    | 4-12        | 8              | Medium features |
| L    | 12+         | 18             | Large initiatives |

## Technology Stack

- **React 18** with TypeScript
- **Recharts** for data visualization
- **date-fns** for date calculations
- **Vite** for build tooling