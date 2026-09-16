// @ts-check
import { readFileSync } from 'node:fs';
import { fail, positionals, setOutput } from './workflow.js';

// Cuts the section for the version being released out of the changelog, which release.yml publishes as the release
// notes through the notes output of the step:
//
//     node scripts/release/release-notes.js 1.2.3 [CHANGELOG.md]
//
// The section starts after the heading '## [1.2.3] - YYYY-MM-DD', the Keep a Changelog form, and ends before the next
// version heading or the link definitions at the bottom of the file, whichever comes first. The blank lines around it
// are dropped. A missing heading or an empty section is an error, since a release without notes is a release nobody
// prepared.

const [version, file = 'CHANGELOG.md'] = positionals(
    'Usage: node scripts/release/release-notes.js <version> [changelog]',
    1,
    2,
);

const lines = readFileSync(file, 'utf8').split(/\r?\n/);
const escaped = version.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const heading = new RegExp(`^## \\[${escaped}\\] - \\d{4}-\\d{2}-\\d{2}$`);

const start = lines.findIndex((line) => heading.test(line));

if (start === -1) {
    fail(`${file} has no heading '## [${version}] - YYYY-MM-DD'.`, file);
}
const rest = lines.slice(start + 1);
const end = rest.findIndex((line) => /^## /.test(line) || /^\[[^\]]+\]: /.test(line));
const notes = (end === -1 ? rest : rest.slice(0, end)).join('\n').trim();

if (notes === '') {
    fail(`The ${version} section of ${file} is empty.`, file);
}
console.log(notes);
setOutput('notes', notes);
