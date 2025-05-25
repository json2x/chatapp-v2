/**
 * Utility functions for the ChatApp v2 application
 */

/**
 * Creates a debounced version of a function
 * @param func The function to debounce
 * @param wait The debounce delay in milliseconds
 * @returns A debounced version of the function
 */
export function debounce<T extends (...args: Parameters<T>) => unknown>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(this: void, ...args: Parameters<T>): void {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      void func(...args); // Use void operator to explicitly ignore the promise
      timeout = null;
    }, wait);
  };
}
