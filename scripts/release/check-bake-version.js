// @ts-check
import { execFileSync } from 'node:child_process';
import { fail, positionals } from './workflow.js';

// Checks that the bake file labels the image with the version being released:
//
//     node scripts/release/check-bake-version.js 1.2.3 [docker-bake.hcl]
//
// The label is read from the configuration bake resolves rather than from the file's text, so the check does not
// depend on how the line is written; bake --print evaluates the file without building anything. The file labels the
// version under development with a -dev suffix, which is allowed here: the release image takes its label from
// docker/metadata-action, so only the version in front of the suffix has to match.

const [version, file = 'docker-bake.hcl'] = positionals(
    'Usage: node scripts/release/check-bake-version.js <version> [bake file]',
    1,
    2,
);

/** @returns {string} */
function printBakeConfiguration() {
    try {
        return execFileSync('docker', ['buildx', 'bake', '--file', file, '--print', 'web-app'], {
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'inherit'],
        });
    } catch {
        return fail(`docker buildx bake --print could not resolve ${file}.`, file);
    }
}

/** @type {{ target?: Record<string, { labels?: Record<string, string> }> }} */
const configuration = JSON.parse(printBakeConfiguration());
const label = configuration.target?.['web-app']?.labels?.['org.opencontainers.image.version'];

if (label === undefined) {
    fail(`${file} sets no org.opencontainers.image.version label on the web-app target.`, file);
}
if (label.replace(/-dev$/, '') !== version) {
    fail(`${file} labels the version ${label}, but the tag says ${version}.`, file);
}
console.log(`${file} labels the version ${label}.`);
