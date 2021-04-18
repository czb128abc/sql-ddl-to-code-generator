import nodePath from 'path';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript';
import pkg from './package.json';

const resolveFile = (path) => nodePath.resolve(__dirname, './', path);

export default [
  // UMD for browser-friendly build
  {
    input: 'src/index.ts',
    output: {
      name: 'howLongUntilLunch',
      file: pkg.browser,
      format: 'umd',
    },
    plugins: [resolve(), commonjs(), typescript()],
  },
  // CommonJS for Node and ES module for bundlers build
  {
    input: 'src/index.ts',
    external: ['ms'],
    plugins: [
      typescript({
        tsconfig: resolveFile('tsconfig.json'),
      }),
    ],
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' },
    ],
  },
];
