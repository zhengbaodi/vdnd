export default function ensureArray<T = unknown>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}
