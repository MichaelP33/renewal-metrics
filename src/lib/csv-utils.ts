/**
 * Utility functions for flexible CSV column matching
 * Handles CSV files where column names may have random prefixes
 */

/**
 * Finds a column in the header that matches the expected column name
 * Tries exact match first, then suffix match, then contains (case-insensitive)
 * 
 * @param expectedColumn - The expected column name (e.g., 'wau_count')
 * @param headerColumns - Array of actual column names from CSV
 * @returns The matching column name from the CSV, or null if not found
 */
export function findColumnInHeader(
  expectedColumn: string,
  headerColumns: string[]
): string | null {
  const expectedLower = expectedColumn.toLowerCase();
  
  // Try exact match (case-insensitive)
  const exactMatch = headerColumns.find(
    col => col.toLowerCase() === expectedLower
  );
  if (exactMatch) return exactMatch;
  
  // Try suffix match - column ends with expected name
  // e.g., 'c1j1r3i_number_wau_count' ends with 'wau_count'
  const suffixMatch = headerColumns.find(col => {
    const colLower = col.toLowerCase();
    return colLower.endsWith('_' + expectedLower) || colLower.endsWith(expectedLower);
  });
  if (suffixMatch) return suffixMatch;
  
  // Try contains match - expected name appears anywhere in column
  // Remove underscores for more flexible matching
  const expectedNoUnderscore = expectedLower.replace(/_/g, '');
  const containsMatch = headerColumns.find(col => {
    const colLower = col.toLowerCase().replace(/_/g, '');
    return colLower.includes(expectedNoUnderscore);
  });
  if (containsMatch) return containsMatch;
  
  return null;
}

/**
 * Creates a mapping from actual CSV column names to expected column names
 * 
 * @param expectedColumns - Array of expected column names
 * @param actualColumns - Array of actual column names from CSV header
 * @returns Object mapping actual column names to expected names, and array of missing columns
 */
export function createFlexibleColumnMapping(
  expectedColumns: string[],
  actualColumns: string[]
): {
  mapping: Record<string, string>;
  missingColumns: string[];
} {
  const mapping: Record<string, string> = {};
  const missingColumns: string[] = [];
  
  for (const expectedCol of expectedColumns) {
    const actualCol = findColumnInHeader(expectedCol, actualColumns);
    if (actualCol) {
      mapping[actualCol] = expectedCol;
    } else {
      missingColumns.push(expectedCol);
    }
  }
  
  return { mapping, missingColumns };
}

/**
 * Validates that all required columns are present in the CSV header
 * 
 * @param headerLine - First line of CSV (header row)
 * @param requiredColumns - Array of required column names
 * @returns Object with validation result and details
 */
export function validateCSVColumns(
  headerLine: string,
  requiredColumns: string[]
): {
  isValid: boolean;
  missingColumns: string[];
  foundColumns: Record<string, string>;
} {
  const actualColumns = headerLine.split(',').map(col => col.trim());
  
  const { mapping, missingColumns } = createFlexibleColumnMapping(
    requiredColumns,
    actualColumns
  );
  
  return {
    isValid: missingColumns.length === 0,
    missingColumns,
    foundColumns: mapping
  };
}

