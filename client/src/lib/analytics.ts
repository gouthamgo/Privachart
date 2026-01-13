import { DataRow } from '@/contexts/DataContext';

export interface OutlierResult {
  rowIndex: number;
  values: { [key: string]: number };
  outlierColumns: string[];
  severity: 'low' | 'medium' | 'high';
}

export interface CorrelationMatrix {
  columns: string[];
  matrix: number[][];
}

export interface PivotResult {
  rows: string[];
  columns: string[];
  data: (number | null)[][];
  aggregateFunction: string;
}

/**
 * Detect outliers using Interquartile Range (IQR) method
 * Points beyond Q1 - 1.5*IQR or Q3 + 1.5*IQR are flagged
 */
export function detectOutliers(
  data: DataRow[],
  numericColumns: string[],
  sensitivity: number = 1.5 // Standard is 1.5, lower = more sensitive
): OutlierResult[] {
  const outliers: OutlierResult[] = [];

  data.forEach((row, rowIndex) => {
    const outlierColumns: string[] = [];
    let severity: 'low' | 'medium' | 'high' = 'low';

    numericColumns.forEach(col => {
      const values = data.map(r => Number(r[col]) || 0).sort((a, b) => a - b);
      const q1 = values[Math.floor(values.length * 0.25)];
      const q3 = values[Math.floor(values.length * 0.75)];
      const iqr = q3 - q1;

      const value = Number(row[col]) || 0;
      const lowerBound = q1 - sensitivity * iqr;
      const upperBound = q3 + sensitivity * iqr;

      if (value < lowerBound || value > upperBound) {
        outlierColumns.push(col);
        severity = 'high';
      }
    });

    if (outlierColumns.length > 0) {
      outliers.push({
        rowIndex,
        values: Object.fromEntries(
          numericColumns.map(col => [col, Number(row[col]) || 0])
        ),
        outlierColumns,
        severity,
      });
    }
  });

  return outliers;
}

/**
 * Calculate Pearson correlation coefficient between two columns
 */
function calculateCorrelation(col1: number[], col2: number[]): number {
  const n = col1.length;
  const mean1 = col1.reduce((a, b) => a + b, 0) / n;
  const mean2 = col2.reduce((a, b) => a + b, 0) / n;

  const numerator = col1.reduce((sum, x, i) => sum + (x - mean1) * (col2[i] - mean2), 0);
  const denominator = Math.sqrt(
    col1.reduce((sum, x) => sum + Math.pow(x - mean1, 2), 0) *
    col2.reduce((sum, y) => sum + Math.pow(y - mean2, 2), 0)
  );

  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Generate correlation matrix for all numeric columns
 */
export function calculateCorrelationMatrix(
  data: DataRow[],
  numericColumns: string[]
): CorrelationMatrix {
  const matrix: number[][] = [];

  numericColumns.forEach((col1, i) => {
    matrix[i] = [];
    const values1 = data.map(r => Number(r[col1]) || 0);

    numericColumns.forEach((col2, j) => {
      if (i === j) {
        matrix[i][j] = 1; // Perfect correlation with self
      } else if (i > j) {
        matrix[i][j] = matrix[j][i]; // Symmetric
      } else {
        const values2 = data.map(r => Number(r[col2]) || 0);
        matrix[i][j] = calculateCorrelation(values1, values2);
      }
    });
  });

  return { columns: numericColumns, matrix };
}

/**
 * Create pivot table (cross-tabulation)
 * Groups by rowGroupColumn, columns by colGroupColumn, aggregates using aggregateFunction
 */
export function createPivotTable(
  data: DataRow[],
  rowGroupColumn: string,
  colGroupColumn: string,
  valueColumn: string,
  aggregateFunction: 'sum' | 'avg' | 'count' | 'min' | 'max'
): PivotResult {
  const grouped: { [key: string]: { [key: string]: number[] } } = {};

  // Group data
  data.forEach(row => {
    const rowKey = String(row[rowGroupColumn]);
    const colKey = String(row[colGroupColumn]);
    const value = Number(row[valueColumn]) || 0;

    if (!grouped[rowKey]) grouped[rowKey] = {};
    if (!grouped[rowKey][colKey]) grouped[rowKey][colKey] = [];
    grouped[rowKey][colKey].push(value);
  });

  // Extract unique row and column keys
  const rows = Object.keys(grouped).sort();
  const colSet = new Set<string>();
  Object.values(grouped).forEach(rowData => {
    Object.keys(rowData).forEach(col => colSet.add(col));
  });
  const columns = Array.from(colSet).sort();

  // Aggregate values
  const matrix: (number | null)[][] = rows.map(row => {
    return columns.map(col => {
      const values = grouped[row]?.[col] || [];
      if (values.length === 0) return null;

      switch (aggregateFunction) {
        case 'sum':
          return values.reduce((a, b) => a + b, 0);
        case 'avg':
          return values.reduce((a, b) => a + b, 0) / values.length;
        case 'count':
          return values.length;
        case 'min':
          return Math.min(...values);
        case 'max':
          return Math.max(...values);
      }
    });
  });

  return { rows, columns, data: matrix, aggregateFunction };
}

/**
 * Remove rows with missing values in specified columns
 */
export function removeMissingValues(
  data: DataRow[],
  columns: string[]
): DataRow[] {
  return data.filter(row => {
    return columns.every(col => row[col] !== null && row[col] !== '' && row[col] !== undefined);
  });
}

/**
 * Remove duplicate rows based on specified columns
 */
export function removeDuplicates(
  data: DataRow[],
  columns: string[]
): DataRow[] {
  const seen = new Set<string>();
  return data.filter(row => {
    const key = columns.map(col => String(row[col])).join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Generate automated insights from data
 */
export function generateInsights(
  data: DataRow[],
  numericColumns: string[],
  metadata: any[]
): string[] {
  const insights: string[] = [];

  if (data.length === 0) return insights;

  // Insight 1: Data volume
  insights.push(`📊 Dataset contains ${data.length} records with ${numericColumns.length} numeric metrics`);

  // Insight 2: Outliers
  const outliers = detectOutliers(data, numericColumns);
  if (outliers.length > 0) {
    const percentage = ((outliers.length / data.length) * 100).toFixed(1);
    insights.push(`⚠️ Found ${outliers.length} outliers (${percentage}% of data)`);
  }

  // Insight 3: Correlation
  if (numericColumns.length >= 2) {
    const corrMatrix = calculateCorrelationMatrix(data, numericColumns);
    let maxCorr = 0;
    let maxPair = '';
    for (let i = 0; i < corrMatrix.columns.length; i++) {
      for (let j = i + 1; j < corrMatrix.columns.length; j++) {
        const corr = Math.abs(corrMatrix.matrix[i][j]);
        if (corr > maxCorr) {
          maxCorr = corr;
          maxPair = `${corrMatrix.columns[i]} & ${corrMatrix.columns[j]}`;
        }
      }
    }
    if (maxCorr > 0.7) {
      insights.push(`🔗 Strong correlation detected: ${maxPair} (${(maxCorr * 100).toFixed(0)}%)`);
    }
  }

  // Insight 4: Data quality
  const missingCount = data.filter(row => {
    return numericColumns.some(col => row[col] === null || row[col] === '' || row[col] === undefined);
  }).length;
  if (missingCount > 0) {
    const percentage = ((missingCount / data.length) * 100).toFixed(1);
    insights.push(`🔍 ${missingCount} rows have missing values (${percentage}%)`);
  }

  return insights;
}
