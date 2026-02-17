# Heat Demand Prediction System

A comprehensive Next.js 15 + React 19 + TypeScript frontend application for AI-powered heat demand prediction in district heating systems.

## Features

- **Dashboard**: Real-time overview with weather forecasts and prediction timelines
- **Current Weather**: Detailed weather conditions and their impact on heat demand
- **Predictions**: Interactive heat demand predictions with multiple time horizons
- **How It Works**: Detailed explanation of the AI model and prediction methodology
- **Model Validation**: Historical performance data and trust indicators
- **Plant Control**: Simplified district heating plant control interface
- **Manual Testing**: Interactive testing with custom weather and building inputs

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with strict type checking
- **Styling**: Tailwind CSS with custom heat/energy color scheme
- **UI Components**: Radix UI primitives (shadcn/ui)
- **Icons**: Lucide React
- **Charts**: Recharts for data visualization
- **Design**: Mobile-first responsive design

## Getting Started

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

\`\`\`
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Dashboard
│   ├── weather/           # Current Weather
│   ├── predictions/       # Predictions
│   ├── explanation/       # How It Works
│   ├── validation/        # Model Validation
│   ├── plant-control/     # Plant Control
│   └── manual-testing/    # Manual Testing
├── components/
│   ├── ui/               # Reusable UI components
│   └── navigation-header.tsx
└── lib/
    └── utils.ts          # Utility functions
\`\`\`

## Key Features

### Responsive Design
- Mobile-first approach with breakpoints for tablet and desktop
- Consistent navigation across all devices

### Interactive Elements
- Real-time weather data visualization
- Interactive prediction timelines
- Manual testing with custom inputs
- Plant control interface with sliders and toggles

### Data Visualization
- Weather forecast charts with multiple metrics
- Prediction confidence intervals
- Historical vs predicted performance
- Feature importance and correlation analysis

### AI Model Integration
- Mock data simulating real AI predictions
- Detailed model explanations and validation
- Interactive manual testing interface
- Performance metrics and trust indicators

## Color Scheme

The application uses a heat/energy-focused color palette:
- **Primary**: Blue (#3B82F6) for heating theme
- **Chart Colors**: Blue, Orange, Green, Purple, Red for different data series
- **Gradients**: Various blue-to-indigo and warm color gradients

## Development

### Adding New Pages
1. Create a new page in \`src/app/[page-name]/page.tsx\`
2. Add navigation link in \`navigation-header.tsx\`
3. Follow the existing pattern for layout and styling

### Customizing Components
- UI components are in \`src/components/ui/\`
- Modify existing components or create new ones as needed
- All components use Tailwind CSS for styling

### Mock Data
- Each page includes comprehensive mock data
- Data structures are designed to be easily replaceable with real API calls
- TypeScript interfaces ensure type safety

## Deployment

Build the application for production:

\`\`\`bash
npm run build
npm start
\`\`\`

The application is optimized for deployment on Vercel, Netlify, or any Node.js hosting platform.

## License

This project is for educational and demonstration purposes.
