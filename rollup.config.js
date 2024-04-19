// This plugin allows Rollup to process TypeScript files.
const typescript = require('@rollup/plugin-typescript');

// This plugin allows Rollup to resolve modules in 'node_modules'.
const nodeResolve = require('@rollup/plugin-node-resolve').nodeResolve;

// This plugin allows Rollup to convert CommonJS modules to ES6 modules.
const commonjs = require('@rollup/plugin-commonjs');

// Export the configuration object for Rollup.
module.exports = {
  // The entry point file of library, from which Rollup will start bundling.
  input: 'src/index.ts',
  
  // Array of output configurations - defines how the build outputs should be written.
  output: [
    {
      // Output path and filename for the CommonJS version of your library.
      file: 'dist/bundle.cjs.js',
      // Output format set to CommonJS, suitable for Node.js and other systems that support require().
      format: 'cjs'
    },
    {
      // Output path and filename for the ES Module version of your library.
      file: 'dist/bundle.esm.js',
      // Output format set to ES Module, suitable for use in modern browsers and ES Module-supporting environments.
      format: 'esm'
    }
  ],

  // Plugins to be used in the build process.
  plugins: [
    // Configuration for the nodeResolve plugin. This setup helps resolve third-party dependencies found in 'node_modules'.
    nodeResolve({
      // Specifies that the resolver should prefer built-in modules (like 'fs' or 'path') over npm-installed ones. False here because in browsers there are no built-ins.
      browser: true, 
      preferBuiltins: false
    }),
    commonjs({
      include: /node_modules/  // Include all CommonJS modules from node_modules to be converted
    }),
    typescript({ tsconfig: './tsconfig.json' }),
  ],
  external: ['ethers', 'ethers/lib/utils'], // Do not bundle these dependencies cus they are already bundled in frontend app
};
