import Papa from 'papaparse';
import { AgentRequests, AgentRequestsCsvRowSchema, normalizeEmail } from '@/types/power-users';

/**
 * Parses Agent Requests CSV and returns structured data
 */
export async function parseCSV(csvText: string): Promise<AgentRequests[]> {
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

        const validData: AgentRequests[] = [];
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
 * Validates and maps a CSV row to AgentRequests domain type
 */
export function validateRow(raw: unknown): AgentRequests | null {
  try {
    const parsed = AgentRequestsCsvRowSchema.parse(raw);
    
    return {
      email: normalizeEmail(parsed.email),
      firstName: parsed.first_name,
      lastName: parsed.last_name,
      totalRequests: parsed.total_requests,
      totalSessions: parsed.total_sessions,
    };
  } catch {
    return null;
  }
}

export { normalizeEmail };

