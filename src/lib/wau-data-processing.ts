import Papa from 'papaparse';
import { format, startOfMonth, isWithinInterval, parseISO, startOfWeek, endOfWeek } from 'date-fns';
import { 
  WAURawDataRow, 
  WAUProcessedDataRow, 
  WAUMoMData, 
  WAUWoWData,
  WAUFilterConfig, 
  DateRange
} from '@/types';
import { createFlexibleColumnMapping } from './csv-utils';

/**
 * Parses WAU CSV data and returns structured data
 */
export function parseWAUCSVData(csvContent: string): Promise<WAURawDataRow[]> {
  return new Promise((resolve, reject) => {
    // First, get the header to create column mapping
    const lines = csvContent.split('\n');
    if (lines.length < 2) {
      reject(new Error('CSV file is empty or invalid'));
      return;
    }

    const requiredColumns = ['week', 'weekly_usage', 'weekly_tabs', 'wau_count', 'requestsper'];
    const actualColumns = lines[0].split(',').map(col => col.trim());
    const { mapping, missingColumns } = createFlexibleColumnMapping(requiredColumns, actualColumns);

    if (missingColumns.length > 0) {
      reject(new Error(`CSV must contain columns: ${missingColumns.join(', ')}`));
      return;
    }

    Papa.parse<WAURawDataRow>(csvContent, {
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

        // Filter out invalid rows
        const validData = results.data.filter((row): row is WAURawDataRow => {
          return (
            row &&
            typeof row.week === 'string' &&
            typeof row.weekly_usage === 'number' &&
            typeof row.weekly_tabs === 'number' &&
            typeof row.wau_count === 'number' &&
            typeof row.requestsper === 'number' &&
            !isNaN(row.weekly_usage) &&
            !isNaN(row.weekly_tabs) &&
            !isNaN(row.wau_count) &&
            !isNaN(row.requestsper)
          );
        });

        resolve(validData);
      },
      error: (error: Error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      }
    });
  });
}

/**
 * Processes raw WAU data into filtered and formatted data
 */
export function processWAUData(
  rawData: WAURawDataRow[], 
  filterConfig: WAUFilterConfig
): WAUProcessedDataRow[] {
  return rawData
    .filter(row => {
      // Apply date range filter
      if (filterConfig.dateRange) {
        try {
          const rowDate = parseISO(row.week);
          if (!isWithinInterval(rowDate, { start: filterConfig.dateRange.from, end: filterConfig.dateRange.to })) {
            return false;
          }
        } catch {
          console.warn(`Invalid date format: ${row.week}`);
          return false;
        }
      }

      return true;
    })
    .map(row => ({
      week: row.week,
      weekDisplay: formatWeekDisplay(row.week),
      weeklyUsage: row.weekly_usage,
      weeklyTabs: row.weekly_tabs,
      wauCount: row.wau_count,
      requestsPer: row.requestsper
    }));
}

/**
 * Aggregates WAU data by month for MoM view
 */
export function aggregateWAUMoM(processedData: WAUProcessedDataRow[]): WAUMoMData[] {
  if (processedData.length === 0) {
    return [];
  }

  // Group data by month
  const dataByMonth = processedData.reduce((acc, row) => {
    const date = parseISO(row.week);
    const monthKey = format(startOfMonth(date), 'yyyy-MM-01');
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        weeks: [],
        totalUsage: 0,
        totalTabs: 0,
        totalWAU: 0
      };
    }

    acc[monthKey].weeks.push(row);
    acc[monthKey].totalUsage += row.weeklyUsage;
    acc[monthKey].totalTabs += row.weeklyTabs;
    acc[monthKey].totalWAU += row.wauCount;

    return acc;
  }, {} as Record<string, {
    weeks: WAUProcessedDataRow[];
    totalUsage: number;
    totalTabs: number;
    totalWAU: number;
  }>);

  // Convert to MoM data format
  const result = Object.entries(dataByMonth)
    .map(([monthKey, data]) => {
      const date = parseISO(monthKey);
      return {
        month: monthKey,
        monthDisplay: format(date, 'MMM-yy'),
        averageWAU: data.totalWAU / data.weeks.length,
        totalWeeks: data.weeks.length,
        totalUsage: data.totalUsage,
        totalTabs: data.totalTabs
      };
    })
    .sort((a, b) => a.month.localeCompare(b.month));

  return result;
}

/**
 * Prepares WAU data for WoW view with month labels
 */
