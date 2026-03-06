import { defineConfig } from 'vitest/config';

const isWindows = process.platform === 'win32';

export default defineConfig({
  test: isWindows
    ? {
        // Avoid flaky worker startup timeouts on Windows when using process forks.
        pool: 'threads',
        poolOptions: {
          threads: {
            singleThread: true,
          },
        },
        fileParallelism: false,
      }
    : {},
});
