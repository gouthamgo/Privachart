import React from 'react';
import { useData } from '@/contexts/DataContext';
import { useConfig, ChartType } from '@/contexts/ConfigContext';
import { NeoButton, NeoInput, NeoSelect, NeoLabel } from '@/components/ui/neo-brutalism';
import { BarChart2, Activity, Palette, X } from 'lucide-react';
import DataInput from './DataInput';
import DataPreview from './DataPreview';
import FilterPanel from './FilterPanel';
import StatsPanel from './StatsPanel';
import AnalyticsPanel from './AnalyticsPanel';
import DataCleaningPanel from './DataCleaningPanel';
import ExportPanel from './ExportPanel';

interface SidebarProps {
  chartRef?: any;
}

const CHART_TYPES = [
  { id: 'bar', icon: '|||', label: 'Bar' },
  { id: 'line', icon: '~', label: 'Line' },
  { id: 'pie', icon: '○', label: 'Pie' },
  { id: 'doughnut', icon: '◎', label: 'Donut' },
  { id: 'scatter', icon: '···', label: 'Scatter' },
  { id: 'area', icon: '▲', label: 'Area' },
] as const;

export default function Sidebar({ chartRef }: SidebarProps) {
  const { data, columns, metadata } = useData();
  const { config, updateConfig } = useConfig();

  const handleYAxisToggle = (col: string) => {
    const isSelected = config.yAxisColumns.includes(col);
    if (isSelected) {
      updateConfig({ yAxisColumns: config.yAxisColumns.filter(c => c !== col) });
    } else {
      updateConfig({ yAxisColumns: [...config.yAxisColumns, col] });
    }
  };

  return (
    <div className="w-80 border-r-2 border-border bg-sidebar h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b-2 border-border bg-card sticky top-0 z-10">
        <div className="flex items-center gap-3">
          {/* Custom geometric logo - stacked bars forming "P" negative space */}
          <div className="w-9 h-9 bg-primary neo-shadow-sm flex items-center justify-center relative overflow-hidden">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
              <rect x="4" y="4" width="4" height="16" fill="white" />
              <rect x="10" y="4" width="4" height="10" fill="white" opacity="0.7" />
              <rect x="16" y="8" width="4" height="6" fill="white" opacity="0.4" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">PrivaChart</h1>
            <p className="text-xs text-muted-foreground">Privacy-First Visualization</p>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-w-0">
        <div className="p-5 space-y-6 stagger-in">
          {/* Data Source Section */}
          <section className="space-y-3">
            <div className="section-header">
              <div className="section-header-icon">
                <BarChart2 size={16} />
              </div>
              <h2 className="section-header-text">Data Source</h2>
            </div>
            <DataInput />
          </section>

          {data.length > 0 && (
            <>
              {/* Chart Type Section */}
              <section className="space-y-3">
                <div className="section-header">
                  <div className="section-header-icon">
                    <BarChart2 size={16} />
                  </div>
                  <h2 className="section-header-text">Chart Type</h2>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {CHART_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => updateConfig({ type: type.id as ChartType })}
                      className={`
                        group relative h-14 border-2 border-border font-mono text-xs flex flex-col items-center justify-center gap-1 transition-all duration-200
                        ${config.type === type.id
                          ? 'bg-primary text-primary-foreground translate-x-[2px] translate-y-[2px] shadow-none'
                          : 'bg-card hover:bg-secondary neo-shadow-sm'}
                      `}
                    >
                      <span className={`text-lg leading-none ${config.type === type.id ? '' : 'group-hover:scale-110 transition-transform'}`}>
                        {type.icon}
                      </span>
                      <span className="font-medium uppercase tracking-wider text-[10px]">{type.label}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Data Mapping Section */}
              <section className="space-y-3">
                <div className="section-header">
                  <div className="section-header-icon">
                    <Activity size={16} />
                  </div>
                  <h2 className="section-header-text">Data Mapping</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <NeoLabel>X Axis (Category)</NeoLabel>
                    <NeoSelect
                      value={config.xAxisColumn}
                      onChange={(e) => updateConfig({ xAxisColumn: e.target.value })}
                    >
                      <option value="">Select column...</option>
                      {columns.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </NeoSelect>
                  </div>

                  <div>
                    <NeoLabel>Y Axis (Values)</NeoLabel>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto border-2 border-border p-2 bg-card">
                      {metadata
                        .filter(m => m.type === 'number')
                        .map(m => (
                          <label
                            key={m.name}
                            className="flex items-center gap-2.5 cursor-pointer hover:bg-secondary p-1.5 transition-colors group"
                          >
                            <div className={`w-4 h-4 border-2 border-border flex items-center justify-center transition-all ${
                              config.yAxisColumns.includes(m.name)
                                ? 'bg-primary border-primary'
                                : 'bg-card group-hover:border-primary'
                            }`}>
                              {config.yAxisColumns.includes(m.name) && (
                                <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="square" strokeLinejoin="miter" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <input
                              type="checkbox"
                              checked={config.yAxisColumns.includes(m.name)}
                              onChange={() => handleYAxisToggle(m.name)}
                              className="sr-only"
                            />
                            <span className="text-sm">{m.name}</span>
                          </label>
                        ))}
                    </div>

                    {config.yAxisColumns.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {config.yAxisColumns.map(col => (
                          <div
                            key={col}
                            className="group flex items-center gap-1.5 bg-primary text-primary-foreground px-2.5 py-1 text-xs font-medium"
                          >
                            {col}
                            <button
                              onClick={() => handleYAxisToggle(col)}
                              className="opacity-70 hover:opacity-100 transition-opacity"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Appearance Section */}
              <section className="space-y-3">
                <div className="section-header">
                  <div className="section-header-icon">
                    <Palette size={16} />
                  </div>
                  <h2 className="section-header-text">Appearance</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <NeoLabel>Chart Title</NeoLabel>
                    <NeoInput
                      value={config.title}
                      onChange={(e) => updateConfig({ title: e.target.value })}
                      placeholder="Enter title..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <div className={`w-4 h-4 border-2 border-border flex items-center justify-center transition-all ${
                        config.showLegend ? 'bg-primary border-primary' : 'bg-card group-hover:border-primary'
                      }`}>
                        {config.showLegend && (
                          <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="square" strokeLinejoin="miter" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <input
                        type="checkbox"
                        checked={config.showLegend}
                        onChange={(e) => updateConfig({ showLegend: e.target.checked })}
                        className="sr-only"
                      />
                      <span className="text-sm">Show Legend</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <div className={`w-4 h-4 border-2 border-border flex items-center justify-center transition-all ${
                        config.showGrid ? 'bg-primary border-primary' : 'bg-card group-hover:border-primary'
                      }`}>
                        {config.showGrid && (
                          <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="square" strokeLinejoin="miter" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <input
                        type="checkbox"
                        checked={config.showGrid}
                        onChange={(e) => updateConfig({ showGrid: e.target.checked })}
                        className="sr-only"
                      />
                      <span className="text-sm">Show Grid</span>
                    </label>

                    {(config.type === 'bar' || config.type === 'area') && (
                      <label className="flex items-center gap-2.5 cursor-pointer group">
                        <div className={`w-4 h-4 border-2 border-border flex items-center justify-center transition-all ${
                          config.isStacked ? 'bg-primary border-primary' : 'bg-card group-hover:border-primary'
                        }`}>
                          {config.isStacked && (
                            <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="square" strokeLinejoin="miter" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <input
                          type="checkbox"
                          checked={config.isStacked}
                          onChange={(e) => updateConfig({ isStacked: e.target.checked })}
                          className="sr-only"
                        />
                        <span className="text-sm">Stacked</span>
                      </label>
                    )}
                  </div>
                </div>
              </section>

              {/* Additional Panels */}
              <FilterPanel />
              <StatsPanel />
              <AnalyticsPanel />
              <DataCleaningPanel />
              <ExportPanel chartRef={chartRef} />
              <DataPreview />
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t-2 border-border bg-secondary/50 text-xs text-muted-foreground flex items-center justify-between">
        <span className="font-medium">v1.1.0</span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          Local Processing
        </span>
      </div>
    </div>
  );
}
