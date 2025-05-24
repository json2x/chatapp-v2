import { boot } from 'quasar/wrappers';
import { Dark } from 'quasar';

// This boot file initializes dark mode based on saved preferences
export default boot(() => {
  // Check if user has a saved theme preference
  const savedTheme = localStorage.getItem('theme');
  
  // Apply the theme if it exists
  if (savedTheme === 'dark') {
    Dark.set(true);
  } else if (savedTheme === 'light') {
    Dark.set(false);
  } else {
    // If no saved preference, use system preference
    Dark.set('auto');
  }
});
