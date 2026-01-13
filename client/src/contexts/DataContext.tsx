import React, { createContext, useContext, useState, ReactNode } from 'react';
import Papa from 'papaparse';

export interface DataRow {
  [key: string]: string | number | boolean | null;
}

export interface ColumnMetadata {
  name: string;
  type: 'number' | 'string' | 'date' | 'boolean';
  uniqueValues: number;
  hasMissing: boolean;
}

interface DataContextType {
  data: DataRow[];
  columns: string[];
  metadata: ColumnMetadata[];
  fileName: string | null;
  isLoading: boolean;
  error: string | null;
  loadData: (file: File) => void;
  loadSampleData: () => void;
  resetData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DataRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [metadata, setMetadata] = useState<ColumnMetadata[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeColumns = (rows: DataRow[], cols: string[]): ColumnMetadata[] => {
    return cols.map(col => {
      const values = rows.map(row => row[col]);
      const nonNullValues = values.filter(v => v !== null && v !== '' && v !== undefined);
      
      if (nonNullValues.length === 0) {
        return {
          name: col,
          type: 'string',
          uniqueValues: 0,
          hasMissing: true
        };
      }

      // Improved numeric detection: check if at least 80% of non-null values are numeric
      const numericCount = nonNullValues.filter(v => {
        const str = String(v).trim();
        return str !== '' && !isNaN(Number(str));
      }).length;
      
      const numericRatio = numericCount / nonNullValues.length;
      
      let type: 'number' | 'string' | 'date' | 'boolean' = 'string';
      
      // If 80%+ of values are numeric, treat as number
      if (numericRatio >= 0.8) {
        type = 'number';
      } else {
        // Check for date if not number (simplified)
        const dateCount = nonNullValues.filter(v => {
          const time = Date.parse(String(v));
          return !isNaN(time);
        }).length;
        
        const dateRatio = dateCount / nonNullValues.length;
        if (dateRatio >= 0.8) {
          type = 'date';
        }
      }

      return {
        name: col,
        type,
        uniqueValues: new Set(values).size,
        hasMissing: values.length !== rows.length
      };
    });
  };

  const loadData = (file: File) => {
    setIsLoading(true);
    setError(null);
    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      dynamicTyping: false, // Keep as strings initially for better type detection
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn('CSV Parsing errors:', results.errors);
        }
        
        const rows = results.data as DataRow[];
        if (rows.length === 0) {
          setError('The file appears to be empty.');
          setIsLoading(false);
          return;
        }

        const cols = results.meta.fields || Object.keys(rows[0]);
        
        setData(rows);
        setColumns(cols);
        setMetadata(analyzeColumns(rows, cols));
        setIsLoading(false);
      },
      error: (err) => {
        setError(`Failed to parse CSV: ${err.message}`);
        setIsLoading(false);
      }
    });
  };

  const loadSampleData = () => {
    setIsLoading(true);
    setError(null);
    setFileName('sample_sales_data.csv');

    // Simulate async load
    setTimeout(() => {
      const sampleData = [
        { Month: 'Jan', Sales: '1200', Profit: '400', Region: 'North' },
        { Month: 'Feb', Sales: '1900', Profit: '650', Region: 'North' },
        { Month: 'Mar', Sales: '1500', Profit: '500', Region: 'North' },
        { Month: 'Apr', Sales: '2200', Profit: '800', Region: 'North' },
        { Month: 'May', Sales: '2800', Profit: '1100', Region: 'North' },
        { Month: 'Jun', Sales: '2400', Profit: '950', Region: 'North' },
        { Month: 'Jan', Sales: '1100', Profit: '300', Region: 'South' },
        { Month: 'Feb', Sales: '1700', Profit: '550', Region: 'South' },
        { Month: 'Mar', Sales: '1400', Profit: '450', Region: 'South' },
        { Month: 'Apr', Sales: '2100', Profit: '750', Region: 'South' },
        { Month: 'May', Sales: '2600', Profit: '1000', Region: 'South' },
        { Month: 'Jun', Sales: '2300', Profit: '900', Region: 'South' },
      ];
      
      const cols = Object.keys(sampleData[0]);
      setData(sampleData);
      setColumns(cols);
      setMetadata(analyzeColumns(sampleData, cols));
      setIsLoading(false);
    }, 500);
  };

  const resetData = () => {
    setData([]);
    setColumns([]);
    setMetadata([]);
    setFileName(null);
    setError(null);
  };

  return (
    <DataContext.Provider value={{ 
      data, columns, metadata, fileName, isLoading, error, 
      loadData, loadSampleData, resetData 
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
