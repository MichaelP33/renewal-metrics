// Quick test to verify the CSV files are valid
// Run this in browser console on the Power Users page

async function testCSVUpload() {
  const csvPath = '/power user metrics/users_lines_of_ai_code.csv';
  
  try {
    const response = await fetch(csvPath);
    const text = await response.text();
    console.log('CSV loaded, first 500 chars:', text.substring(0, 500));
    console.log('CSV lines:', text.split('\n').length);
  } catch (error) {
    console.error('Failed to load CSV:', error);
  }
}

// Run this
testCSVUpload();

