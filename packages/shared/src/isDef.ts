export default function isDef(value: unknown): value is NonNullable<unknown> {
  return value !== null && value !== undefined;
}
