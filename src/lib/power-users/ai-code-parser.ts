import Papa from 'papaparse';
import { AICodeMetrics, AICodeMetricsCsvRowSchema, normalizeEmail } from '@/types/power-users';

/**
 * Parses AI Code Metrics CSV and returns structured data
 */
export async function parseCSV(csvText: string): Promise<AICodeMetrics[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`));
          return;
        }

        const validData: AICodeMetrics[] = [];
        const errors: string[] = [];

        for (let i = 0; i < results.data.length; i++) {
          const row = results.data[i];
          const validated = validateRow(row);
          
          if (validated) {
            validData.push(validated);
          } else {
            errors.push(`Row ${i + 2}: Invalid data`);
          }
        }

        if (errors.length > 0) {
          console.warn(`Skipped ${errors.length} invalid rows:`, errors.slice(0, 5));
        }

        resolve(validData);
      },
      error: (error: Error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      },
    });
  });
}

/**
 * Validates and maps a CSV row to AICodeMetrics domain type
 */
export function validateRow(raw: unknown): AICodeMetrics | null {
  try {
    const parsed = AICodeMetricsCsvRowSchema.parse(raw);
    
    return {
      email: normalizeEmail(parsed.email),
      linkedinUrl: parsed.person_linkedin_url,
      aiLinesChanged: parsed.ai_lines_changed,
      totalLinesChanged: parsed.total_lines_changed,
      pctAiCode: parsed.pct_ai_lines_changed,
      commitCount: parsed.commit_count,
    };
  } catch {
    return null;
  }
}

export { normalizeEmail };

