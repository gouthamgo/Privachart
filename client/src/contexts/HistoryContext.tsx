import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { ChartConfig } from './ConfigContext';
import { FilterConfig } from './FilterContext';

export interface AnalysisState {
  config: ChartConfig;
  filter: FilterConfig;
  timestamp: number;
  description: string;
}

interface HistoryContextType {
  history: AnalysisState[];
  currentIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  addState: (state: AnalysisState) => void;
  undo: () => AnalysisState | null;
  redo: () => AnalysisState | null;
  clear: () => void;
  getHistory: () => AnalysisState[];
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

const MAX_HISTORY = 50; // Limit history to prevent memory issues

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<AnalysisState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const addState = useCallback((state: AnalysisState) => {
    setHistory(prev => {
      // Remove any "future" states if we're not at the end
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push(state);
      
      // Limit history size
      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift();
      }
      
      return newHistory;
    });
    
    setCurrentIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [currentIndex]);

  const undo = useCallback((): AnalysisState | null => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      return history[newIndex];
    }
    return null;
  }, [currentIndex, history]);

  const redo = useCallback((): AnalysisState | null => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      return history[newIndex];
    }
    return null;
  }, [currentIndex, history]);

  const clear = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
  }, []);

  const getHistory = useCallback(() => history, [history]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return (
    <HistoryContext.Provider
      value={{
        history,
        currentIndex,
        canUndo,
        canRedo,
        addState,
        undo,
        redo,
        clear,
        getHistory,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
}
