import React, { useMemo, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
  ChartData,
  ChartOptions,
  BarController,
  LineController,
  PieController,
  DoughnutController,
  ScatterController,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { useData } from '@/contexts/DataContext';
import { useConfig } from '@/contexts/ConfigContext';
import { useFilter } from '@/contexts/FilterContext';
import { processData, calculateStatistics } from '@/lib/dataProcessor';
import { NeoButton } from '@/components/ui/neo-brutalism';

ChartJS.register(
  BarController,
  LineController,
  PieController,
  DoughnutController,
  ScatterController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

interface ChartRendererProps {
  chartRef?: React.RefObject<ChartJS>;
}

export default function ChartRenderer({ chartRef: externalRef }: ChartRendererProps) {
  const { data: rawData, metadata } = useData();
  const { config } = useConfig();
  const { filter } = useFilter();
  const internalRef = useRef<ChartJS>(null);
  const chartRef = externalRef || internalRef;

  const numericColumns = metadata
    .filter(m => m.type === 'number')
    .map(m => m.name);

  const { data } = useMemo(() => {
    return processData(rawData, filter, numericColumns);
  }, [rawData, filter, numericColumns]);

  const chartData = useMemo<ChartData>(() => {
    if (!data.length || !config.xAxisColumn) {
      return { labels: [], datasets: [] };
    }

    const isPieChart = config.type === 'pie' || config.type === 'doughnut';

    if (isPieChart) {
      if (config.yAxisColumns.length === 0) {
        return { labels: [], datasets: [] };
      }

      const labels = data.map(row => String(row[config.xAxisColumn]));
      const values = data.map(row => {
        const val = row[config.yAxisColumns[0]];
        const num = Number(val);
        return isNaN(num) ? 0 : num;
      });

      return {
        labels,
        datasets: [
          {
            label: config.yAxisColumns[0],
            data: values,
            backgroundColor: config.colors.map(color => `${color}E6`),
            borderColor: config.colors,
            borderWidth: 2,
          }
        ]
      };
    }

    const labels = data.map(row => String(row[config.xAxisColumn]));

    const datasets = config.yAxisColumns.map((col, index) => {
      const color = config.colors[index % config.colors.length];

      return {
        label: col,
        data: data.map(row => {
          const val = row[col];
          const num = Number(val);
          return isNaN(num) ? 0 : num;
        }),
        backgroundColor: config.type === 'line' || config.type === 'scatter' ? color : `${color}E6`,
        borderColor: color,
        borderWidth: 2,
        tension: config.tension,
        fill: config.type === 'area',
        pointBackgroundColor: '#ffffff',
        pointBorderColor: color,
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      };
    });

    return { labels, datasets };
  }, [data, config, filter, numericColumns]);

  const options = useMemo<ChartOptions>(() => {
    const isPieChart = config.type === 'pie' || config.type === 'doughnut';

    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 400,
        easing: 'easeOutQuart',
      },
      plugins: {
        legend: {
          display: config.showLegend,
          position: isPieChart ? 'right' : ('top' as const),
          labels: {
            font: {
              family: 'Instrument Sans',
              size: 12,
              weight: 500
            },
            color: '#0f0f0f',
            usePointStyle: true,
            pointStyle: 'rectRounded',
            padding: 20,
            boxWidth: 8,
            boxHeight: 8,
          }
        },
        title: {
          display: !!config.title,
          text: config.title,
          font: {
            family: 'Syne',
            size: 20,
            weight: 700
          },
          color: '#0f0f0f',
          padding: {
            top: 10,
            bottom: 30
          }
        },
        tooltip: {
          backgroundColor: '#0f0f0f',
          titleFont: {
            family: 'Syne',
            size: 13,
            weight: 600
          },
          bodyFont: {
            family: 'Instrument Sans',
            size: 12,
          },
          padding: 12,
          cornerRadius: 0,
          displayColors: true,
          boxWidth: 8,
          boxHeight: 8,
          boxPadding: 4,
        }
      },
      scales: isPieChart ? {} : {
        x: {
          display: true,
          grid: {
            display: config.showGrid,
            color: '#e8e6e3',
            lineWidth: 1,
          },
          ticks: {
            font: {
              family: 'Instrument Sans',
              size: 11,
            },
            color: '#6b6965',
            padding: 8,
          },
          border: {
            color: '#0f0f0f',
            width: 2
          }
        },
        y: {
          display: true,
          grid: {
            display: config.showGrid,
            color: '#e8e6e3',
            lineWidth: 1,
          },
          ticks: {
            font: {
              family: 'Instrument Sans',
              size: 11,
            },
            color: '#6b6965',
            padding: 8,
          },
          border: {
            color: '#0f0f0f',
            width: 2
          },
          stacked: config.isStacked,
        }
      },
      elements: {
        bar: {
          borderWidth: 2,
          borderRadius: 0,
        },
        arc: {
          borderWidth: 2,
          borderColor: '#ffffff',
        },
        line: {
          borderWidth: 3,
        },
        point: {
          hitRadius: 8,
        }
      }
    };
  }, [config]);

  const handleDownload = () => {
    if (!chartRef.current) return;

    const link = document.createElement('a');
    link.download = `privachart-${Date.now()}.png`;
    link.href = chartRef.current.toBase64Image('image/png', 1.0);
    link.click();
  };

  // Empty state - No data loaded
  if (!rawData.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8 text-center">
        <div className="relative mb-8">
          {/* Custom illustration - abstract data flow */}
          <div className="w-24 h-24 border-2 border-border bg-secondary flex items-center justify-center neo-shadow-sm">
            <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none">
              {/* Incoming arrow */}
              <path d="M8 24 L18 24" stroke="currentColor" strokeWidth="2" className="text-muted-foreground" />
              <path d="M14 20 L18 24 L14 28" stroke="currentColor" strokeWidth="2" fill="none" className="text-muted-foreground" />
              {/* Center box */}
              <rect x="20" y="16" width="16" height="16" fill="currentColor" className="text-primary" opacity="0.2" />
              <rect x="20" y="16" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" className="text-primary" />
              {/* Data bars inside */}
              <rect x="23" y="26" width="3" height="4" fill="currentColor" className="text-primary" />
              <rect x="27" y="22" width="3" height="8" fill="currentColor" className="text-primary" />
              <rect x="31" y="24" width="3" height="6" fill="currentColor" className="text-primary" />
            </svg>
          </div>
          {/* Decorative corner accent */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary" />
        </div>
        <h2 className="text-xl font-bold mb-2">No Data Loaded</h2>
        <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
          Upload a CSV file or load sample data from the sidebar to start visualizing.
        </p>
        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 bg-primary" />
          <span>Supports CSV files up to 10MB</span>
        </div>
      </div>
    );
  }

  // Empty state - Need to configure axes
  if (!config.xAxisColumn || config.yAxisColumns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8 text-center">
        <div className="relative mb-8">
          {/* Custom illustration - axis configuration */}
          <div className="w-24 h-24 border-2 border-border bg-secondary flex items-center justify-center neo-shadow-sm">
            <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none">
              {/* Y axis */}
              <path d="M12 36 L12 12" stroke="currentColor" strokeWidth="2" className="text-muted-foreground" />
              <path d="M8 16 L12 12 L16 16" stroke="currentColor" strokeWidth="2" fill="none" className="text-muted-foreground" />
              {/* X axis */}
              <path d="M12 36 L36 36" stroke="currentColor" strokeWidth="2" className="text-muted-foreground" />
              <path d="M32 32 L36 36 L32 40" stroke="currentColor" strokeWidth="2" fill="none" className="text-muted-foreground" />
              {/* Dashed placeholder bars */}
              <rect x="18" y="24" width="6" height="12" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" fill="none" className="text-primary" opacity="0.5" />
              <rect x="26" y="18" width="6" height="18" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" fill="none" className="text-primary" opacity="0.5" />
            </svg>
          </div>
          {/* Decorative corner accent */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent" />
        </div>
        <h2 className="text-xl font-bold mb-2">Configure Your Chart</h2>
        <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
          Select X and Y axis columns from the Data Mapping section in the sidebar.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
          <div className={`px-3 py-2.5 border-2 transition-colors ${config.xAxisColumn ? 'border-green-600 bg-green-50 text-green-700' : 'border-border bg-secondary text-muted-foreground'}`}>
            <span className="font-semibold block">X Axis</span>
            <span className="mt-0.5 block truncate">{config.xAxisColumn || 'Not set'}</span>
          </div>
          <div className={`px-3 py-2.5 border-2 transition-colors ${config.yAxisColumns.length > 0 ? 'border-green-600 bg-green-50 text-green-700' : 'border-border bg-secondary text-muted-foreground'}`}>
            <span className="font-semibold block">Y Axis</span>
            <span className="mt-0.5 block truncate">{config.yAxisColumns.length > 0 ? `${config.yAxisColumns.length} selected` : 'Not set'}</span>
          </div>
        </div>
      </div>
    );
  }

  const getChartType = () => {
    if (config.type === 'area') return 'line';
    return config.type;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chart Area */}
      <div className="flex-1 min-h-0 relative p-6 overflow-hidden">
        <Chart
          ref={chartRef}
          type={getChartType() as any}
          data={chartData}
          options={options}
        />
      </div>

      {/* Footer Bar */}
      <div className="h-14 border-t-2 border-border flex items-center justify-between px-5 bg-secondary/30">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="font-medium">{data.length} rows</span>
          <span className="text-border">|</span>
          <span>{config.yAxisColumns.length} series</span>
        </div>
        <NeoButton size="sm" variant="secondary" onClick={handleDownload}>
          <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v10M12 15l-4-4M12 15l4-4" />
            <path d="M5 19h14" strokeLinecap="square" />
          </svg>
          Export PNG
        </NeoButton>
      </div>
    </div>
  );
}
