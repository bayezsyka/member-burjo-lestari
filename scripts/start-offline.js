#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const env = { ...process.env, EXPO_OFFLINE: '1' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const expoCliPath = resolve(__dirname, '../node_modules/expo/bin/cli.js');

const child = spawn(process.execPath, [expoCliPath, 'start', '--offline'], {
  env,
  stdio: 'inherit',
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
