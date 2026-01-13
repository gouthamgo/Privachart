# chart0.dev Architecture Documentation

## Overview

chart0.dev is a privacy-first, client-side data visualization application built with React 19. The application enables users to create interactive charts from CSV data without any data transmission to external servers.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Browser Environment                          │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                      React Application                         │  │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐   │  │
│  │  │  CSV Input  │───▶│   Contexts  │───▶│  Chart.js       │   │  │
│  │  │  (PapaParse)│    │   (State)   │    │  Visualization  │   │  │
│  │  └─────────────┘    └─────────────┘    └─────────────────┘   │  │
│  │                            │                    │             │  │
│  │                            ▼                    ▼             │  │
│  │                     ┌─────────────┐    ┌─────────────────┐   │  │
│  │                     │  LocalStorage│    │  PNG Export     │   │  │
│  │                     │  (optional)  │    │  (Canvas)       │   │  │
│  │                     └─────────────┘    └─────────────────┘   │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                          NO EXTERNAL API CALLS                       │
└─────────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
chart0-dev/
├── client/                          # Frontend React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                  # shadcn/ui + Neo-Brutalism components
│   │   │   ├── chart/               # Chart rendering components
│   │   │   │   └── ChartRenderer.tsx
│   │   │   ├── layout/              # Page layout components
│   │   │   │   ├── Sidebar.tsx      # Main control panel
│   │   │   │   ├── DataInput.tsx    # CSV file upload
│   │   │   │   ├── DataPreview.tsx  # Data table preview
│   │   │   │   ├── FilterPanel.tsx  # Filtering & aggregation
│   │   │   │   ├── StatsPanel.tsx   # Statistical summary
│   │   │   │   ├── AnalyticsPanel.tsx
│   │   │   │   ├── DataCleaningPanel.tsx
│   │   │   │   └── ExportPanel.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   ├── contexts/                # State management
│   │   │   ├── DataContext.tsx      # CSV data state
│   │   │   ├── ConfigContext.tsx    # Chart configuration
│   │   │   ├── FilterContext.tsx    # Data filtering
│   │   │   ├── HistoryContext.tsx   # Undo/Redo
│   │   │   └── ThemeContext.tsx     # Dark/Light mode
│   │   ├── lib/                     # Utility functions
│   │   │   ├── dataProcessor.ts     # Data transformations
│   │   │   ├── analytics.ts         # Statistical calculations
│   │   │   ├── reportGenerator.ts   # Report generation
│   │   │   └── utils.ts             # General utilities
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── pages/                   # Route pages
│   │   │   ├── Home.tsx
│   │   │   └── NotFound.tsx
│   │   ├── App.tsx                  # Root component
│   │   ├── main.tsx                 # Entry point
│   │   └── index.css                # Global styles
│   └── public/                      # Static assets
├── server/                          # Production server
│   └── index.ts                     # Express static server
├── shared/                          # Shared constants
└── Configuration files...
```

## State Management Architecture

The application uses React Context for state management, organized into five specialized contexts:

```
┌─────────────────────────────────────────────────────────────────┐
│                         App Component                            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     ThemeProvider                          │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │                  HistoryProvider                     │  │  │
│  │  │  ┌───────────────────────────────────────────────┐  │  │  │
│  │  │  │                FilterProvider                  │  │  │  │
│  │  │  │  ┌─────────────────────────────────────────┐  │  │  │  │
│  │  │  │  │            TooltipProvider              │  │  │  │  │
│  │  │  │  │  ┌───────────────────────────────────┐  │  │  │  │  │
│  │  │  │  │  │              Router               │  │  │  │  │  │
│  │  │  │  │  │  ┌─────────────────────────────┐  │  │  │  │  │  │
│  │  │  │  │  │  │          Home Page          │  │  │  │  │  │  │
│  │  │  │  │  │  │  ┌───────────────────────┐  │  │  │  │  │  │  │
│  │  │  │  │  │  │  │    DataProvider       │  │  │  │  │  │  │  │
│  │  │  │  │  │  │  │  ┌─────────────────┐  │  │  │  │  │  │  │  │
│  │  │  │  │  │  │  │  │  ConfigProvider │  │  │  │  │  │  │  │  │
│  │  │  │  │  │  │  │  │  ┌───────────┐  │  │  │  │  │  │  │  │  │
│  │  │  │  │  │  │  │  │  │  Sidebar  │  │  │  │  │  │  │  │  │  │
│  │  │  │  │  │  │  │  │  │  Chart    │  │  │  │  │  │  │  │  │  │
│  │  │  │  │  │  │  │  │  └───────────┘  │  │  │  │  │  │  │  │  │
│  │  │  │  │  │  │  │  └─────────────────┘  │  │  │  │  │  │  │  │
│  │  │  │  │  │  │  └───────────────────────┘  │  │  │  │  │  │  │
│  │  │  │  │  │  └─────────────────────────────┘  │  │  │  │  │  │
│  │  │  │  │  └───────────────────────────────────┘  │  │  │  │  │
│  │  │  │  └─────────────────────────────────────────┘  │  │  │  │
│  │  │  └───────────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Context Responsibilities

