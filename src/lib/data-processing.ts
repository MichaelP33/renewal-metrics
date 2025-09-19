import Papa from 'papaparse';
import { format, startOfMonth, endOfMonth, startOfQuarter, isWithinInterval, parseISO, addMonths, addQuarters } from 'date-fns';
import { 
  RawDataRow, 
  ProcessedDataRow, 
  AggregatedData, 
  ChartDataPoint, 
  PieChartData,
  FilterConfig, 
  ModelCategory,
  TimePeriod,
  DateRange,
  CATEGORY_ORDER,
  MODEL_COLORS
} from '@/types';
import { categorizeModel } from './model-categorization';

/**
 * Parses CSV data and returns structured data
 */
export function parseCSVData(csvContent: string): Promise<RawDataRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<RawDataRow>(csvContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`));
          return;
        }

        // Validate required columns
        const requiredColumns = ['month', 'model', 'total_cost_dollars'];
        const hasRequiredColumns = results.data.length > 0 && 
          requiredColumns.every(col => col in results.data[0]);

        if (!hasRequiredColumns) {
          reject(new Error(`CSV must contain columns: ${requiredColumns.join(', ')}`));
          return;
        }

        // Filter out invalid rows
        const validData = results.data.filter((row): row is RawDataRow => {
          return (
            row &&
            typeof row.month === 'string' &&
            typeof row.model === 'string' &&
            typeof row.total_cost_dollars === 'number' &&
            !isNaN(row.total_cost_dollars)
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
 * Processes raw data into categorized and filtered data
 */
export function processData(
  rawData: RawDataRow[], 
  filterConfig: FilterConfig
): ProcessedDataRow[] {
  return rawData
    .filter(row => {
      // Apply cost threshold filter
      if (row.total_cost_dollars < filterConfig.minCostThreshold) {
        return false;
      }

      // Apply date range filter
      if (filterConfig.dateRange) {
        try {
          const rowDate = parseISO(row.month);
          if (!isWithinInterval(rowDate, { start: filterConfig.dateRange.from, end: filterConfig.dateRange.to })) {
            return false;
          }
        } catch {
          console.warn(`Invalid date format: ${row.month}`);
          return false;
        }
      }

      return true;
    })
    .map(row => {
      const category = categorizeModel(row.model);
      const finalCategory = filterConfig.enabledCategories.has(category) ? category : 'Other';
      
      return {
        month: row.month,
        monthDisplay: formatMonthDisplay(row.month),
        category: finalCategory,
        cost: row.total_cost_dollars,
        originalModel: row.model
      };
    });
}

/**
 * Gets the period key for grouping data based on time period
 */
function getPeriodKey(dateString: string, timePeriod: TimePeriod): string {
  const date = parseISO(dateString);
  
  switch (timePeriod) {
    case 'MoM':
      return format(startOfMonth(date), 'yyyy-MM-01');
    case 'QoQ':
      return format(startOfQuarter(date), 'yyyy-MM-dd');
    default:
      return format(startOfMonth(date), 'yyyy-MM-01');
  }
}

/**
 * Gets the display format for a period
 */
function getPeriodDisplay(dateString: string, timePeriod: TimePeriod): string {
  const date = parseISO(dateString);
  
  switch (timePeriod) {
    case 'MoM':
      return format(date, 'MMM yyyy');
    case 'QoQ':
      return format(startOfQuarter(date), 'QQQ yyyy');
    default:
      return format(date, 'MMM yyyy');
  }
}

/**
 * Generates all periods between start and end dates
 */
function generateAllPeriods(startDate: Date, endDate: Date, timePeriod: TimePeriod): string[] {
  const periods: string[] = [];
  let current: Date;
  
  switch (timePeriod) {
    case 'MoM':
      current = startOfMonth(startDate);
      while (current <= endDate) {
        periods.push(format(current, 'yyyy-MM-01'));
        current = addMonths(current, 1);
      }
      break;
    case 'QoQ':
      current = startOfQuarter(startDate);
      while (current <= endDate) {
        periods.push(format(current, 'yyyy-MM-dd'));
        current = addQuarters(current, 1);
      }
      break;
    default:
      current = startOfMonth(startDate);
      while (current <= endDate) {
        periods.push(format(current, 'yyyy-MM-01'));
        current = addMonths(current, 1);
      }
      break;
  }
  
  return periods;
}

/**
 * Aggregates processed data by time period and category
 */
export function aggregateData(processedData: ProcessedDataRow[], timePeriod: TimePeriod = 'MoM'): AggregatedData[] {
  if (processedData.length === 0) {
    return [];
  }

  // Find the date range from the processed data
  const dates = processedData.map(row => parseISO(row.month));
  const startDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const endDate = new Date(Math.max(...dates.map(d => d.getTime())));

  // Generate all periods in the range
  const allPeriods = generateAllPeriods(startDate, endDate, timePeriod);

  // Group actual data by period
  const dataByPeriod = processedData.reduce((acc, row) => {
    const periodKey = getPeriodKey(row.month, timePeriod);
    
    if (!acc[periodKey]) {
      acc[periodKey] = {
        categories: {} as Record<ModelCategory, number>,
        total: 0
      };
    }

    if (!acc[periodKey].categories[row.category]) {
      acc[periodKey].categories[row.category] = 0;
    }

    acc[periodKey].categories[row.category] += row.cost;
    acc[periodKey].total += row.cost;

    return acc;
  }, {} as Record<string, { 
    categories: Record<ModelCategory, number>; 
    total: number 
  }>);

  // Create result with all periods, filling gaps with zeros
  const result = allPeriods.map(periodKey => {
    const periodData = dataByPeriod[periodKey];
    const aggregated: AggregatedData = {
      month: periodKey,
      monthDisplay: getPeriodDisplay(periodKey, timePeriod),
      total: periodData?.total || 0
    };

    // Add all categories, defaulting to 0 if not present
    CATEGORY_ORDER.forEach(category => {
      aggregated[category] = periodData?.categories[category] || 0;
    });

    return aggregated;
  });

  return result;
}

/**
 * Converts aggregated data to chart format
 */
export function prepareChartData(aggregatedData: AggregatedData[]): ChartDataPoint[] {
  return aggregatedData.map(data => {
    const chartPoint: ChartDataPoint = {
      month: data.monthDisplay
    };

    CATEGORY_ORDER.forEach(category => {
      chartPoint[category] = data[category] as number;
    });

    return chartPoint;
  });
}

/**
 * Prepares data for pie chart (total across all months)
 */
export function preparePieChartData(aggregatedData: AggregatedData[]): PieChartData[] {
  // Sum across all months
  const totals = CATEGORY_ORDER.reduce((acc, category) => {
    acc[category] = aggregatedData.reduce((sum, month) => 
      sum + (month[category] as number), 0
    );
    return acc;
  }, {} as Record<ModelCategory, number>);

  const grandTotal = Object.values(totals).reduce((sum, value) => sum + value, 0);

  // Convert to pie chart format, filtering out zero values
  return CATEGORY_ORDER
    .map(category => ({
      name: category,
      value: totals[category],
      color: MODEL_COLORS[category],
      percentage: grandTotal > 0 ? (totals[category] / grandTotal) * 100 : 0
    }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value); // Sort by value descending
}

/**
 * Formats month string for display
 */
export function formatMonthDisplay(monthString: string): string {
  try {
    const date = parseISO(monthString);
    return format(date, 'MMM yyyy');
  } catch {
    console.warn(`Invalid date format: ${monthString}`);
    return monthString;
  }
}

/**
 * Gets available date range from data
 */
export function getDataDateRange(rawData: RawDataRow[]): DateRange | null {
  if (rawData.length === 0) return null;

  const dates = rawData
    .map(row => {
      try {
        return parseISO(row.month);
      } catch {
        return null;
      }
    })
    .filter((date): date is Date => date !== null);

  if (dates.length === 0) return null;

  const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

  return {
    from: startOfMonth(minDate),
    to: endOfMonth(maxDate)
  };
}


/**
 * Exports data to CSV format
 */
export function exportToCSV(data: AggregatedData[]): string {
  if (data.length === 0) return '';

  // Create header
  const headers = ['Month', ...CATEGORY_ORDER, 'Total'];
  
  // Create rows
  const rows = data.map(row => [
    row.monthDisplay,
    ...CATEGORY_ORDER.map(category => (row[category] as number).toFixed(2)),
    row.total.toFixed(2)
  ]);

  // Add totals row
  const totalsRow = [
    'TOTAL',
    ...CATEGORY_ORDER.map(category => 
      data.reduce((sum, row) => sum + (row[category] as number), 0).toFixed(2)
    ),
    data.reduce((sum, row) => sum + row.total, 0).toFixed(2)
  ];

  rows.push(totalsRow);

  // Convert to CSV
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  return csvContent;
}

/**
 * Validates CSV file format
 */
export function validateCSVFormat(file: File): Promise<boolean> {
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
        const requiredColumns = ['month', 'model', 'total_cost_dollars'];
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
