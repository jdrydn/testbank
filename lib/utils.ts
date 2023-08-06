/**
 * Sort a list of entries by a fixed list of values.
 */
export function sortEntriesByIds<T, U>(entries: T[], ids: U[], key: keyof T): T[] {
  return ids.reduce((results: T[], id) => {
    const row = entries.find(entry => entry[key] === id);
    if (row) {
      results.push(row);
    }
    return results;
  }, []);
}
