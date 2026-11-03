import { spawn } from 'node:child_process';
import process from 'node:process';

// Check if already running with tsx
const hasTsx = process.execArgv.some((arg) => arg.includes('tsx')) || process.env._SPAWNED_WITH_TSX === '1';

if (!hasTsx) {
  // Re-spawn node with --import tsx so TypeScript and extensionless ESM imports resolve seamlessly
  const scriptPath = process.argv[1] || 'server.ts';
  const child = spawn(process.execPath, ['--import', 'tsx', scriptPath, ...process.argv.slice(2)], {
    stdio: 'inherit',
    env: { ...process.env, _SPAWNED_WITH_TSX: '1' },
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
    } else {
      process.exit(code ?? 0);
    }
  });

  process.on('SIGINT', () => child.kill('SIGINT'));
  process.on('SIGTERM', () => child.kill('SIGTERM'));
} else {
  // Loaded with tsx runtime
  await import('./src/server/main.js').catch(async () => {
    await import('./src/server/main.ts');
  });
}
