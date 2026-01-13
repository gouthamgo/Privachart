import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface FilterConfig {
  rowLimit: number;
  sortBy: 'none' | 'ascending' | 'descending';
  sortColumn: string | null;
  aggregateBy: string | null; // Column to group by
  aggregateFunction: 'sum' | 'avg' | 'count' | 'min' | 'max';
  filterColumn: string | null;
  filterValue: string;
  filterOperator: '=' | '>' | '<' | '>=' | '<=' | 'contains';
}

interface FilterContextType {
  filter: FilterConfig;
  updateFilter: (partial: Partial<FilterConfig>) => void;
  resetFilter: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

const DEFAULT_FILTER: FilterConfig = {
  rowLimit: 100,
  sortBy: 'none',
  sortColumn: null,
  aggregateBy: null,
  aggregateFunction: 'sum',
  filterColumn: null,
  filterValue: '',
  filterOperator: '=',
};

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filter, setFilter] = useState<FilterConfig>(DEFAULT_FILTER);

  const updateFilter = (partial: Partial<FilterConfig>) => {
    setFilter(prev => ({ ...prev, ...partial }));
  };

  const resetFilter = () => {
    setFilter(DEFAULT_FILTER);
  };

  return (
    <FilterContext.Provider value={{ filter, updateFilter, resetFilter }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
}
