import { composePlugins, withNx } from '@nx/next';
import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

// Define the path to your next-intl i18n configuration file
const withNextIntl = createNextIntlPlugin('../../shared/src/i18n/request.ts');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig: NextConfig = {
  // Add other Next.js configuration options here
  // For example:
  // reactStrictMode: true,

  // Enable the React Compiler (babel-plugin-react-compiler) for automatic memoization.
  reactCompiler: true,

  // SVGR for Turbopack (Next.js 16's default builder): lets you import SVGs as React
  // components, e.g. `import Icon from './icon.svg'`. The `webpack` config below is
  // ignored by Turbopack and only applies when building with `next build --webpack`.
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js'
      }
    }
  },

  webpack: (config) => {
    // Exclude SVG from Next.js's default file-loader rule
    const fileLoaderRule = config.module?.rules?.find(
      // @ts-ignore
      (rule) =>
        typeof rule === 'object' &&
        rule.test instanceof RegExp &&
        rule.test.test('.svg')
    );
    if (fileLoaderRule && typeof fileLoaderRule === 'object') {
      fileLoaderRule.exclude = /\.svg$/;
    }

    // Add the SVGR webpack loader rule
    config.module?.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'] // Use @svgr/webpack for importing SVGs as React components
    });

    return config;
  }

  // Note: For newer Next.js versions, the `nx` property in nextConfig is often
  // handled by the `withNx` plugin itself, but older Nx versions used:
  // nx: { svgr: true, ... }
  // The custom webpack config above is generally the most reliable way now.
};

const plugins = [
  // Add the next-intl plugin
  withNextIntl,
  // Add the Nx plugin
  withNx
];

// Compose the plugins
export default composePlugins(...plugins)(nextConfig);
