/* eslint require-jsdoc:0 -- shim */
import nested from "postcss-nested"

function loadConfig() {
  // noop
}

export function sync(options) {
  return {
    plugins: [nested],
    options,
  }
}

loadConfig.sync = sync

export default loadConfig
