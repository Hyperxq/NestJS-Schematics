import alias from '@rollup/plugin-alias';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import swc from '@rollup/plugin-swc';
import glob from 'glob';
import path from 'node:path';
import cleaner from 'rollup-plugin-cleaner';
import copy from 'rollup-plugin-copy';
import { dts } from 'rollup-plugin-dts';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import progress from 'rollup-plugin-progress';
import tsConfigPaths from 'rollup-plugin-tsconfig-paths';
import { fileURLToPath } from 'url';
// Helper functions to normalize paths and remove 'src' prefix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const normalizeUrl = (url) => url.replace(/\\/g, '/');
const removeSrcPattern = /^(src[/\\])/;
const removeSrcPath = (string) => normalizeUrl(string).replace(removeSrcPattern, '');

// Get all TypeScript files excluding public_api.ts and .d.ts files
const tsFilesSrc = glob.sync('src/**/*.ts').filter(file => !file.endsWith('public_api.ts') && !file.endsWith('.d.ts'));

// Create a map of transformed paths
const transformedPaths = tsFilesSrc.reduce((acc, filePath) => {
  const fileName = normalizeUrl(filePath).replace(/\.ts$/, '').replace(removeSrcPattern, '');
  acc[fileName] = filePath;
  return acc;
}, {});

// Base plugins configuration
const basePlugins = [
  tsConfigPaths(),
  peerDepsExternal(),
  progress(),
  nodeResolve({ extensions: ['.ts', '.js', '.json'] }),
  swc({
    include: /\.ts$/,
    jsc: {
      parser: { syntax: 'typescript', tsx: false },
      target: 'es2021',
    },
    module: { type: 'commonjs' },
    tsconfig: path.resolve(__dirname, 'tsconfig.json'),
  }),
];

// Base external dependencies configuration, * if you have a dependencies that you will use after the solution will be compiled, add here!
const baseExternal = [
  '@angular-devkit/core',
  '@angular-devkit/core/src/utils/strings',
  '@angular-devkit/schematics-cli',
  '@angular-devkit/schematics',
  '@angular-devkit/schematics/src/tree/interface',
  '@angular-devkit/schematics/tasks',
  '@nestjs/cli',
  '@nestjs/cli/lib/compiler/helpers/get-value-or-default',
  '@nestjs/cli/lib/utils/load-configuration',
  '@nestjs/cli/lib/utils/project-utils',
  '@nestjs/schematics',
  '@phenomnomnominal/tsquery',
  'ansi-colors',
  'inquirer',
  'json5',
  'jsonc-parser',
  'jsonc-parser',
  'mongoose',
  'node-emoji',
  'node:module',
  'ora',
  'pluralize',
  'tty',
  'typescript',
  'winston-console-format',
  'winston',
];

// Rollup configuration for the main build
const mainConfig = {
  input: 'src/public_api.ts',
  output: {
    dir: 'dist',
    format: 'cjs',
    preserveModules: true,
  },
  external: baseExternal,
  plugins: [
    ...basePlugins,
    cleaner({ targets: ['dist'] }),
    copy({
      targets: [
        {
          src: 'package.json',
          dest: 'dist',
          transform: (contents) => {
            const packageData = JSON.parse(contents.toString());
            delete packageData.scripts;
            delete packageData.devDependencies;
            delete packageData.keywords;
            delete packageData.engines;
            return JSON.stringify(packageData, null, 2);
          },
          verbose: false,
        },
        { src: 'README.md', dest: 'dist', verbose: false, },
        { src: 'src/collection.json', dest: 'dist', verbose: false, },
        {
          src: 'src/**/*.json',
          dest: 'dist',
          rename: (name, extension, fullPath) => removeSrcPath(fullPath),
          verbose: false,
        },
        {
          src: 'src/**/*.d.ts',
          dest: 'dist',
          rename: (name, extension, fullPath) => removeSrcPath(fullPath),
          verbose: false,
        },
        {
          src: ['src/**/*.template', 'src/**/.*.template'],
          dest: 'dist',
          rename: (name, extension, fullPath) => removeSrcPath(fullPath),
          verbose: false,
        },
      ],
      hook: 'writeBundle',
    }),
  ],
};

// Rollup configuration for aliasing and transforming paths
const aliasConfig = {
  input: transformedPaths,
  output: {
    dir: 'dist',
    format: 'cjs',
    preserveModules: true,
  },
  external: baseExternal,
  plugins: [
    ...basePlugins,
    alias({ entries: [{ find: 'utils', replacement: '../../utils' }] }),
  ],
};

// Rollup configuration for generating TypeScript declaration files
const dtsConfig = {
  input: transformedPaths,
  output: {
    dir: 'dist',
    format: 'es',
  },
  plugins: [dts(), progress()]
};

// Exporting all configurations
export default [mainConfig, aliasConfig, dtsConfig];
