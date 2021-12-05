/* eslint require-jsdoc:0 -- shim */

function dirname(p) {
  return p.split("/").slice(0, -1).join("/") || p
}

const posix = { dirname }
posix.posix = posix
export { dirname, posix }
export default posix
