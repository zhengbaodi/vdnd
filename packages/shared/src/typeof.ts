export default function $typeof(v: unknown) {
  if (v === null) return 'null';
  if (typeof v === 'undefined') return 'undefined';
  if (typeof v === 'string') return 'string';
  if (typeof v === 'number') return 'number';
  if (typeof v === 'boolean') return 'boolean';
  if (typeof v === 'symbol') return 'symbol';
  if (typeof v === 'bigint') return 'bigint';
  const raw = Object.prototype.toString.call(v);
  return raw.slice(8, raw.length - 1);
}
