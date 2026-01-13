import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { useFilter } from '@/contexts/FilterContext';
import { processData } from '@/lib/dataProcessor';
import { removeMissingValues, removeDuplicates, detectOutliers } from '@/lib/analytics';
import { NeoButton, NeoSelect, NeoLabel } from '@/components/ui/neo-brutalism';
import { Trash2, AlertCircle } from 'lucide-react';

export default function DataCleaningPanel() {
  const { data: rawData, metadata, columns } = useData();
  const { filter } = useFilter();
  const [cleaningOptions, setCleaningOptions] = useState({
    removeMissing: false,
    removeDuplicates: false,
    removeOutliers: false,
    outliersensitivity: 1.5,
  });

  const numericColumns = metadata
    .filter(m => m.type === 'number')
    .map(m => m.name);

  const { data: processedData } = useMemo(() => {
    return processData(rawData, filter, numericColumns);
  }, [rawData, filter, numericColumns]);

  const cleanedData = useMemo(() => {
    let result = [...processedData];

    if (cleaningOptions.removeMissing) {
      result = removeMissingValues(result, columns);
    }

    if (cleaningOptions.removeDuplicates) {
      result = removeDuplicates(result, columns);
    }

    if (cleaningOptions.removeOutliers) {
      const outliers = detectOutliers(result, numericColumns, cleaningOptions.outliersensitivity);
      const outlierIndices = new Set(outliers.map(o => o.rowIndex));
      result = result.filter((_, idx) => !outlierIndices.has(idx));
    }

    return result;
  }, [processedData, cleaningOptions, columns, numericColumns]);

  const stats = {
    original: processedData.length,
    cleaned: cleanedData.length,
    removed: processedData.length - cleanedData.length,
  };

  if (!rawData.length) return null;

  return (
    <section className="space-y-3 border-t-2 border-black pt-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="bg-black text-white p-1">
          <Trash2 size={14} />
        </div>
        <h2 className="font-bold font-mono uppercase text-sm">Data Cleaning</h2>
      </div>

      <div className="space-y-3 bg-gray-50 p-3 border-2 border-black">
        {/* Cleaning Options */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="removeMissing"
              checked={cleaningOptions.removeMissing}
              onChange={(e) => setCleaningOptions({ ...cleaningOptions, removeMissing: e.target.checked })}
              className="w-4 h-4 border-2 border-black rounded-none"
            />
            <label htmlFor="removeMissing" className="font-mono text-sm cursor-pointer">
              Remove rows with missing values
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="removeDuplicates"
              checked={cleaningOptions.removeDuplicates}
              onChange={(e) => setCleaningOptions({ ...cleaningOptions, removeDuplicates: e.target.checked })}
              className="w-4 h-4 border-2 border-black rounded-none"
            />
            <label htmlFor="removeDuplicates" className="font-mono text-sm cursor-pointer">
              Remove duplicate rows
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="removeOutliers"
              checked={cleaningOptions.removeOutliers}
              onChange={(e) => setCleaningOptions({ ...cleaningOptions, removeOutliers: e.target.checked })}
              className="w-4 h-4 border-2 border-black rounded-none"
            />
            <label htmlFor="removeOutliers" className="font-mono text-sm cursor-pointer">
              Remove outliers
            </label>
          </div>

          {cleaningOptions.removeOutliers && (
            <div className="ml-6 space-y-2">
              <NeoLabel>Sensitivity (IQR multiplier)</NeoLabel>
              <div className="flex gap-2">
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={cleaningOptions.outliersensitivity}
                  onChange={(e) => setCleaningOptions({ ...cleaningOptions, outliersensitivity: Number(e.target.value) })}
                  className="flex-1"
                />
                <span className="font-mono text-sm w-12 text-right">{cleaningOptions.outliersensitivity.toFixed(1)}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Lower = more sensitive (removes more rows)
              </div>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="pt-2 border-t border-gray-300 space-y-2">
          <div className="text-xs font-bold text-muted-foreground uppercase">Impact</div>
          <div className="grid grid-cols-3 gap-2 text-xs font-mono">
            <div className="p-2 bg-white border-2 border-black">
              <div className="text-muted-foreground">Original</div>
              <div className="font-bold text-lg">{stats.original}</div>
            </div>
            <div className="p-2 bg-white border-2 border-black">
              <div className="text-muted-foreground">Removed</div>
              <div className="font-bold text-lg text-red-600">{stats.removed}</div>
            </div>
            <div className="p-2 bg-white border-2 border-black">
              <div className="text-muted-foreground">Cleaned</div>
              <div className="font-bold text-lg text-green-600">{stats.cleaned}</div>
            </div>
          </div>
        </div>

        {stats.removed > 0 && (
          <div className="p-2 bg-yellow-50 border-2 border-yellow-200 text-xs font-mono text-yellow-900 flex gap-2">
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            <div>
              {stats.removed} rows will be removed. This affects all visualizations and statistics.
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