| Context | Purpose | Key State |
|---------|---------|-----------|
| **DataContext** | Manages CSV data lifecycle | `data`, `columns`, `isLoading` |
| **ConfigContext** | Chart configuration | `chartType`, `xAxis`, `yAxis`, `colors`, `title` |
| **FilterContext** | Data filtering & aggregation | `limit`, `sort`, `aggregation`, `filters` |
| **HistoryContext** | Undo/Redo functionality | `history[]`, `currentIndex` |
| **ThemeContext** | UI theme switching | `theme` (light/dark) |

## Data Flow

### 1. CSV Import Flow

```
User Action (Drop/Upload/Paste)
         │
         ▼
┌─────────────────────┐
│   DataInput.tsx     │ ◄─── Handles file/text input
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│    PapaParse        │ ◄─── CSV parsing library
│  - Header detection │
│  - Type inference   │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│   DataContext       │ ◄─── Stores parsed data
│  - Column metadata  │      Analyzes column types
│  - Type detection   │      Detects: number, string, date, boolean
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│  DataPreview.tsx    │ ◄─── Shows data table
└─────────────────────┘
```

### 2. Chart Rendering Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   DataContext   │     │  FilterContext  │     │  ConfigContext  │
│   (Raw Data)    │     │  (Transforms)   │     │  (Chart Config) │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                                 ▼
                    ┌───────────────────────┐
                    │   dataProcessor.ts    │
                    │  - Apply filters      │
                    │  - Apply sorting      │
                    │  - Apply aggregation  │
                    │  - Limit rows         │
                    └───────────────────────┘
                                 │
                                 ▼
                    ┌───────────────────────┐
                    │   ChartRenderer.tsx   │
                    │  - Transform to       │
                    │    Chart.js format    │
                    │  - Apply styling      │
                    └───────────────────────┘
                                 │
                                 ▼
                    ┌───────────────────────┐
                    │      Chart.js         │
                    │  - Canvas rendering   │
                    │  - Interactivity      │
                    └───────────────────────┘
```

### 3. Export Flow

```
ChartRenderer (Canvas)
         │
         ▼
┌─────────────────────┐
│  canvas.toBlob()    │ ◄─── Convert canvas to image
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│  Download as PNG    │ ◄─── Browser download API
└─────────────────────┘
```

## Component Architecture

### Main Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                            Header                                │
├──────────────────────┬──────────────────────────────────────────┤
│                      │                                          │
│      Sidebar         │              Chart Canvas                │
│     (320px)          │                                          │
│                      │                                          │
│  ┌────────────────┐  │        ┌─────────────────────────┐      │
│  │   DataInput    │  │        │                         │      │
│  └────────────────┘  │        │                         │      │
│  ┌────────────────┐  │        │      ChartRenderer      │      │
│  │  DataPreview   │  │        │                         │      │
│  └────────────────┘  │        │                         │      │
│  ┌────────────────┐  │        │                         │      │
│  │  StatsPanel    │  │        └─────────────────────────┘      │
│  └────────────────┘  │                                          │
│  ┌────────────────┐  │                                          │
│  │  FilterPanel   │  │                                          │
│  └────────────────┘  │                                          │
│  ┌────────────────┐  │                                          │
│  │ AnalyticsPanel │  │                                          │
│  └────────────────┘  │                                          │
│  ┌────────────────┐  │                                          │
│  │  ExportPanel   │  │                                          │
│  └────────────────┘  │                                          │
│                      │                                          │
└──────────────────────┴──────────────────────────────────────────┘
```

### Chart Type Support

