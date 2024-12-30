import * as plugin from './main.js';
import { setPluginObject } from './configs/flat/base.js';
setPluginObject(plugin);

export * from './main.js';
export default plugin;
