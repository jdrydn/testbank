export function attempt<T>(fn: () => T, retries?: number): T | null;
export function attempt<T>(fn: () => Promise<T>, retries?: number): Promise<T | null>;
export function attempt<T>(fn: (() => T) | (() => Promise<T>), retries = 0) {
  try {
    const r = fn();
    // If the function return a Promise-like result
    if (r instanceof Promise && typeof r.then === 'function' && typeof r.catch === 'function') {
      // Then wrap the promise to protect against errors
      return r.catch(() => {
        if (retries > 0) {
          return attempt(fn as () => Promise<T>, retries - 1);
        } else {
          return null;
        }
      });
    } else {
      // Otherwise, return the raw value returned from the function
      return r;
    }
  } catch (err) {
    if (retries > 0) {
      return attempt(fn as () => T, retries - 1);
    } else {
      return null;
    }
  }
}
