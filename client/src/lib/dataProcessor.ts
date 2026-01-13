import { DataRow } from '@/contexts/DataContext';
import { FilterConfig } from '@/contexts/FilterContext';

export interface ProcessedData {
  data: DataRow[];
  stats: {
    originalCount: number;
    processedCount: number;
    filteredOut: number;
  };
}

export function processData(
  rawData: DataRow[],
  filter: FilterConfig,
  numericColumns: string[]
): ProcessedData {
  let data = [...rawData];
  const originalCount = data.length;

  // Step 1: Apply filtering
  if (filter.filterColumn && filter.filterValue) {
    data = data.filter(row => {
      const value = String(row[filter.filterColumn!]);
      const filterVal = filter.filterValue;

      switch (filter.filterOperator) {
        case '=':
          return value === filterVal;
        case '>':
          return Number(value) > Number(filterVal);
        case '<':
          return Number(value) < Number(filterVal);
        case '>=':
          return Number(value) >= Number(filterVal);
        case '<=':
          return Number(value) <= Number(filterVal);
        case 'contains':
          return value.toLowerCase().includes(filterVal.toLowerCase());
        default:
          return true;
      }
    });
  }

  // Step 2: Apply aggregation (grouping)
  if (filter.aggregateBy && numericColumns.length > 0) {
    const grouped: { [key: string]: DataRow[] } = {};

    data.forEach(row => {
      const key = String(row[filter.aggregateBy!]);
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(row);
    });

    data = Object.entries(grouped).map(([key, rows]) => {
      const aggregated: DataRow = { [filter.aggregateBy!]: key };

      numericColumns.forEach(col => {
        const values = rows.map(r => Number(r[col]) || 0);

        switch (filter.aggregateFunction) {
          case 'sum':
            aggregated[col] = values.reduce((a, b) => a + b, 0);
            break;
          case 'avg':
            aggregated[col] = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
            break;
          case 'count':
            aggregated[col] = values.length;
            break;
          case 'min':
            aggregated[col] = Math.min(...values);
            break;
          case 'max':
            aggregated[col] = Math.max(...values);
            break;
        }
      });

      return aggregated;
    });
  }

  // Step 3: Apply sorting
  if (filter.sortBy !== 'none' && filter.sortColumn) {
    data.sort((a, b) => {
      const aVal = Number(a[filter.sortColumn!]) || 0;
      const bVal = Number(b[filter.sortColumn!]) || 0;

      if (filter.sortBy === 'ascending') {
        return aVal - bVal;
      } else {
        return bVal - aVal;
      }
    });
  }

  // Step 4: Apply row limit
  const processedCount = Math.min(data.length, filter.rowLimit);
  data = data.slice(0, processedCount);

  return {
    data,
    stats: {
      originalCount,
      processedCount,
      filteredOut: originalCount - data.length,
    },
  };
}

export function calculateStatistics(data: DataRow[], column: string) {
  const values = data.map(row => Number(row[column]) || 0).filter(v => !isNaN(v));

  if (values.length === 0) {
    return { min: 0, max: 0, avg: 0, sum: 0, median: 0 };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((a, b) => a + b, 0);
  const avg = sum / values.length;
  const median = values.length % 2 === 0
    ? (sorted[values.length / 2 - 1] + sorted[values.length / 2]) / 2
    : sorted[Math.floor(values.length / 2)];

  return {
    min: Math.min(...values),
    max: Math.max(...values),
    avg: Number(avg.toFixed(2)),
    sum: Number(sum.toFixed(2)),
    median: Number(median.toFixed(2)),
  };
}

export function generateTrendLine(data: DataRow[], column: string) {
  const values = data.map(row => Number(row[column]) || 0);

  if (values.length < 2) return [];

  // Simple linear regression
  const n = values.length;
  const xSum = (n * (n - 1)) / 2;
  const ySum = values.reduce((a, b) => a + b, 0);
  const xySum = values.reduce((sum, y, x) => sum + x * y, 0);
  const x2Sum = values.reduce((sum, _, x) => sum + x * x, 0);

  const slope = (n * xySum - xSum * ySum) / (n * x2Sum - xSum * xSum);
  const intercept = (ySum - slope * xSum) / n;

  return values.map((_, x) => slope * x + intercept);
}