export function aggregateWAUWoW(processedData: WAUProcessedDataRow[]): WAUWoWData[] {
  if (processedData.length === 0) {
    return [];
  }

  return processedData
    .map(row => {
      const date = parseISO(row.week);
      const monthLabel = format(date, 'MMM');
      
      return {
        week: row.week,
        weekDisplay: formatWeekDisplay(row.week),
        monthLabel,
        wauCount: row.wauCount,
        weeklyUsage: row.weeklyUsage,
        weeklyTabs: row.weeklyTabs,
        requestsPer: row.requestsPer
      };
    })
    .sort((a, b) => a.week.localeCompare(b.week));
}

/**
 * Formats week string for display
 */
export function formatWeekDisplay(weekString: string): string {
  try {
    const date = parseISO(weekString);
    return format(date, 'MMM dd, yyyy');
  } catch {
    console.warn(`Invalid date format: ${weekString}`);
    return weekString;
  }
}

/**
 * Gets available date range from WAU data
 */
export function getWAUDataDateRange(rawData: WAURawDataRow[]): DateRange | null {
  if (rawData.length === 0) return null;

  const dates = rawData
    .map(row => {
      try {
        return parseISO(row.week);
      } catch {
        return null;
      }
    })
    .filter((date): date is Date => date !== null);

  if (dates.length === 0) return null;

  const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

  return {
    from: startOfWeek(minDate),
    to: endOfWeek(maxDate)
  };
}

/**
 * Validates WAU CSV file format
 */
export function validateWAUCSVFormat(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content.split('\n');
        
        if (lines.length < 2) {
          console.warn('[WAU Validation] File has less than 2 lines');
          resolve(false);
          return;
        }

        const requiredColumns = ['week', 'weekly_usage', 'weekly_tabs', 'wau_count', 'requestsper'];
        const actualColumns = lines[0].split(',').map(col => col.trim());
        const { mapping, missingColumns } = createFlexibleColumnMapping(requiredColumns, actualColumns);

        console.log('[WAU Validation] Required columns:', requiredColumns);
        console.log('[WAU Validation] Actual columns:', actualColumns);
        console.log('[WAU Validation] Column mapping:', mapping);
        console.log('[WAU Validation] Missing columns:', missingColumns);

        const isValid = missingColumns.length === 0;
        console.log('[WAU Validation] Is valid:', isValid);
        
        resolve(isValid);
      } catch (error) {
        console.error('[WAU Validation] Error during validation:', error);
        resolve(false);
      }
    };

    reader.onerror = () => {
      console.error('[WAU Validation] FileReader error');
      resolve(false);
    };
    reader.readAsText(file.slice(0, 1000)); // Read first 1KB to check format
  });
}

/**
 * Exports WAU MoM data to CSV format
 */
export function exportWAUMoMToCSV(data: WAUMoMData[]): string {
  if (data.length === 0) return '';

  // Create header
  const headers = ['Month', 'Average WAU', 'Total Weeks', 'Total Usage', 'Total Tabs'];
  
  // Create rows
  const rows = data.map(row => [
    row.monthDisplay,
    row.averageWAU.toFixed(0),
    row.totalWeeks.toString(),
    row.totalUsage.toFixed(0),
    row.totalTabs.toFixed(0)
  ]);

  // Add totals row
  const totalsRow = [
    'TOTAL',
    (data.reduce((sum, row) => sum + row.averageWAU, 0) / data.length).toFixed(0),
    data.reduce((sum, row) => sum + row.totalWeeks, 0).toString(),
    data.reduce((sum, row) => sum + row.totalUsage, 0).toFixed(0),
    data.reduce((sum, row) => sum + row.totalTabs, 0).toFixed(0)
  ];

  rows.push(totalsRow);

  // Convert to CSV
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  return csvContent;
}

/**
 * Exports WAU WoW data to CSV format
 */
export function exportWAUWoWToCSV(data: WAUWoWData[]): string {
  if (data.length === 0) return '';

  // Create header
  const headers = ['Week', 'Month', 'WAU Count', 'Weekly Usage', 'Weekly Tabs', 'Requests Per User'];
  
  // Create rows
  const rows = data.map(row => [
    row.weekDisplay,
    row.monthLabel,
    row.wauCount.toString(),
    row.weeklyUsage.toFixed(0),
    row.weeklyTabs.toFixed(0),
    row.requestsPer.toFixed(2)
  ]);

  // Convert to CSV
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  return csvContent;
}
