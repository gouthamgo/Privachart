import React, { useRef, useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { NeoButton } from '@/components/ui/neo-brutalism';
import { Upload, FileText } from 'lucide-react';

export default function DataInput() {
  const { loadData, loadSampleData, fileName, isLoading, error } = useData();
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
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed p-6 text-center cursor-pointer transition-all
          ${isDragActive 
            ? 'border-primary bg-blue-50 neo-shadow' 
            : 'border-black bg-white hover:bg-gray-50'}
        `}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center gap-2">
          <Upload className="w-8 h-8 text-primary" />
          <div className="font-mono text-sm">
            <p className="font-bold">Drop CSV here</p>
            <p className="text-xs text-muted-foreground">or click to browse</p>
          </div>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv"
        className="hidden"
      />

      <NeoButton 
        className="w-full justify-center" 
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
      >
        <Upload className="w-4 h-4 mr-2" />
        {isLoading ? 'Loading...' : 'Upload CSV'}
      </NeoButton>
      
      <NeoButton 
        variant="secondary" 
        className="w-full justify-center text-xs"
        onClick={loadSampleData}
        disabled={isLoading}
      >
        Load Sample Data
      </NeoButton>

      {fileName && (
        <div className="text-xs font-mono p-3 bg-green-100 border-2 border-green-800 text-green-900 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          <span className="truncate">{fileName}</span>
        </div>
      )}
      
      {error && (
        <div className="text-xs font-mono p-3 bg-red-100 border-2 border-red-800 text-red-900">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}
