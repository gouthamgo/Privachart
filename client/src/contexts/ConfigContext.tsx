import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ChartType = 'bar' | 'line' | 'pie' | 'doughnut' | 'scatter' | 'area';

export interface ChartConfig {
  type: ChartType;
  title: string;
  xAxisColumn: string;
  yAxisColumns: string[];
  groupByColumn?: string; // For stacked or grouped charts
  colors: string[];
  showLegend: boolean;
  showGrid: boolean;
  isStacked: boolean;
  tension: number; // For line charts (0 = straight, 0.4 = smooth)
  showTrendline: boolean;
  showAverage: boolean;
  showMedian: boolean;
}

interface ConfigContextType {
  config: ChartConfig;
  updateConfig: (updates: Partial<ChartConfig>) => void;
  resetConfig: () => void;
}

const defaultConfig: ChartConfig = {
  type: 'bar',
  title: 'My Chart',
  xAxisColumn: '',
  yAxisColumns: [],
  colors: ['#0055FF', '#FF4400', '#00CC66', '#FFCC00', '#9900FF'],
  showLegend: true,
  showGrid: true,
  isStacked: false,
  tension: 0.1,
  showTrendline: false,
  showAverage: false,
  showMedian: false,
};

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ChartConfig>(defaultConfig);

  const updateConfig = (updates: Partial<ChartConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const resetConfig = () => {
    setConfig(defaultConfig);
  };

  return (
    <ConfigContext.Provider value={{ config, updateConfig, resetConfig }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}
