import React, { useRef, useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useConfig } from '@/contexts/ConfigContext';
import { useFilter } from '@/contexts/FilterContext';
import { NeoButton } from '@/components/ui/neo-brutalism';
import { AlertCircle } from 'lucide-react';

export default function DataInput() {
  const { loadData, loadSampleData, resetData, fileName, isLoading, error, data } = useData();
  const { resetConfig } = useConfig();
  const { resetFilter } = useFilter();

  const handleReset = () => {
    resetData();
    resetConfig();
    resetFilter();
  };
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      loadData(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.csv')) {
        loadData(file);
      } else {
        alert('Please drop a CSV file');
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          group relative border-2 border-dashed p-5 text-center cursor-pointer transition-all duration-200
          ${isDragActive
            ? 'border-primary bg-primary/5 scale-[1.02]'
            : 'border-border bg-card hover:border-primary/50 hover:bg-secondary/50'}
        `}
      >
        <div className="flex flex-col items-center gap-3">
          <div className={`
            w-12 h-12 border-2 border-border flex items-center justify-center transition-all duration-200
            ${isDragActive ? 'bg-primary border-primary scale-110' : 'bg-secondary group-hover:bg-primary group-hover:border-primary'}
          `}>
            {/* Custom upload arrow icon */}
            <svg viewBox="0 0 24 24" className={`w-5 h-5 transition-colors ${isDragActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-primary-foreground'}`} fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 19V5M12 5l-5 5M12 5l5 5" />
              <path d="M5 19h14" strokeLinecap="square" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-sm">Drop CSV here</p>
            <p className="text-xs text-muted-foreground mt-0.5">or click to browse</p>
          </div>
        </div>

        {/* Decorative corner */}
        <div className={`absolute -top-[2px] -right-[2px] w-3 h-3 transition-colors ${isDragActive ? 'bg-primary' : 'bg-border group-hover:bg-primary'}`} />
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv"
        className="hidden"
      />

      {/* Upload Button */}
      <NeoButton
        className="w-full justify-center"
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 17V7M12 7l-4 4M12 7l4 4" />
        </svg>
        {isLoading ? 'Loading...' : 'Upload CSV'}
      </NeoButton>

      {/* Sample Data Button */}
      <NeoButton
        variant="secondary"
        className="w-full justify-center"
        onClick={loadSampleData}
        disabled={isLoading}
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="4" width="6" height="6" />
          <rect x="14" y="4" width="6" height="6" />
          <rect x="4" y="14" width="6" height="6" />
          <rect x="14" y="14" width="6" height="6" />
        </svg>
        Load Sample Data
      </NeoButton>

      {/* File Name Display + Reset */}
      {fileName && data.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 p-3 bg-green-50 border-2 border-green-600 text-green-800">
            <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <path d="M14 2v6h6M8 13h8M8 17h8" />
            </svg>
            <span className="text-xs font-medium truncate flex-1">{fileName}</span>
            <span className="text-[10px] opacity-70">{data.length} rows</span>
          </div>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 p-2 text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-red-50 border-2 border-dashed border-border hover:border-destructive transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
            </svg>
            Clear Data & Start Over
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="flex items-start gap-2.5 p-3 bg-red-50 border-2 border-red-600 text-red-800">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="text-xs">{error}</span>
        </div>
      )}
    </div>
  );
}
