// Loaded lazily in the browser: strips TypeScript and converts ES imports to `require` calls.
import { transform } from 'sucrase';

export function transpile(code: string): string {
  return transform(code, {
    transforms: ['typescript', 'imports'],
    disableESTransforms: true,
    production: true,
  }).code;
}
