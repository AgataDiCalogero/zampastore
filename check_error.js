const { execSync } = require('child_process');
const fs = require('fs');

try {
  console.log('Running TSC...');
  const output = execSync('npx tsc -p frontend/tsconfig.app.json --noEmit', {
    encoding: 'utf8',
    stdio: 'pipe',
  });
  console.log('TSC Success');
  fs.writeFileSync('build_error.log', output);
} catch (e) {
  console.log('TSC Failed');
  fs.writeFileSync('build_error.log', e.stdout + '\n' + e.stderr);
}
