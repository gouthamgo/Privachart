import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function DataPreview() {
  const { data, columns, metadata } = useData();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!data.length) return null;

  const previewRows = data.slice(0, 5);

  return (
    <section className="space-y-2 border-t-2 border-black pt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between font-bold font-mono uppercase text-sm p-2 hover:bg-gray-100 transition-colors"
      >
        <span>Data Preview ({data.length} rows)</span>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isExpanded && (
        <div className="border-2 border-black bg-white overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b-2 border-black bg-gray-100">
                {columns.map(col => (
                  <th key={col} className="px-2 py-1 text-left font-bold">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {columns.map(col => (
                    <td key={`${idx}-${col}`} className="px-2 py-1 border-r border-gray-200">
                      {String(row[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {metadata.length > 0 && (
        <div className="text-xs font-mono text-muted-foreground space-y-1">
          {metadata.map(m => (
            <div key={m.name} className="flex justify-between">
              <span>{m.name}</span>
              <span className="text-right">{m.type} • {m.uniqueValues} unique</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
