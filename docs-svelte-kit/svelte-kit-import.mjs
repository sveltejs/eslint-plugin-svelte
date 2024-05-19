// eslint-disable-next-line n/no-unsupported-features/node-builtins -- Used in build script for repo site
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';
register('./svelte-kit-import-hook.mjs', pathToFileURL('./'));
