import React from 'react';
import { useData } from '@/contexts/DataContext';
import { useFilter } from '@/contexts/FilterContext';
import { NeoLabel, NeoSelect, NeoInput, NeoButton } from '@/components/ui/neo-brutalism';
import { Filter, RotateCcw } from 'lucide-react';

export default function FilterPanel() {
  const { data, columns, metadata } = useData();
  const { filter, updateFilter, resetFilter } = useFilter();

  if (!data.length) return null;

  const numericColumns = metadata
    .filter(m => m.type === 'number')
    .map(m => m.name);

  return (
    <section className="space-y-3 border-t-2 border-black pt-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="bg-black text-white p-1">
          <Filter size={14} />
        </div>
        <h2 className="font-bold font-mono uppercase text-sm">Data Processing</h2>
      </div>

      <div className="space-y-3 bg-gray-50 p-3 border-2 border-black">
        {/* Row Limit */}
        <div>
          <NeoLabel>Show Top N Rows</NeoLabel>
          <div className="flex gap-2">
            <NeoInput
              type="number"
              min="1"
              max="1000"
              value={filter.rowLimit}
              onChange={(e) => updateFilter({ rowLimit: Number(e.target.value) })}
              className="flex-1"
            />
            <select
              value={filter.rowLimit}
              onChange={(e) => updateFilter({ rowLimit: Number(e.target.value) })}
              className="border-2 border-black px-2 py-2 font-mono text-sm bg-white"
            >
              <option value="10">Top 10</option>
              <option value="20">Top 20</option>
              <option value="50">Top 50</option>
              <option value="100">Top 100</option>
              <option value="500">Top 500</option>
              <option value="1000">All</option>
            </select>
          </div>
        </div>

        {/* Sorting */}
        <div>
          <NeoLabel>Sort By</NeoLabel>
          <div className="flex gap-2">
            <NeoSelect
              value={filter.sortColumn || ''}
              onChange={(e) => updateFilter({ sortColumn: e.target.value || null })}
              className="flex-1"
            >
              <option value="">None</option>
              {numericColumns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </NeoSelect>
            <NeoSelect
              value={filter.sortBy}
              onChange={(e) => updateFilter({ sortBy: e.target.value as any })}
              className="w-24"
            >
              <option value="none">—</option>
              <option value="ascending">↑ Asc</option>
              <option value="descending">↓ Desc</option>
            </NeoSelect>
          </div>
        </div>

        {/* Aggregation */}
        <div>
          <NeoLabel>Group By (Aggregate)</NeoLabel>
          <div className="flex gap-2">
            <NeoSelect
              value={filter.aggregateBy || ''}
              onChange={(e) => updateFilter({ aggregateBy: e.target.value || null })}
              className="flex-1"
            >
              <option value="">None</option>
              {columns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </NeoSelect>
            {filter.aggregateBy && (
              <NeoSelect
                value={filter.aggregateFunction}
                onChange={(e) => updateFilter({ aggregateFunction: e.target.value as any })}
                className="w-24"
              >
                <option value="sum">Sum</option>
                <option value="avg">Avg</option>
                <option value="count">Count</option>
                <option value="min">Min</option>
                <option value="max">Max</option>
              </NeoSelect>
            )}
          </div>
        </div>

        {/* Filtering */}
        <div>
          <NeoLabel>Filter Data</NeoLabel>
          <div className="space-y-2">
            <NeoSelect
              value={filter.filterColumn || ''}
              onChange={(e) => updateFilter({ filterColumn: e.target.value || null })}
            >
              <option value="">Select Column...</option>
              {columns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </NeoSelect>

            {filter.filterColumn && (
              <div className="flex gap-2">
                <NeoSelect
                  value={filter.filterOperator}
                  onChange={(e) => updateFilter({ filterOperator: e.target.value as any })}
                  className="w-20"
                >
                  <option value="=">=</option>
                  <option value=">">&gt;</option>
                  <option value="<">&lt;</option>
                  <option value=">=">&gt;=</option>
                  <option value="<=">&lt;=</option>
                  <option value="contains">~</option>
                </NeoSelect>
                <NeoInput
                  type="text"
                  value={filter.filterValue}
                  onChange={(e) => updateFilter({ filterValue: e.target.value })}
                  placeholder="Value..."
                  className="flex-1"
                />
              </div>
            )}
          </div>
        </div>

        <NeoButton
          variant="secondary"
          size="sm"
          onClick={resetFilter}
          className="w-full justify-center text-xs"
        >
          <RotateCcw size={12} className="mr-1" />
          Reset Filters
        </NeoButton>
      </div>
    </section>
  );
}
