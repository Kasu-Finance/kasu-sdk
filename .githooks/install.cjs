// The `prepare` script: points git at .githooks so the pre-push hook runs.
//
// `prepare` also runs on `npm pack` / `npm publish` and when the package is
// installed from git, so this must never fail and must never touch a git
// repository other than this package's own checkout. It does nothing unless
// this folder is the top level of a git work tree (not a folder nested inside
// someone else's repository) that carries .githooks/pre-push.
'use strict';

const { execFileSync } = require('node:child_process');
const { existsSync, realpathSync } = require('node:fs');
const path = require('node:path');

try {
    const root = realpathSync(path.join(__dirname, '..'));
    if (!existsSync(path.join(root, '.githooks', 'pre-push'))) process.exit(0);
    const top = execFileSync('git', ['rev-parse', '--show-toplevel'], {
        cwd: root,
        stdio: ['ignore', 'pipe', 'ignore'],
    })
        .toString()
        .trim();
    if (realpathSync(top) !== root) process.exit(0);
    execFileSync('git', ['config', 'core.hooksPath', '.githooks'], { cwd: root, stdio: 'ignore' });
} catch {
    // No git, or not a checkout: there is nothing to install.
}
