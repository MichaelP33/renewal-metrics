import Papa from 'papaparse';
import { AICodeMetricsRow } from '@/types';

/**
 * Parses AI Code Metrics CSV data and returns structured data
 */
export function parseAICodeCSV(csvContent: string): Promise<AICodeMetricsRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<AICodeMetricsRow>(csvContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`));
          return;
        }

        // Validate required columns
        const requiredColumns = [
          'team_id',
          'team_name', 
          'user_id',
          'email',
          'person_linkedin_url',
          'total_lines_changed',
          'ai_lines_changed',
          'non_ai_lines_changed',
          'pct_ai_lines_changed',
          'pct_non_ai_lines_changed',
          'commit_count'
        ];
        
        const hasRequiredColumns = results.data.length > 0 && 
          requiredColumns.every(col => col in results.data[0]);

        if (!hasRequiredColumns) {
          reject(new Error(`CSV must contain columns: ${requiredColumns.join(', ')}`));
          return;
        }

        // Filter out invalid rows and validate data types
        const validData = results.data.filter((row): row is AICodeMetricsRow => {
          return (
            row &&
            typeof row.team_id === 'number' &&
            typeof row.team_name === 'string' &&
            typeof row.user_id === 'number' &&
            typeof row.email === 'string' &&
            typeof row.person_linkedin_url === 'string' &&
            typeof row.total_lines_changed === 'number' &&
            typeof row.ai_lines_changed === 'number' &&
            typeof row.non_ai_lines_changed === 'number' &&
            typeof row.pct_ai_lines_changed === 'number' &&
            typeof row.pct_non_ai_lines_changed === 'number' &&
            typeof row.commit_count === 'number' &&
            !isNaN(row.total_lines_changed) &&
            !isNaN(row.ai_lines_changed) &&
            !isNaN(row.pct_ai_lines_changed)
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
 * Processes raw AI code metrics data by deduplicating and sorting
 */
export function processAICodeData(rawData: AICodeMetricsRow[]): AICodeMetricsRow[] {
  if (rawData.length === 0) return [];

  // Deduplicate based on user_id and email, keeping the entry with the most complete LinkedIn URL
  const deduplicatedData = rawData.reduce((acc, row) => {
    const key = `${row.user_id}-${row.email}`;
    
    if (!acc[key]) {
      acc[key] = row;
    } else {
      // Keep the row with a more complete LinkedIn URL (longer string, contains https)
      const existing = acc[key];
      const currentLinkedIn = row.person_linkedin_url || '';
      const existingLinkedIn = existing.person_linkedin_url || '';
      
      if (currentLinkedIn.length > existingLinkedIn.length || 
          (currentLinkedIn.includes('https') && !existingLinkedIn.includes('https'))) {
        acc[key] = row;
      }
    }
    
    return acc;
  }, {} as Record<string, AICodeMetricsRow>);

  // Convert back to array and sort by total_lines_changed descending
  return Object.values(deduplicatedData)
    .sort((a, b) => b.total_lines_changed - a.total_lines_changed);
}

/**
 * Gets the top N users from processed data
 */
export function getTopUsers(processedData: AICodeMetricsRow[], count: number = 5): AICodeMetricsRow[] {
  return processedData.slice(0, Math.min(count, processedData.length));
}

/**
 * Formats LinkedIn URL for display
 */
export function formatLinkedInUrl(url: string): { display: string; href: string } {
  if (!url || url.trim() === '') {
    return { display: 'N/A', href: '' };
  }

  // Clean up the URL
  let cleanUrl = url.trim();
  
  // Add https:// if missing
  if (!cleanUrl.startsWith('http')) {
    cleanUrl = `https://${cleanUrl}`;
  }

  // Extract display name from URL
  const displayName = cleanUrl
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '');

  return {
    display: displayName,
    href: cleanUrl
  };
}

/**
 * Formats numbers with thousands separators
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Formats percentage with specified decimal places
 */
export function formatPercentage(num: number, decimals: number = 1): string {
  return `${num.toFixed(decimals)}%`;
}

/**
 * Validates AI Code Metrics CSV file format
 */
export function validateAICodeCSVFormat(file: File): Promise<boolean> {
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
        const requiredColumns = [
          'team_id',
          'email', 
          'total_lines_changed',
          'ai_lines_changed',
          'pct_ai_lines_changed'
        ];
        
        const hasRequiredColumns = requiredColumns.every(col => 
          header.includes(col.replace('_', '')) || header.includes(col)
        );

        resolve(hasRequiredColumns);
      } catch {
        resolve(false);
      }
    };

    reader.onerror = () => resolve(false);
    reader.readAsText(file.slice(0, 2000)); // Read first 2KB to check format
  });
}

/**
 * Exports AI code metrics data to CSV format
 */
export function exportAICodeMetricsToCSV(
  data: AICodeMetricsRow[], 
  userNames?: Map<string, { first_name: string; last_name: string }>
): string {
  if (data.length === 0) return '';

  // Create header
  const headers = [
    'Email',
    'First Name',
    'Last Name',
    'LinkedIn URL', 
    'Total Lines Changed',
    'AI Lines Changed',
    'AI Percentage',
    'Commit Count'
  ];
  
  // Create rows
  const rows = data.map(row => {
    const userKey = `${row.user_id}-${row.email}`;
    const nameData = userNames?.get(userKey);
    
    return [
      row.email,
      nameData?.first_name || '',
      nameData?.last_name || '',
      row.person_linkedin_url || 'N/A',
      row.total_lines_changed.toString(),
      row.ai_lines_changed.toString(),
      `${row.pct_ai_lines_changed.toFixed(2)}%`,
      row.commit_count.toString()
    ];
  });

  // Convert to CSV
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  return csvContent;
}


