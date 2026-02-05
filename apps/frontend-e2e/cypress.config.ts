import { defineConfig } from 'cypress';
import http from 'node:http';
import https from 'node:https';

const parseNumber = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const waitForHttp = async (
  url: string,
  timeoutMs: number,
  intervalMs: number,
): Promise<void> =>
  new Promise((resolve, reject) => {
    const start = Date.now();

    // Define attempt first so retry can reference it (requires some hoisting trick or separate declaration if it wasn't const...
    // but here we can define retry inside to capture attempt if we use a let OR define attempt as a const that calls a helper)
    // Actually, 'attempt' is circular with 'retry'.
    // To make it 'const', we define the function expression.

    const retry = (reason?: string) => {
      if (Date.now() - start >= timeoutMs) {
        reject(
          new Error(
            `API health check timed out after ${timeoutMs}ms (${reason ?? 'no response'}): ${url}`,
          ),
        );
        return;
      }
      setTimeout(execAttempt, intervalMs);
    };

    const execAttempt = () => {
      let target: URL;
      try {
        target = new URL(url);
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
        return;
      }

      const transport = target.protocol === 'https:' ? https : http;
      const request = transport.request(
        target,
        {
          method: 'GET',
          headers: {
            accept: 'application/json',
          },
        },
        (response) => {
          const status = response.statusCode ?? 0;
          response.resume();
          if (status >= 200 && status < 400) {
            resolve();
            return;
          }
          retry(`status ${status}`);
        },
      );

      request.on('error', (error) => retry(error.message));
      request.setTimeout(5000, () => {
        request.destroy(new Error('request timeout'));
      });
      request.end();
    };

    execAttempt();
  });

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    specPattern: 'src/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'src/support/e2e.ts',
    video: false,
    screenshotOnRunFailure: true,
    setupNodeEvents: (on, config) => {
      on('before:run', async () => {
        const healthUrl =
          process.env['API_HEALTH_URL'] ?? 'http://localhost:3333/api/health';
        const timeoutMs = parseNumber(
          process.env['API_HEALTH_TIMEOUT_MS'],
          120000,
        );
        const intervalMs = parseNumber(
          process.env['API_HEALTH_INTERVAL_MS'],
          1000,
        );

        console.log(`Waiting for API health at ${healthUrl}...`);
        await waitForHttp(healthUrl, timeoutMs, intervalMs);
        console.log('API health check passed.');
      });
      return config;
    },
  },
});
