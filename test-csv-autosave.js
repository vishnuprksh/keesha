// Simple test to verify CSV import auto-save functionality
// Run this in the browser console after importing CSV data

console.log('Testing CSV Import Auto-Save...');

// Check if auto-save data exists
const savedData = localStorage.getItem('keesha-csv-import-state');
if (savedData) {
  try {
    const parsed = JSON.parse(savedData);
    console.log('✅ CSV import state found in localStorage');
    console.log('📊 Data rows:', parsed.csvData?.length || 0);
    console.log('📁 File info:', parsed.selectedFile?.name || 'No file');
    console.log('⏰ Saved at:', new Date(parsed.timestamp).toLocaleString());
    
    // Check if data is not expired (within 24 hours)
    const hoursElapsed = (Date.now() - parsed.timestamp) / (1000 * 60 * 60);
    if (hoursElapsed < 24) {
      console.log('✅ Data is fresh (not expired)');
    } else {
      console.log('⚠️ Data is expired');
    }
  } catch (error) {
    console.error('❌ Error parsing saved data:', error);
  }
} else {
  console.log('ℹ️ No CSV import state found in localStorage');
}

// Function to manually clear the auto-save data
window.clearCSVAutoSave = function() {
  localStorage.removeItem('keesha-csv-import-state');
  console.log('🗑️ CSV auto-save data cleared');
};

console.log('💡 Run clearCSVAutoSave() to manually clear saved data');
