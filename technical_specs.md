# chart0.dev Technical Specifications & Architecture

## 1. System Overview
chart0.dev is a client-side-only web application for data visualization. It allows users to import CSV data, configure chart parameters, and export visualizations without any data leaving the browser.

## 2. Technology Stack
- **Framework**: React 19 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 (Neo-Brutalism theme)
- **UI Components**: shadcn/ui (customized for design system)
- **State Management**: React Context + Hooks
- **Routing**: wouter
- **Data Parsing**: PapaParse (for robust CSV parsing)
- **Charting Engine**: Chart.js + react-chartjs-2
- **Icons**: Lucide React

## 3. Architecture Design

### 3.1 Data Flow
1. **Input**: User drops CSV file or pastes text.
2. **Parsing**: PapaParse converts raw text to JSON objects.
3. **State**: Data is stored in `DataContext` (in-memory only).
4. **Configuration**: User adjusts settings (chart type, axes, colors) in `ConfigContext`.
5. **Rendering**: Chart.js renders the visualization based on Data + Config.
6. **Export**: Canvas is converted to Blob for download.

### 3.2 Component Structure
```
App
├── Layout (Split Screen)
│   ├── Sidebar (Controls)
│   │   ├── DataInput (File Drop / Paste)
│   │   ├── ChartTypeSelector
│   │   ├── DataMapping (X/Y Axis selection)
│   │   └── AppearanceSettings
│   └── MainCanvas (Visualization)
│       ├── ChartPreview
│       └── Toolbar (Export, Reset, Theme Toggle)
```

### 3.3 Key Modules

#### Data Module (`src/lib/data`)
- `parseCSV(file: File | string): Promise<DataSet>`
- `detectColumnTypes(data: any[]): ColumnMetadata[]`
- `transformDataForChart(data: any[], config: ChartConfig): ChartData`

#### Chart Module (`src/components/chart`)
- `ChartRenderer`: Wrapper around Chart.js components
- `ChartConfigurator`: UI for modifying chart options
- `ExportManager`: Handles PNG/SVG export logic

## 4. Design System Implementation (Neo-Brutalism)

### 4.1 Design Tokens
- **Colors**:
  - Background: White (#ffffff) / Black (#1a1a1a)
  - Surface: White (#ffffff) with 2px border
  - Primary: Electric Blue (#0055FF)
  - Text: Black (#000000) / White (#ffffff)
  - Border: Black (#000000) 2px solid
- **Typography**:
  - Headers: 'JetBrains Mono' (Google Fonts)
  - Body: 'Inter' (Google Fonts)
- **Shadows**:
  - Hard shadow: `4px 4px 0px 0px #000000`

### 4.2 UI Components Customization
- **Buttons**: Rectangular, 2px border, hard shadow on hover, active state collapses shadow.
- **Inputs**: 2px border, no rounded corners, monospace font.
- **Cards**: 2px border, hard shadow, white background.

## 5. Privacy & Security
- **CSP**: Strict Content Security Policy to prevent unauthorized network requests.
- **Local Processing**: Explicit architecture decision to avoid any API calls for data processing.
- **Memory Management**: Large datasets are handled carefully; limit initial version to ~10MB CSVs to ensure browser stability.

## 6. Development Phases
1. **Setup**: Install dependencies (Chart.js, PapaParse), configure Tailwind theme.
2. **Core Logic**: Implement CSV parsing and data state management.
3. **UI Skeleton**: Build the split-screen layout and Neo-Brutalist components.
4. **Chart Integration**: Connect data state to Chart.js.
5. **Refinement**: Add customization options and export functionality.
6. **Polish**: Animations, empty states, and responsive adjustments.
