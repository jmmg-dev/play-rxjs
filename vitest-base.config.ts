import { defineConfig } from 'vitest/config';

// Extra Vitest options for `ng test` (linked from the `test` target in angular.json).
// The rest of the setup (jsdom, coverage, thresholds) lives in angular.json.
export default defineConfig({
  test: {
    // The first test of a file pays the cold load of the i18n dictionaries and jsdom;
    // on a busy machine or a CI runner that can go past Vitest's 5 s default.
    testTimeout: 15_000,
  },
});
