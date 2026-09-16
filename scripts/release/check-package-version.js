// @ts-check
import { readFileSync } from 'node:fs';
import { fail, positionals } from './workflow.js';

// Checks that the package manifest carries the version being released:
//
//     node scripts/release/check-package-version.js 1.2.3 [package.json]

const [version, file = 'package.json'] = positionals(
    'Usage: node scripts/release/check-package-version.js <version> [manifest]',
    1,
    2,
);

/** @type {{ version?: unknown }} */
const manifest = JSON.parse(readFileSync(file, 'utf8'));

if (manifest.version !== version) {
    fail(`${file} says version ${String(manifest.version)}, but the tag says ${version}.`, file);
}
console.log(`${file} says version ${version}.`);
