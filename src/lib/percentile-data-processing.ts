import Papa from 'papaparse';
import { PercentileDataRow } from '@/types';
import { createFlexibleColumnMapping } from './csv-utils';

/**
 * Parses Percentile CSV data and returns structured data
 */
export function parsePercentileCSV(csvContent: string): Promise<PercentileDataRow[]> {
  return new Promise((resolve, reject) => {
    // First, get the header to create column mapping
    const lines = csvContent.split('\n');
    if (lines.length < 2) {
      reject(new Error('CSV file is empty or invalid'));
      return;
    }

    // Try to match columns ending with 'interactions' and 'percentile'
    const requiredColumns = ['interactions', 'percentile'];
    const actualColumns = lines[0].split(',').map(col => col.trim());
    const { mapping, missingColumns } = createFlexibleColumnMapping(requiredColumns, actualColumns);

    if (missingColumns.length > 0) {
      reject(new Error(`CSV must contain columns ending with: ${missingColumns.join(', ')}`));
      return;
    }

    Papa.parse(csvContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => {
        // Map actual column names to expected names
        return mapping[header] || header;
      },
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`));
          return;
        }

        // Filter out invalid rows and transform data
        const validData = results.data
          .filter((row): row is Record<string, unknown> => {
            return Boolean(
              row &&
              typeof (row as Record<string, unknown>).interactions === 'number' &&
              typeof (row as Record<string, unknown>).percentile === 'number' &&
              !isNaN((row as Record<string, unknown>).interactions as number) &&
              !isNaN((row as Record<string, unknown>).percentile as number)
            );
          })
          .map(row => ({
            percentile: row.percentile as number,
            interactions: row.interactions as number
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

        const requiredColumns = ['interactions', 'percentile'];
        const actualColumns = lines[0].split(',').map(col => col.trim());
        const { missingColumns } = createFlexibleColumnMapping(requiredColumns, actualColumns);

        resolve(missingColumns.length === 0);
      } catch {
        resolve(false);
      }
    };

    reader.onerror = () => resolve(false);
    reader.readAsText(file.slice(0, 1000)); // Read first 1KB to check format
  });
}

