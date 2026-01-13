import React, { useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { useConfig } from '@/contexts/ConfigContext';
import { useFilter } from '@/contexts/FilterContext';
import { processData, calculateStatistics } from '@/lib/dataProcessor';
import { BarChart3 } from 'lucide-react';

export default function StatsPanel() {
  const { data: rawData, metadata } = useData();
  const { config } = useConfig();
  const { filter } = useFilter();

  const numericColumns = metadata
    .filter(m => m.type === 'number')
    .map(m => m.name);

  const { data, stats } = useMemo(() => {
    return processData(rawData, filter, numericColumns);
  }, [rawData, filter, numericColumns]);

  const columnStats = useMemo(() => {
    if (!config.yAxisColumns.length || !data.length) return null;

    return config.yAxisColumns.map(col => ({
      column: col,
      stats: calculateStatistics(data, col)
    }));
  }, [data, config.yAxisColumns]);

  if (!data.length || !columnStats) return null;

  return (
    <section className="space-y-2 border-t-2 border-black pt-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="bg-black text-white p-1">
          <BarChart3 size={14} />
        </div>
        <h2 className="font-bold font-mono uppercase text-sm">Statistics</h2>
      </div>

      <div className="space-y-2 text-xs font-mono">
        <div className="p-2 border-2 border-black bg-white">
          <div className="flex justify-between mb-2 pb-2 border-b border-gray-300">
            <span className="font-bold">Data Summary</span>
            <span>{stats.processedCount} / {stats.originalCount} rows</span>
          </div>
          {stats.filteredOut > 0 && (
            <div className="text-red-700">
              ⚠️ {stats.filteredOut} rows filtered out
            </div>
          )}
        </div>

        {columnStats.map(({ column, stats: colStats }) => (
          <div key={column} className="p-2 border-2 border-black bg-blue-50">
            <div className="font-bold mb-2 text-blue-900">{column}</div>
            <div className="grid grid-cols-2 gap-2 text-blue-800">
              <div>
                <span className="opacity-70">Min:</span> {colStats.min.toFixed(2)}
              </div>
              <div>
                <span className="opacity-70">Max:</span> {colStats.max.toFixed(2)}
              </div>
              <div>
                <span className="opacity-70">Avg:</span> {colStats.avg.toFixed(2)}
              </div>
              <div>
                <span className="opacity-70">Sum:</span> {colStats.sum.toFixed(2)}
              </div>
              <div className="col-span-2">
                <span className="opacity-70">Median:</span> {colStats.median.toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
