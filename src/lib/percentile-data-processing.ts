import Papa from 'papaparse';
import { PercentileDataRow } from '@/types';

/**
 * Parses Percentile CSV data and returns structured data
 */
export function parsePercentileCSV(csvContent: string): Promise<PercentileDataRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(csvContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`));
          return;
        }

        // Validate required columns (support both original column names and simplified names)
        const requiredColumns = ['csrv90q_number_interactions', 'cszi4l6_number_percentile'];
        const hasRequiredColumns = results.data.length > 0 && 
          requiredColumns.every(col => col in (results.data[0] as Record<string, unknown>));

        if (!hasRequiredColumns) {
          reject(new Error(`CSV must contain columns: ${requiredColumns.join(', ')}`));
          return;
        }

        // Filter out invalid rows and transform data
        const validData = results.data
          .filter((row): row is Record<string, unknown> => {
            return Boolean(
              row &&
              typeof (row as Record<string, unknown>).csrv90q_number_interactions === 'number' &&
              typeof (row as Record<string, unknown>).cszi4l6_number_percentile === 'number' &&
              !isNaN((row as Record<string, unknown>).csrv90q_number_interactions as number) &&
              !isNaN((row as Record<string, unknown>).cszi4l6_number_percentile as number)
            );
          })
          .map(row => ({
            percentile: row.cszi4l6_number_percentile as number,
            interactions: row.csrv90q_number_interactions as number
          }))
          .sort((a, b) => a.percentile - b.percentile);

        resolve(validData);
      },
      error: (error: Error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      }
    });
  });
}

/**
 * Processes raw Percentile data into formatted data for chart display
 */
export function processPercentileData(rawData: PercentileDataRow[]): PercentileDataRow[] {
  return rawData
    .filter(row => {
      return (
        row &&
        typeof row.percentile === 'number' &&
        typeof row.interactions === 'number' &&
        !isNaN(row.percentile) &&
        !isNaN(row.interactions) &&
        row.percentile >= 0 &&
        row.percentile <= 100 &&
        row.interactions >= 0
      );
    })
    .sort((a, b) => a.percentile - b.percentile);
}

/**
 * Validates Percentile CSV file format
 */
export function validatePercentileCSVFormat(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content.split('\n');
        
        if (lines.length < 2) {
          resolve(false);
          return;
        }

        const header = lines[0].toLowerCase();
        const requiredColumns = ['csrv90q_number_interactions', 'cszi4l6_number_percentile'];
        const hasRequiredColumns = requiredColumns.every(col => 
          header.includes(col.replace('_', '')) || header.includes(col)
        );

        resolve(hasRequiredColumns);
      } catch {
        resolve(false);
      }
    };

    reader.onerror = () => resolve(false);
    reader.readAsText(file.slice(0, 1000)); // Read first 1KB to check format
  });
}

