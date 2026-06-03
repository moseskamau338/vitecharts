/**
 * Conventional Commits enforcement.
 * @see https://www.conventionalcommits.org
 */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Scopes used in this monorepo (optional — kept as a hint, not enforced).
    'scope-enum': [
      0,
      'always',
      [
        'core',
        'charts',
        'react',
        'vue',
        'svelte',
        'angular',
        'solid',
        'wc',
        'export',
        'sandbox',
        'docs',
        'release',
        'repo',
      ],
    ],
  },
};
