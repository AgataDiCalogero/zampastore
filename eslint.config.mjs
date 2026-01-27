import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist', '**/out-tsc'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [String.raw`^.*/eslint(\.base)?\.config\.[cm]?[jt]s$`],
          depConstraints: [
            {
              sourceTag: 'scope:auth',
              onlyDependOnLibsWithTags: [
                'scope:auth',
                'scope:shared',
                'type:ui',
              ],
            },
            {
              sourceTag: 'scope:products',
              onlyDependOnLibsWithTags: [
                'scope:products',
                'scope:cart',
                'scope:shared',
                'type:ui',
              ],
            },
            {
              sourceTag: 'scope:cart',
              onlyDependOnLibsWithTags: [
                'scope:cart',
                'scope:shared',
                'type:ui',
              ],
            },
            {
              sourceTag: 'scope:orders',
              onlyDependOnLibsWithTags: [
                'scope:orders',
                'scope:payment',
                'scope:shared',
                'type:ui',
              ],
            },
            {
              sourceTag: 'scope:checkout',
              onlyDependOnLibsWithTags: [
                'scope:checkout',
                'scope:cart',
                'scope:orders',
                'scope:payment',
                'scope:shared',
                'type:ui',
              ],
            },
            {
              sourceTag: 'scope:home',
              onlyDependOnLibsWithTags: [
                'scope:home',
                'scope:products',
                'scope:cart',
                'scope:shared',
                'type:ui',
              ],
            },
            {
              sourceTag: 'scope:payment',
              onlyDependOnLibsWithTags: ['scope:payment', 'scope:shared'],
            },
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            {
              sourceTag: 'type:feature',
              onlyDependOnLibsWithTags: [
                'type:data-access',
                'type:ui',
                'type:shared',
              ],
            },
            {
              sourceTag: 'type:app',
              onlyDependOnLibsWithTags: [
                'type:feature',
                'type:data-access',
                'type:ui',
                'type:shared',
              ],
            },
            {
              sourceTag: 'type:backend',
              onlyDependOnLibsWithTags: ['type:shared'],
            },
            {
              sourceTag: 'type:data-access',
              onlyDependOnLibsWithTags: ['type:data-access', 'type:shared'],
            },
            {
              sourceTag: 'type:ui',
              onlyDependOnLibsWithTags: ['type:ui', 'type:shared'],
            },
            {
              sourceTag: 'type:shared',
              onlyDependOnLibsWithTags: ['type:shared'],
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    // Override or add rules here
    rules: {},
  },
];
