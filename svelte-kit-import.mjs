import { register } from 'node:module';
import { pathToFileURL } from 'node:url';
register('./svelte-kit-import-hook.mjs', pathToFileURL('./'));
