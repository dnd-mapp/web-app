// @ts-check
import { randomBytes } from 'node:crypto';
import { appendFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

// What the release scripts share: reading their arguments, reporting a failure and setting a step output. The scripts
// run as steps of release.yml, where a failure becomes an annotation and an output lands in $GITHUB_OUTPUT. Run by
// hand, the same scripts report on stderr and stdout instead, so they can be tried out before a tag is pushed.

const onActions = process.env['GITHUB_ACTIONS'] === 'true';

/**
 * Returns the positional arguments when there are between min and max of them, at least one, and exits with the
 * usage otherwise.
 *
 * @param {string} usage
 * @param {number} min
 * @param {number} max
 * @returns {[string, ...string[]]}
 */
export function positionals(usage, min, max) {
    const [first, ...rest] = parseArgs({ allowPositionals: true }).positionals;

    if (first === undefined || rest.length + 1 < min || rest.length + 1 > max) {
        console.error(usage);
        process.exit(2);
    }
    return [first, ...rest];
}

/**
 * Reports a failure and exits. Under GitHub Actions the message becomes an error annotation, attached to the file
 * when one is given.
 *
 * @param {string} message
 * @param {string} [file]
 * @returns {never}
 */
export function fail(message, file) {
    console.error(onActions ? `::error${file ? ` file=${file}` : ''}::${message}` : message);
    process.exit(1);
}

/**
 * Sets a step output. A value that spans several lines goes through a heredoc with a random delimiter, since a fixed
 * one could show up in the value. Outside GitHub Actions there is no output file, and the value is left to the
 * caller to print.
 *
 * @param {string} name
 * @param {string} value
 */
export function setOutput(name, value) {
    const file = process.env['GITHUB_OUTPUT'];

    if (!file) return;

    if (value.includes('\n')) {
        const delimiter = `${name}-${randomBytes(16).toString('hex')}`;
        appendFileSync(file, `${name}<<${delimiter}\n${value}\n${delimiter}\n`);
    } else {
        appendFileSync(file, `${name}=${value}\n`);
    }
}
