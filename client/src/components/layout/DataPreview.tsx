import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { ChevronDown, ChevronUp, Table } from 'lucide-react';

export default function DataPreview() {
  const { data, columns, metadata } = useData();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!data.length) return null;

  const previewRows = data.slice(0, 5);

  return (
    <section className="space-y-3 border-t-2 border-border pt-4 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-2 hover:bg-secondary transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="section-header-icon w-6 h-6">
            <Table size={12} />
          </div>
          <span className="text-xs font-bold uppercase tracking-wide">
            Data Preview
          </span>
          <span className="text-xs text-muted-foreground">
            ({data.length} rows)
          </span>
        </div>
        <div className="w-6 h-6 flex items-center justify-center border-2 border-border bg-card group-hover:bg-secondary transition-colors">
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {/* Expandable Table */}
      {isExpanded && (
        <div className="border-2 border-border bg-card overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b-2 border-border bg-secondary">
                {columns.map(col => (
                  <th key={col} className="px-3 py-2 text-left font-semibold uppercase tracking-wide text-muted-foreground">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, idx) => (
                <tr
                  key={idx}
                  className={`border-b border-border/50 last:border-b-0 ${idx % 2 === 0 ? 'bg-card' : 'bg-secondary/30'}`}
                >
                  {columns.map(col => (
                    <td key={`${idx}-${col}`} className="px-3 py-2 truncate max-w-[120px]">
                      {String(row[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Column Metadata */}
      {metadata.length > 0 && (
        <div className="space-y-1.5 overflow-hidden">
          {metadata.map(m => (
            <div key={m.name} className="flex items-center justify-between gap-2 min-w-0 text-xs">
              <span className="truncate flex-shrink font-medium">{m.name}</span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`
                  px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider
                  ${m.type === 'number' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}
                `}>
                  {m.type}
                </span>
                <span className="text-muted-foreground whitespace-nowrap">
                  {m.uniqueValues} unique
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
