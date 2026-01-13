import React from 'react';
import { useData } from '@/contexts/DataContext';
import { useConfig, ChartType } from '@/contexts/ConfigContext';
import { NeoButton, NeoInput, NeoSelect, NeoLabel } from '@/components/ui/neo-brutalism';
import { BarChart2, Activity, Type, X } from 'lucide-react';
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
    <div className="w-80 border-r-2 border-black bg-sidebar h-full flex flex-col overflow-y-auto">
      <div className="p-4 border-b-2 border-black bg-white sticky top-0 z-10">
        <h1 className="text-xl font-bold font-mono tracking-tighter flex items-center gap-2">
          <div className="w-6 h-6 bg-primary"></div>
          PrivaChart
        </h1>
        <p className="text-xs text-muted-foreground mt-1 font-mono">Privacy-First Visualization</p>
      </div>

      <div className="p-4 space-y-6 flex-1 overflow-y-auto">
        {/* Data Section */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-black text-white p-1">
              <BarChart2 size={14} />
            </div>
            <h2 className="font-bold font-mono uppercase text-sm">Data Source</h2>
          </div>
          <DataInput />
        </section>

        {data.length > 0 && (
          <>
            {/* Chart Type Section */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-black text-white p-1">
                  <BarChart2 size={14} />
                </div>
                <h2 className="font-bold font-mono uppercase text-sm">Chart Type</h2>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'bar', icon: '📊' },
                  { id: 'line', icon: '📈' },
                  { id: 'pie', icon: '🥧' },
                  { id: 'doughnut', icon: '🍩' },
                  { id: 'scatter', icon: '∴' },
                  { id: 'area', icon: '🗻' },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => updateConfig({ type: type.id as ChartType })}
                    className={`
                      h-10 border-2 border-black font-mono text-lg flex items-center justify-center transition-all
                      ${config.type === type.id 
                        ? 'bg-primary text-white translate-x-[2px] translate-y-[2px] shadow-none' 
                        : 'bg-white hover:bg-gray-50 neo-shadow'}
                    `}
                    title={type.id}
                  >
                    {type.icon}
                  </button>
                ))}
              </div>
            </section>

            {/* Mapping Section */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-black text-white p-1">
                  <Activity size={14} />
                </div>
                <h2 className="font-bold font-mono uppercase text-sm">Data Mapping</h2>
              </div>
              
              <div className="space-y-3">
                <div>
                  <NeoLabel>X Axis (Category)</NeoLabel>
                  <NeoSelect 
                    value={config.xAxisColumn} 
                    onChange={(e) => updateConfig({ xAxisColumn: e.target.value })}
                  >
                    <option value="">Select Column...</option>
                    {columns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </NeoSelect>
                </div>

                <div>
                  <NeoLabel>Y Axis (Values) - Multi-Select</NeoLabel>
                  <div className="space-y-2 max-h-32 overflow-y-auto border-2 border-black p-2 bg-white">
                    {metadata
                      .filter(m => m.type === 'number')
                      .map(m => (
                        <label key={m.name} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1">
                          <input 
                            type="checkbox"
                            checked={config.yAxisColumns.includes(m.name)}
                            onChange={() => handleYAxisToggle(m.name)}
                            className="w-4 h-4 border-2 border-black rounded-none text-primary"
                          />
                          <span className="text-sm font-mono">{m.name}</span>
                        </label>
                      ))}
                  </div>
                  {config.yAxisColumns.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {config.yAxisColumns.map(col => (
                        <div key={col} className="flex items-center gap-1 bg-primary text-white px-2 py-1 text-xs font-mono">
                          {col}
                          <button
                            onClick={() => handleYAxisToggle(col)}
                            className="ml-1 hover:opacity-70"
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
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-black text-white p-1">
                  <Type size={14} />
                </div>
                <h2 className="font-bold font-mono uppercase text-sm">Appearance</h2>
              </div>
              
              <div className="space-y-3">
                <div>
                  <NeoLabel>Chart Title</NeoLabel>
                  <NeoInput 
                    value={config.title} 
                    onChange={(e) => updateConfig({ title: e.target.value })}
                    placeholder="Enter title..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="showLegend"
                    checked={config.showLegend}
                    onChange={(e) => updateConfig({ showLegend: e.target.checked })}
                    className="w-4 h-4 border-2 border-black rounded-none text-primary focus:ring-primary"
                  />
                  <label htmlFor="showLegend" className="font-mono text-sm cursor-pointer">Show Legend</label>
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="showGrid"
                    checked={config.showGrid}
                    onChange={(e) => updateConfig({ showGrid: e.target.checked })}
                    className="w-4 h-4 border-2 border-black rounded-none text-primary focus:ring-primary"
                  />
                  <label htmlFor="showGrid" className="font-mono text-sm cursor-pointer">Show Grid</label>
                </div>

                {(config.type === 'bar' || config.type === 'area') && (
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="isStacked"
                      checked={config.isStacked}
                      onChange={(e) => updateConfig({ isStacked: e.target.checked })}
                      className="w-4 h-4 border-2 border-black rounded-none text-primary focus:ring-primary"
                    />
                    <label htmlFor="isStacked" className="font-mono text-sm cursor-pointer">Stacked</label>
                  </div>
                )}
              </div>
            </section>

            {/* Filtering & Aggregation */}
            <FilterPanel />

            {/* Statistics */}
            <StatsPanel />

            {/* Advanced Analytics */}
            <AnalyticsPanel />

            {/* Data Cleaning */}
            <DataCleaningPanel />

            {/* Export & History */}
            <ExportPanel chartRef={chartRef} />

            {/* Data Preview */}
            <DataPreview />
          </>
        )}
      </div>
      
      <div className="mt-auto p-4 border-t-2 border-black bg-gray-50 text-xs font-mono text-muted-foreground sticky bottom-0">
        <p>v1.1.0 • Local Processing</p>
      </div>
    </div>
  );
}
