import { defineConfig, loadEnv } from "vite";
//import reactRefresh from '@vitejs/plugin-react-refresh';
import macrosPlugin from 'vite-plugin-babel-macros';
import reactPlugin from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path, { resolve } from 'path';
import { viteExternalsPlugin } from 'vite-plugin-externals';
import react from "@vitejs/plugin-react";
import { sentryVitePlugin } from "@sentry/vite-plugin";

const isDev = process.env.NODE_ENV == 'development';
console.log('env.dev:', process.env.ENVIRONMENT, ' isDev:', isDev);
console.log('env.dev:', process.env.REACT_APP_PROVIDER);
// console.log('env.dev:', process.env);


const externals = viteExternalsPlugin({
  // added due to ipfs-http-client
  //  it has very poor esm compatibility and a ton of dependency bugs.
  //  see: https://github.com/ipfs/js-ipfs/issues/3452
  electron: 'electron',
  'electron-fetch': 'electron-fetch',
});

const env = loadEnv(isDev, process.cwd(), "");
console.log("=============", env);
const processEnvValues = {
  "process.env": Object.entries(env).reduce((prev, [key, val]) => {
    console.log(key, val);
    return {
      ...prev,
      [key]: val,
    };
  }, {}),
};

console.log("=============", processEnvValues);

export default defineConfig({
  plugins: [reactPlugin(), macrosPlugin(), tsconfigPaths(), externals,
    sentryVitePlugin({
      org: "home-7wi",
      project: "vite-app",
      // Auth tokens can be obtained from https://sentry.io/settings/account/api/auth-tokens/
      // and need `project:releases` and `org:read` scopes
      authToken: "a0656570151e436690b39acdf42e59b81ba7c2942400494a94fd9cb3f39d8509",

      sourcemaps: {
        // Specify the directory containing build artifacts
        assets: "./dist/**",
      },

      // Use the following option if you're on an SDK version lower than 7.47.0:
      // include: "./dist",

      // Optionally uncomment the line below to override automatic release name detection
      // release: env.RELEASE,
    }),
  ],
  build: {
    commonjsOptions: {
      include: /node_modules/,
      transformMixedEsModules: true,
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  esbuild: {
    jsxFactory: 'jsx',
    jsxInject: `import {jsx, css} from '@emotion/react'`,
  },
  define: {},
  optimizeDeps: {
    exclude: ['@apollo/client', `graphql`],
  },
  resolve: {
    preserveSymlinks: true,
    mainFields: ['module', 'main', 'browser'],
    alias: {
      '~~': resolve(__dirname, 'src'),
      /** browserify for web3 components */
      stream: 'stream-browserify',
      http: 'http-browserify',
      https: 'http-browserify',
      timers: 'timers-browserify',
      process: 'process',
      web3: 'web3/dist/web3.min.js'
    },
  },
  server: {
    //host: true,
    watch: {
      followSymlinks: true,
    },
    fs: {
      // compatability for yarn workspaces
      allow: ['../../'],
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
});



