import React, { useRef, useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useConfig } from '@/contexts/ConfigContext';
import { useFilter } from '@/contexts/FilterContext';
import { useHistory } from '@/contexts/HistoryContext';
import { generatePDFReport, exportChartAsImage } from '@/lib/reportGenerator';
import { NeoButton, NeoLabel } from '@/components/ui/neo-brutalism';
import { Download, RotateCcw, RotateCw, FileText } from 'lucide-react';

interface ExportPanelProps {
  chartRef?: any;
}

export default function ExportPanel({ chartRef }: ExportPanelProps) {
  const { data, metadata } = useData();
  const { config } = useConfig();
  const { filter } = useFilter();
  const { canUndo, canRedo, undo, redo, history, currentIndex } = useHistory();
  const [reportOptions, setReportOptions] = useState({
    includeStatistics: true,
    includeInsights: true,
    includeDataSummary: true,
  });

  if (!data.length) return null;

  const handleGeneratePDF = () => {
    const chartImage = chartRef ? exportChartAsImage(chartRef) : '';
    
    generatePDFReport(data, config, filter, {
      title: config.title,
      chartImage,
      ...reportOptions,
      metadata,
    });
  };

  const handleUndo = () => {
    const state = undo();
    if (state) {
      // Apply state (this would be handled by parent component)
      console.log('Undo to state:', state);
    }
  };

  const handleRedo = () => {
    const state = redo();
    if (state) {
      // Apply state (this would be handled by parent component)
      console.log('Redo to state:', state);
    }
  };

  return (
    <section className="space-y-3 border-t-2 border-black pt-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="bg-black text-white p-1">
          <Download size={14} />
        </div>
        <h2 className="font-bold font-mono uppercase text-sm">Export & History</h2>
      </div>

      <div className="space-y-3 bg-gray-50 p-3 border-2 border-black">
        {/* Undo/Redo Controls */}
        <div>
          <NeoLabel>History</NeoLabel>
          <div className="flex gap-2 mb-2">
            <NeoButton
              variant={canUndo ? 'primary' : 'secondary'}
              size="sm"
              onClick={handleUndo}
              disabled={!canUndo}
              className="flex-1 justify-center"
            >
              <RotateCcw size={14} className="mr-1" />
              Undo
            </NeoButton>
            <NeoButton
              variant={canRedo ? 'primary' : 'secondary'}
              size="sm"
              onClick={handleRedo}
              disabled={!canRedo}
              className="flex-1 justify-center"
            >
              <RotateCw size={14} className="mr-1" />
              Redo
            </NeoButton>
          </div>
          <div className="text-xs font-mono text-muted-foreground">
            History: {currentIndex + 1} / {history.length}
          </div>
        </div>

        {/* PDF Report Options */}
        <div className="pt-2 border-t border-gray-300 space-y-2">
          <NeoLabel>PDF Report Options</NeoLabel>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="includeStats"
              checked={reportOptions.includeStatistics}
              onChange={(e) => setReportOptions({ ...reportOptions, includeStatistics: e.target.checked })}
              className="w-4 h-4 border-2 border-black rounded-none"
            />
            <label htmlFor="includeStats" className="font-mono text-sm cursor-pointer">
              Include Statistics
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="includeInsights"
              checked={reportOptions.includeInsights}
              onChange={(e) => setReportOptions({ ...reportOptions, includeInsights: e.target.checked })}
              className="w-4 h-4 border-2 border-black rounded-none"
            />
            <label htmlFor="includeInsights" className="font-mono text-sm cursor-pointer">
              Include Insights
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="includeData"
              checked={reportOptions.includeDataSummary}
              onChange={(e) => setReportOptions({ ...reportOptions, includeDataSummary: e.target.checked })}
              className="w-4 h-4 border-2 border-black rounded-none"
            />
            <label htmlFor="includeData" className="font-mono text-sm cursor-pointer">
              Include Data Summary
            </label>
          </div>

          <NeoButton
            variant="primary"
            size="sm"
            onClick={handleGeneratePDF}
            className="w-full justify-center mt-3"
          >
            <FileText size={14} className="mr-1" />
            Generate PDF Report
          </NeoButton>
        </div>

        {/* Quick Export */}
        <div className="pt-2 border-t border-gray-300">
          <NeoLabel>Quick Export</NeoLabel>
          <NeoButton
            variant="secondary"
            size="sm"
            onClick={() => {
              if (chartRef?.toBase64Image) {
                const link = document.createElement('a');
                link.href = chartRef.toBase64Image('image/png', 1.0);
                link.download = `${config.title.replace(/\s+/g, '_')}_${new Date().getTime()}.png`;
                link.click();
              }
            }}
            className="w-full justify-center"
          >
            <Download size={14} className="mr-1" />
            Export Chart as PNG
          </NeoButton>
        </div>
      </div>
    </section>
  );
}
