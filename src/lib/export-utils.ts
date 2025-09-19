import html2canvas from 'html2canvas';
import { ExportOptions } from '@/types';

/**
 * Exports a DOM element as PNG using html2canvas
 */
export async function exportElementAsPNG(
  element: HTMLElement,
  filename: string,
  options: {
    width?: number;
    height?: number;
    backgroundColor?: string;
    scale?: number;
  } = {}
): Promise<void> {
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: options.backgroundColor || '#ffffff',
      scale: options.scale || 2, // Higher resolution
      useCORS: true,
      allowTaint: true,
      width: options.width,
      height: options.height,
      logging: false,
      removeContainer: true
    });

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error('Failed to create image blob');
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.png`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
    }, 'image/png', 0.95);

  } catch (error) {
    console.error('Failed to export PNG:', error);
    throw new Error('Failed to export chart as PNG. Please try again.');
  }
}

/**
 * Downloads text content as a file
 */
export function downloadTextFile(content: string, filename: string, mimeType = 'text/plain'): void {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = filename;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download file:', error);
    throw new Error('Failed to download file. Please try again.');
  }
}

/**
 * Exports CSV data
 */
export function exportCSV(csvContent: string, filename: string): void {
  const fullFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  downloadTextFile(csvContent, fullFilename, 'text/csv');
}

/**
 * Prepares element for export by temporarily modifying styles
 */
export function prepareElementForExport(element: HTMLElement): () => void {
  // Store original styles
  const originalStyles = {
    position: element.style.position,
    top: element.style.top,
    left: element.style.left,
    zIndex: element.style.zIndex,
    backgroundColor: element.style.backgroundColor
  };

  // Apply export-friendly styles
  element.style.position = 'relative';
  element.style.top = 'auto';
  element.style.left = 'auto';
  element.style.zIndex = 'auto';
  element.style.backgroundColor = '#ffffff';

  // Return cleanup function
  return () => {
    element.style.position = originalStyles.position;
    element.style.top = originalStyles.top;
    element.style.left = originalStyles.left;
    element.style.zIndex = originalStyles.zIndex;
    element.style.backgroundColor = originalStyles.backgroundColor;
  };
}

/**
 * Exports multiple charts as separate PNG files
 */
export async function exportMultipleCharts(
  chartElements: { element: HTMLElement; name: string }[],
  baseFilename: string
): Promise<void> {
  const exportPromises = chartElements.map(async ({ element, name }) => {
    const filename = `${baseFilename}_${name.toLowerCase().replace(/\s+/g, '_')}`;
    await exportElementAsPNG(element, filename);
  });

  await Promise.all(exportPromises);
}

/**
 * Creates a comprehensive export of all dashboard elements
 */
export async function exportDashboard(
  dashboardElement: HTMLElement,
  filename: string
): Promise<void> {
  await exportElementAsPNG(dashboardElement, filename, {
    backgroundColor: '#f8fafc', // Light gray background
    scale: 1.5 // Good balance between quality and file size
  });
}

/**
 * Validates if an element can be exported
 */
export function validateExportElement(element: HTMLElement | null): boolean {
  if (!element) {
    return false;
  }

  // Check if element is visible
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    return false;
  }

  // Check if element is in the DOM
  if (!document.body.contains(element)) {
    return false;
  }

  return true;
}

/**
 * Gets optimal export dimensions based on element size
 */
export function getOptimalExportDimensions(element: HTMLElement): {
  width: number;
  height: number;
} {
  const rect = element.getBoundingClientRect();
  
  // Ensure minimum dimensions for readability
  const minWidth = 800;
  const minHeight = 600;
  
  return {
    width: Math.max(rect.width, minWidth),
    height: Math.max(rect.height, minHeight)
  };
}

/**
 * Creates export options with defaults
 */
export function createExportOptions(
  overrides: Partial<ExportOptions> = {}
): ExportOptions {
  return {
    format: 'png',
    chartType: 'all',
    filename: `model-cost-analysis_${new Date().toISOString().split('T')[0]}`,
    ...overrides
  };
}

/**
 * Handles export errors with user-friendly messages
 */
export function handleExportError(error: unknown): string {
  console.error('Export error:', error);
  
  if (error instanceof Error) {
    if (error.message.includes('canvas')) {
      return 'Failed to capture chart image. Please ensure the chart is fully loaded and try again.';
    }
    
    if (error.message.includes('blob')) {
      return 'Failed to create download file. Please check your browser permissions and try again.';
    }
    
    return error.message;
  }
  
  return 'An unexpected error occurred during export. Please try again.';
}

/**
 * Checks browser compatibility for export features
 */
export function checkExportCompatibility(): {
  pngExport: boolean;
  csvDownload: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  // Check for html2canvas compatibility
  const pngExport = typeof HTMLCanvasElement !== 'undefined' && 
                   typeof document.createElement === 'function';
  
  if (!pngExport) {
    issues.push('PNG export not supported in this browser');
  }
  
  // Check for download capability
  const csvDownload = typeof Blob !== 'undefined' && 
                     typeof URL !== 'undefined' && 
                     typeof URL.createObjectURL === 'function';
  
  if (!csvDownload) {
    issues.push('File download not supported in this browser');
  }
  
  return {
    pngExport,
    csvDownload,
    issues
  };
}
