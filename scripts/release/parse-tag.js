// @ts-check
import { fail, positionals, setOutput } from './workflow.js';

// Turns the pushed tag into the version the other release scripts check for:
//
//     node scripts/release/parse-tag.js v1.2.3
//
// The tag has to be strict semver with a v in front: three numbers, none with a leading zero, and no pre-release or
// build suffix. The trigger glob in release.yml lets a leading zero through, which is why the check is repeated here.
// The version is the tag without the v, which is what the manifest, the bake file and the changelog carry, and it is
// set as the version output of the step.

const [tag] = positionals('Usage: node scripts/release/parse-tag.js <tag>', 1, 1);

if (!/^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(tag)) {
    fail(`The tag ${tag} is not v<major>.<minor>.<patch> with plain numbers.`);
}
const version = tag.slice(1);

console.log(`The tag ${tag} releases version ${version}.`);
setOutput('version', version);
