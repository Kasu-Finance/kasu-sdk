module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'never',
      ['fe', 'be', 'api', 'auth', 'tests', 'config', 'deps'],
    ],
    'type-enum': [
      2,
      'always',
      [
        'update',
        'feat',
        'hotfix',
        'experimental',
        'patch',
        'release',
        'fix',
        'docs',
        'chore',
        'style',
        'refactor',
        'ci',
        'test',
        'perf',
        'revert',
        'vercel',
        'aws',
      ],
    ],
  },
}
