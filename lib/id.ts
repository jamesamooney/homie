let counter = 0;

/** Monotonic-ish unique id; avoids crypto.randomUUID's inconsistent SSR/browser support. */
export function generateId(prefix: string): string {
  counter += 1;
  return `${prefix}_${Date.now()}_${counter}_${Math.floor(Math.random() * 1e6)}`;
}