| Chart Type | Description | Best For |
|------------|-------------|----------|
| **Bar** | Vertical bar chart | Comparing categories |
| **Line** | Line chart with points | Trends over time |
| **Pie** | Circular proportion chart | Part-to-whole relationships |
| **Doughnut** | Pie with center cutout | Same as pie, modern look |
| **Scatter** | X-Y point plot | Correlations |
| **Area** | Filled line chart | Cumulative data |

## Key Utilities

### dataProcessor.ts

Handles all data transformations:

```typescript
// Core functions
processData(data, config) → ProcessedData
filterData(data, filters) → FilteredData
sortData(data, sortConfig) → SortedData
aggregateData(data, groupBy, aggregation) → AggregatedData
limitData(data, limit) → LimitedData
```

### analytics.ts

Statistical calculations:

```typescript
// Available statistics
calculateMin(values) → number
calculateMax(values) → number
calculateMean(values) → number
calculateMedian(values) → number
calculateMode(values) → number
calculateStandardDeviation(values) → number
calculateVariance(values) → number
calculateSum(values) → number
calculateCount(values) → number
```

## Design System: Neo-Brutalism

### Color Tokens

```css
/* Primary Colors */
--primary: #0055FF;        /* Electric Blue */
--accent: #FF4400;         /* Signal Orange */
--background: #FFFFFF;     /* White */
--foreground: #1A1A1A;     /* Near Black */

/* Chart Palette */
--chart-1: #0055FF;        /* Blue */
--chart-2: #FF4400;        /* Orange */
--chart-3: #00CC66;        /* Green */
--chart-4: #FFCC00;        /* Yellow */
--chart-5: #9900FF;        /* Purple */
```

### Typography

```css
/* Headings */
font-family: 'JetBrains Mono', monospace;
font-weight: 700;
text-transform: uppercase;

/* Body */
font-family: 'Inter', sans-serif;
font-weight: 400;
```

### Visual Characteristics

```css
/* Borders */
border: 2px solid black;
border-radius: 0;

/* Shadows */
box-shadow: 4px 4px 0px 0px #000000;

/* Neo-Shadow Animation */
.neo-shadow:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0px 0px #000000;
}

.neo-shadow:active {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0px 0px #000000;
}
```

## Security & Privacy

### Client-Side Only Architecture

- **No API calls**: All processing happens in the browser
- **No cookies**: No tracking or session storage
- **No analytics**: No usage data collection
- **Memory isolation**: Data exists only in browser memory

### Content Security Policy

```
default-src 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline' fonts.googleapis.com;
font-src 'self' fonts.gstatic.com;
img-src 'self' data: blob:;
connect-src 'none';  /* No external connections */
```

### Memory Management

- Maximum CSV size: ~10MB recommended
- History states limited to 50 entries
- Unused data cleared on reset

## Build & Deployment

### Development

```bash
pnpm dev          # Start Vite dev server (port 3000)
pnpm check        # TypeScript type checking
pnpm format       # Code formatting with Prettier
```

### Production Build

```bash
pnpm build        # Build client + server
pnpm start        # Run production server
```

### Build Output

```
dist/
├── public/       # Vite-bundled client assets
│   ├── index.html
│   └── assets/
└── index.js      # ESBuild-bundled server
```

## Dependencies Overview

### Runtime Dependencies

| Package | Purpose |
|---------|---------|
| react, react-dom | UI framework |
| chart.js, react-chartjs-2 | Charting engine |
| papaparse | CSV parsing |
| @radix-ui/* | Accessible UI primitives |
| tailwindcss | Styling |
| wouter | Client-side routing |
| lucide-react | Icons |
| framer-motion | Animations |
| express | Production server |

### Development Dependencies

| Package | Purpose |
|---------|---------|
| typescript | Type checking |
| vite | Development server & bundler |
| esbuild | Server bundling |
| prettier | Code formatting |

## Future Considerations

### Potential Enhancements

1. **Additional Chart Types**: Radar, Bubble, Mixed charts
2. **Data Persistence**: Optional localStorage save/load
3. **Multiple Datasets**: Compare different CSV files
4. **Advanced Filtering**: Complex filter expressions
5. **Custom Themes**: User-defined color schemes
6. **SVG Export**: Vector graphics output
7. **Keyboard Shortcuts**: Power user workflow
8. **Responsive Charts**: Better mobile experience

### Scalability Notes

- Current architecture handles datasets up to ~100k rows comfortably
- Web Workers could be added for heavy computations
- Virtual scrolling for large data previews
- Chunked parsing for very large files
