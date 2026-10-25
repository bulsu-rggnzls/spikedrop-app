const { spawn } = require('child_process');
const path = require('path');

const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

const cliPath = path.resolve(__dirname, '../node_modules/electron-vite/bin/electron-vite.js');
const child = spawn(process.execPath, [cliPath, 'dev', ...process.argv.slice(2)], {
  env,
  stdio: 'inherit',
  shell: false
});

child.on('close', (code) => {
  process.exit(code ?? 0);
});

