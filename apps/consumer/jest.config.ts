/* eslint-disable */
export default {
  displayName: 'consumer',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    // Force CommonJS output so ESM-only deps (next-intl/use-intl ship "type":"module") run under Jest.
    '^.+\\.[tj]sx?$': [
      'babel-jest',
      {
        presets: [['@nx/next/babel', { 'preset-env': { modules: 'commonjs' } }]]
      }
    ]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  // The next-intl/use-intl ESM dependency tree ships "type":"module" and must be transformed
  // (Jest ignores node_modules by default).
  transformIgnorePatterns: [
    'node_modules/(?!(?:\\.pnpm/)?(next-intl|use-intl|intl-messageformat|icu-minify|@formatjs|@schummar)/)'
  ],
  coverageDirectory: '../../coverage/apps/consumer'
};
