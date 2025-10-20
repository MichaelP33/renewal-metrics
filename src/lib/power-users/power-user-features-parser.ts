import Papa from 'papaparse';
import { PowerUserFeatures, PowerUserFeaturesCsvRowSchema, normalizeEmail } from '@/types/power-users';

/**
 * Parses Power User Features CSV and returns structured data
 */
export async function parseCSV(csvText: string): Promise<PowerUserFeatures[]> {
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

        const validData: PowerUserFeatures[] = [];
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
 * Validates and maps a CSV row to PowerUserFeatures domain type
 */
export function validateRow(raw: unknown): PowerUserFeatures | null {
  try {
    const parsed = PowerUserFeaturesCsvRowSchema.parse(raw);
    
    return {
      email: normalizeEmail(parsed.email),
      isMcpUser: parsed.is_mcp_user,
      isRuleCreator: parsed.is_rule_creator,
      isRuleUser: parsed.is_rule_user,
      isCommandCreator: parsed.is_command_creator,
      isCommandUser: parsed.is_command_user,
      numProductsUsed: parsed.num_products_used,
      membershipDays: parsed.membership_days,
    };
  } catch {
    return null;
  }
}

export { normalizeEmail };

