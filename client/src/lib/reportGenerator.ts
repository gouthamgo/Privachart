import { jsPDF } from 'jspdf';
import { DataRow } from '@/contexts/DataContext';
import { ChartConfig } from '@/contexts/ConfigContext';
import { FilterConfig } from '@/contexts/FilterContext';
import { calculateStatistics } from './dataProcessor';
import { generateInsights } from './analytics';

export interface ReportOptions {
  title: string;
  chartImage: string; // Base64 encoded chart image
  includeStatistics: boolean;
  includeInsights: boolean;
  includeDataSummary: boolean;
  metadata: any[];
}

export function generatePDFReport(
  data: DataRow[],
  config: ChartConfig,
  filter: FilterConfig,
  options: ReportOptions
): void {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Helper function to add text with wrapping
  const addWrappedText = (text: string, fontSize: number, isBold: boolean = false) => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
    const lines = pdf.splitTextToSize(text, contentWidth) as string[];
    lines.forEach((line: string) => {
      if (yPosition + 10 > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(line, margin, yPosition);
      yPosition += 7;
    });
  };

  // Title
  addWrappedText(options.title || config.title, 20, true);
  yPosition += 5;

  // Date
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition);
  yPosition += 10;

  // Chart Image
  if (options.chartImage) {
    if (yPosition + 100 > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }
    try {
      pdf.addImage(options.chartImage, 'PNG', margin, yPosition, contentWidth, 80);
      yPosition += 85;
    } catch (e) {
      console.error('Failed to add chart image to PDF', e);
    }
  }

  yPosition += 5;

  // Data Summary
  if (options.includeDataSummary) {
    addWrappedText('Data Summary', 14, true);
    yPosition += 3;

    const summaryText = `
Total Records: ${data.length}
X-Axis: ${config.xAxisColumn}
Y-Axis: ${config.yAxisColumns.join(', ')}
Chart Type: ${config.type.toUpperCase()}
Row Limit Applied: ${filter.rowLimit < 1000 ? `Yes (${filter.rowLimit})` : 'No'}
Filters Applied: ${filter.filterColumn ? 'Yes' : 'No'}
    `.trim();

    addWrappedText(summaryText, 10);
    yPosition += 5;
  }

  // Statistics
  if (options.includeStatistics && config.yAxisColumns.length > 0) {
    if (yPosition + 40 > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }

    addWrappedText('Statistics', 14, true);
    yPosition += 3;

    config.yAxisColumns.forEach(column => {
      const stats = calculateStatistics(data, column);
      const statsText = `
${column}:
  Min: ${stats.min.toFixed(2)} | Max: ${stats.max.toFixed(2)}
  Average: ${stats.avg.toFixed(2)} | Median: ${stats.median.toFixed(2)}
  Sum: ${stats.sum.toFixed(2)}
      `.trim();

      addWrappedText(statsText, 9);
      yPosition += 2;
    });

    yPosition += 3;
  }

  // Insights
  if (options.includeInsights) {
    if (yPosition + 30 > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }

    const numericColumns = options.metadata
      .filter((m: any) => m.type === 'number')
      .map((m: any) => m.name);

    const insights = generateInsights(data, numericColumns, options.metadata);

    if (insights.length > 0) {
      addWrappedText('Key Insights', 14, true);
      yPosition += 3;

      insights.forEach(insight => {
        addWrappedText(`• ${insight}`, 9);
        yPosition += 2;
      });
    }
  }

  // Footer
  const totalPages = pdf.internal.pages.length;
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Download PDF
  const filename = `${config.title.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
  pdf.save(filename);
}

export function exportChartAsImage(chartRef: any): string {
  if (chartRef?.toBase64Image) {
    return chartRef.toBase64Image('image/png', 1.0);
  }
  return '';
}
