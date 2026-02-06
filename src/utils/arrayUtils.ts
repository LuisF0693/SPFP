/**
 * Safe array utilities to prevent "Cannot read properties of undefined" errors
 */

/**
 * Ensures a value is an array, returns empty array if undefined/null
 */
export const ensureArray = <T>(value: T[] | undefined | null): T[] => {
  return Array.isArray(value) ? value : [];
};

/**
 * Safely filter an array that might be undefined
 */
export const safeFilter = <T>(
  array: T[] | undefined | null,
  predicate: (item: T) => boolean
): T[] => {
  return ensureArray(array).filter(predicate);
};

/**
 * Safely map an array that might be undefined
 */
export const safeMap = <T, U>(
  array: T[] | undefined | null,
  mapper: (item: T, index?: number) => U
): U[] => {
  return ensureArray(array).map(mapper);
};

/**
 * Safely reduce an array that might be undefined
 */
export const safeReduce = <T, U>(
  array: T[] | undefined | null,
  reducer: (acc: U, item: T) => U,
  initialValue: U
): U => {
  return ensureArray(array).reduce(reducer, initialValue);
};

/**
 * Safely check array length
 */
export const safeLength = (array: any[] | undefined | null): number => {
  return ensureArray(array).length;
};

/**
 * Safely access array element
 */
export const safeAt = <T>(
  array: T[] | undefined | null,
  index: number
): T | undefined => {
  const safe = ensureArray(array);
  return index >= 0 && index < safe.length ? safe[index] : undefined;
};

/**
 * Safely find item in array
 */
export const safeFind = <T>(
  array: T[] | undefined | null,
  predicate: (item: T) => boolean
): T | undefined => {
  return ensureArray(array).find(predicate);
};

/**
 * Safely sort array
 */
export const safeSort = <T>(
  array: T[] | undefined | null,
  compareFn?: (a: T, b: T) => number
): T[] => {
  return [...ensureArray(array)].sort(compareFn);
};
