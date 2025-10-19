import Papa from 'papaparse';
import { format, parseISO, isWithinInterval, startOfWeek, endOfWeek } from 'date-fns';
import { 
  MCPUsageRawRow, 
  MCPUsageProcessedRow, 
  MCPUsageConfig, 
  DateRange
} from '@/types';

/**
 * Parses MCP Usage CSV data and returns structured data
 */
export function parseMCPUsageCSV(csvContent: string): Promise<MCPUsageRawRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<MCPUsageRawRow>(csvContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`));
          return;
        }

        // Validate required columns
        const requiredColumns = ['week', 'agent_l4', 'mcp_usage_wau'];
        const hasRequiredColumns = results.data.length > 0 && 
          requiredColumns.every(col => col in results.data[0]);

        if (!hasRequiredColumns) {
          reject(new Error(`CSV must contain columns: ${requiredColumns.join(', ')}`));
          return;
        }

        // Filter out invalid rows
        const validData = results.data.filter((row): row is MCPUsageRawRow => {
          return (
            row &&
            typeof row.week === 'string' &&
            typeof row.agent_l4 === 'number' &&
            typeof row.mcp_usage_wau === 'number' &&
            !isNaN(row.agent_l4) &&
            !isNaN(row.mcp_usage_wau)
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
 * Processes raw MCP Usage data into filtered and formatted data
 */
export function processMCPUsageData(
  rawData: MCPUsageRawRow[], 
  config: MCPUsageConfig
): MCPUsageProcessedRow[] {
  return rawData
    .filter(row => {
      // Apply date range filter
      if (config.dateRange) {
        try {
          const rowDate = parseISO(row.week);
          if (!isWithinInterval(rowDate, { start: config.dateRange.from, end: config.dateRange.to })) {
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
      agent_l4: row.agent_l4,
      mcp_usage_wau: row.mcp_usage_wau
    }))
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
 * Gets available date range from MCP Usage data
 */
export function getMCPUsageDateRange(rawData: MCPUsageRawRow[]): DateRange | null {
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
 * Validates MCP Usage CSV file format
 */
export function validateMCPUsageCSVFormat(file: File): Promise<boolean> {
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
        const requiredColumns = ['week', 'agent_l4', 'mcp_usage_wau'];
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

