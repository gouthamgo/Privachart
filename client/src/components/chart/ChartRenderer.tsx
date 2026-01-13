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
import { Download } from 'lucide-react';

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

    // Calculate statistics for display
    const stats = config.yAxisColumns.length > 0
      ? calculateStatistics(data, config.yAxisColumns[0])
      : null;

    const isPieChart = config.type === 'pie' || config.type === 'doughnut';

    if (isPieChart) {
      // For pie/doughnut charts: use X axis as labels and first Y column as data
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
            backgroundColor: config.colors.map(color => `${color}CC`),
            borderColor: config.colors,
            borderWidth: 2,
          }
        ]
      };
    }

    // For other chart types
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
        backgroundColor: config.type === 'line' || config.type === 'scatter' ? color : `${color}CC`,
        borderColor: color,
        borderWidth: 2,
        tension: config.tension,
        fill: config.type === 'area',
        pointBackgroundColor: '#FFFFFF',
        pointBorderColor: color,
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      };
    });

    return { labels, datasets };
  }, [data, config, filter, numericColumns]);

  const options = useMemo<ChartOptions>(() => {
    const isPieChart = config.type === 'pie' || config.type === 'doughnut';

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: config.showLegend,
          position: isPieChart ? 'right' : ('top' as const),
          labels: {
            font: {
              family: 'JetBrains Mono',
              size: 12
            },
            color: '#1a1a1a',
            usePointStyle: true,
            pointStyle: 'rect',
            padding: 15,
            maxWidth: 200,
          }
        },
        title: {
          display: !!config.title,
          text: config.title,
          font: {
            family: 'JetBrains Mono',
            size: 18,
            weight: 'bold'
          },
          color: '#1a1a1a',
          padding: {
            top: 10,
            bottom: 20
          }
        },
        tooltip: {
          backgroundColor: '#1a1a1a',
          titleFont: {
            family: 'JetBrains Mono',
          },
          bodyFont: {
            family: 'Inter',
          },
          padding: 10,
          cornerRadius: 0,
          displayColors: true,
        }
      },
      scales: isPieChart ? {} : {
        x: {
          display: true,
          grid: {
            display: config.showGrid,
            color: '#e5e5e5',
          },
          ticks: {
            font: {
              family: 'Inter',
            },
            color: '#666666',
          },
          border: {
            color: '#1a1a1a',
            width: 2
          }
        },
        y: {
          display: true,
          grid: {
            display: config.showGrid,
            color: '#e5e5e5',
          },
          ticks: {
            font: {
              family: 'Inter',
            },
            color: '#666666',
          },
          border: {
            color: '#1a1a1a',
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
        }
      }
    };
  }, [config]);

  const handleDownload = () => {
    if (!chartRef.current) return;
    
    const link = document.createElement('a');
    link.download = `privachart-export.png`;
    link.href = chartRef.current.toBase64Image('image/png', 1.0);
    link.click();
  };

  if (!rawData.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground font-mono">
        <div className="text-4xl mb-4 opacity-20">📊</div>
        <p>No data loaded</p>
        <p className="text-sm mt-2">Upload a CSV file to get started</p>
      </div>
    );
  }

  if (!config.xAxisColumn || config.yAxisColumns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground font-mono">
        <div className="text-4xl mb-4 opacity-20">⚙️</div>
        <p>Configure axes</p>
        <p className="text-sm mt-2">Select X and Y columns in the sidebar</p>
      </div>
    );
  }

  const getChartType = () => {
    if (config.type === 'area') return 'line';
    return config.type;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0 relative p-4 overflow-hidden">
        <Chart
          ref={chartRef}
          type={getChartType() as any}
          data={chartData}
          options={options}
        />
      </div>
      
      <div className="h-16 border-t-2 border-black flex items-center justify-end px-4 gap-2 bg-gray-50">
        <NeoButton size="sm" variant="secondary" onClick={handleDownload}>
          <Download className="w-4 h-4 mr-2" />
          Export PNG
        </NeoButton>
      </div>
    </div>
  );
}
