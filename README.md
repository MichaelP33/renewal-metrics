# Account Analytics Dashboard

Account analytics dashboard for analyzing adoption, engagement, and usage patterns across accounts.

## Overview

This application provides comprehensive analytics for analyzing customer account data, including:

- **Model Cost Analysis**: Detailed breakdown of costs by AI model
- **Usage Analytics**: Token usage and request patterns
- **Data Visualization**: Interactive charts and graphs
- **Export Functionality**: CSV export capabilities
- **File Upload**: Support for uploading usage data files

## Features

### Dashboard Components
- **Cost Breakdown Charts**: Visual representation of costs by model
- **Usage Distribution**: Token and request distribution analysis
- **Date Range Filtering**: Flexible date range selection
- **Model Selection**: Filter by specific AI models
- **Export Controls**: Download data in various formats

### Data Processing
- **CSV Import**: Upload and process usage data files
- **Real-time Analysis**: Live calculation of metrics
- **Model Categorization**: Automatic categorization of AI models
- **Cost Calculations**: Accurate cost breakdowns and totals

### Cohort Comparison (NEW)
- **Flexible User Segmentation**: Create named cohorts based on complex filter criteria
- **Multi-Cohort Comparison**: Compare 2-6 cohorts side-by-side with comprehensive visualizations
- **Engagement Scoring**: Automatic calculation of user engagement scores (0-100)
- **Advanced Visualizations**: Radar charts, heatmaps, comparison tables, and bar charts
- **Export/Import**: Save and share cohort definitions as JSON; export comparison data as CSV
- **Keyboard Shortcuts**: Speed up workflow with intuitive shortcuts
- **localStorage Persistence**: Cohorts saved locally for quick access

For detailed information about cohort features, see [COHORT_FEATURES.md](./COHORT_FEATURES.md).

## Purpose

This dashboard is designed for the Cursor GTM team to:
- Analyze customer account adoption and engagement
- Track feature usage trends within accounts
- Identify power users and advanced feature adoption
- Monitor account health and renewal signals

## Development

### Prerequisites
- Node.js 18+
- pnpm (recommended package manager)

### Getting Started

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Run development server**:
   ```bash
   pnpm dev
   ```

3. **Access the app**:
   - Standalone: `http://localhost:3000`
   - Previously via Portal: `http://localhost:3000/usage-spend` (now runs on root)

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm dev:turbo` - Start development server with Turbopack
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
│   ├── ui/            # Reusable UI components
│   ├── Dashboard.tsx  # Main dashboard
│   ├── DataTable.tsx  # Data table component
│   └── ...            # Other components
├── lib/               # Utility libraries
│   ├── chart-utils.ts # Chart utilities
│   ├── data-processing.ts # Data processing logic
│   └── ...            # Other utilities
└── types/             # TypeScript type definitions
    └── index.ts       # Main type definitions
```

## Dependencies

### Core Dependencies
- **Next.js 15**: React framework
- **React 19**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Recharts**: Data visualization

### UI Components
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **Class Variance Authority**: Component variants

### Data Processing
- **Papa Parse**: CSV parsing
- **Date-fns**: Date manipulation
- **HTML2Canvas**: Chart export

## Configuration

### Environment Variables
No environment variables are required for basic functionality. The app works with local data and file uploads.

### Build Configuration
- **Next.js Config**: Optimized for production builds
- **Vercel Config**: Deployment configuration
- **ESLint Config**: Code quality rules

## Deployment

The app is configured for deployment on Vercel:

1. **Automatic Deployment**: Connected to Git repository
2. **Build Command**: `pnpm build`
3. **Output Directory**: `.next`
4. **Framework**: Next.js

## Usage

### Uploading Data
1. Click "Upload File" button
2. Select a CSV file with usage data
3. Data will be automatically processed and displayed

### Analyzing Costs
1. Use date range picker to filter data
2. Select specific models from the dropdown
3. View cost breakdowns in charts and tables

### Exporting Data
1. Configure export settings
2. Click "Export" button
3. Download processed data as CSV

## Sample Data

The app includes sample data in `public/sample-data.csv` for testing and demonstration purposes.

## Contributing

1. Follow the existing code structure
2. Use TypeScript for type safety
3. Follow the established component patterns
4. Test changes thoroughly
5. Update documentation as needed

## License

Private - Fieldsphere Internal Use Only