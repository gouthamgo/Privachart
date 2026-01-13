import React, { useMemo, useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useConfig } from '@/contexts/ConfigContext';
import { useFilter } from '@/contexts/FilterContext';
import { processData } from '@/lib/dataProcessor';
import {
  detectOutliers,
  calculateCorrelationMatrix,
  generateInsights,
  createPivotTable,
} from '@/lib/analytics';
import { NeoButton, NeoSelect, NeoLabel } from '@/components/ui/neo-brutalism';
import { AlertTriangle, TrendingUp, Lightbulb, Grid3x3 } from 'lucide-react';

export default function AnalyticsPanel() {
  const { data: rawData, metadata, columns } = useData();
  const { config } = useConfig();
  const { filter } = useFilter();
  const [activeTab, setActiveTab] = useState<'insights' | 'outliers' | 'correlation' | 'pivot'>('insights');
  const [pivotRowCol, setPivotRowCol] = useState('');
  const [pivotColCol, setPivotColCol] = useState('');

  const numericColumns = metadata
    .filter(m => m.type === 'number')
    .map(m => m.name);

  const { data } = useMemo(() => {
    return processData(rawData, filter, numericColumns);
  }, [rawData, filter, numericColumns]);

  const insights = useMemo(() => {
    return generateInsights(data, numericColumns, metadata);
  }, [data, numericColumns, metadata]);

  const outliers = useMemo(() => {
    return detectOutliers(data, numericColumns);
  }, [data, numericColumns]);

  const correlationMatrix = useMemo(() => {
    if (numericColumns.length < 2) return null;
    return calculateCorrelationMatrix(data, numericColumns);
  }, [data, numericColumns]);

  const pivotTable = useMemo(() => {
    if (!pivotRowCol || !pivotColCol || numericColumns.length === 0) return null;
    return createPivotTable(data, pivotRowCol, pivotColCol, numericColumns[0], 'sum');
  }, [data, pivotRowCol, pivotColCol, numericColumns]);

  if (!data.length) return null;

  return (
    <section className="space-y-3 border-t-2 border-black pt-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="bg-black text-white p-1">
          <Lightbulb size={14} />
        </div>
        <h2 className="font-bold font-mono uppercase text-sm">Analytics</h2>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-2 border-black bg-gray-50 p-1">
        {[
          { id: 'insights', label: '💡 Insights', icon: Lightbulb },
          { id: 'outliers', label: '⚠️ Outliers', icon: AlertTriangle },
          { id: 'correlation', label: '🔗 Correlation', icon: TrendingUp },
          { id: 'pivot', label: '⊞ Pivot', icon: Grid3x3 },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 px-2 py-1 text-xs font-mono transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-white border-2 border-primary'
                : 'border-2 border-transparent hover:bg-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-2 text-sm font-mono">
          {insights.length > 0 ? (
            insights.map((insight, idx) => (
              <div key={idx} className="p-2 bg-blue-50 border-2 border-blue-200 text-blue-900">
                {insight}
              </div>
            ))
          ) : (
            <div className="p-2 text-muted-foreground">No insights available</div>
          )}
        </div>
      )}

      {/* Outliers Tab */}
      {activeTab === 'outliers' && (
        <div className="space-y-2 text-xs font-mono max-h-48 overflow-y-auto">
          {outliers.length > 0 ? (
            outliers.map((outlier, idx) => (
              <div key={idx} className="p-2 bg-red-50 border-2 border-red-200">
                <div className="font-bold text-red-900">Row {outlier.rowIndex + 1}</div>
                <div className="text-red-800">
                  Outliers in: {outlier.outlierColumns.join(', ')}
                </div>
                <div className="text-red-700 mt-1">
                  {outlier.outlierColumns.map(col => (
                    <div key={col}>
                      {col}: {outlier.values[col].toFixed(2)}
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="p-2 text-muted-foreground">No outliers detected</div>
          )}
        </div>
      )}

      {/* Correlation Tab */}
      {activeTab === 'correlation' && (
        <div className="space-y-2">
          {correlationMatrix ? (
            <div className="overflow-x-auto">
              <table className="text-xs font-mono border-collapse">
                <thead>
                  <tr>
                    <th className="border-2 border-black p-1 bg-gray-100"></th>
                    {correlationMatrix.columns.map(col => (
                      <th key={col} className="border-2 border-black p-1 bg-gray-100 max-w-12 truncate">
                        {col.substring(0, 6)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {correlationMatrix.matrix.map((row, i) => (
                    <tr key={i}>
                      <td className="border-2 border-black p-1 bg-gray-100 font-bold">
                        {correlationMatrix.columns[i].substring(0, 6)}
                      </td>
                      {row.map((val, j) => {
                        const intensity = Math.abs(val);
                        const bgColor = val > 0.7 ? 'bg-green-300' : val > 0.3 ? 'bg-yellow-200' : val < -0.7 ? 'bg-red-300' : 'bg-gray-100';
                        return (
                          <td key={j} className={`border-2 border-black p-1 text-center ${bgColor}`}>
                            {val.toFixed(2)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
              </tbody>
              </table>
            </div>
          ) : (
            <div className="p-2 text-muted-foreground">Need at least 2 numeric columns</div>
          )}
        </div>
      )}

      {/* Pivot Table Tab */}
      {activeTab === 'pivot' && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="flex-1">
              <NeoLabel>Rows</NeoLabel>
              <NeoSelect value={pivotRowCol} onChange={(e) => setPivotRowCol(e.target.value)}>
                <option value="">Select...</option>
                {columns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </NeoSelect>
            </div>
            <div className="flex-1">
              <NeoLabel>Columns</NeoLabel>
              <NeoSelect value={pivotColCol} onChange={(e) => setPivotColCol(e.target.value)}>
                <option value="">Select...</option>
                {columns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </NeoSelect>
            </div>
          </div>

          {pivotTable && (
            <div className="overflow-x-auto max-h-48">
              <table className="text-xs font-mono border-collapse">
                <thead>
                  <tr>
                    <th className="border-2 border-black p-1 bg-gray-100"></th>
                    {pivotTable.columns.map(col => (
                      <th key={col} className="border-2 border-black p-1 bg-gray-100">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pivotTable.rows.map((row, i) => (
                    <tr key={i}>
                      <td className="border-2 border-black p-1 bg-gray-100 font-bold">{row}</td>
                      {pivotTable.data[i].map((val, j) => (
                        <td key={j} className="border-2 border-black p-1 text-right">
                          {val !== null ? val.toFixed(1) : '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
