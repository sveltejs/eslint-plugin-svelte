/* eslint require-jsdoc:0 -- shim */

function dirname(p) {
  return p.split("/").slice(0, -1).join("/") || p
}

function extname(p) {
  return /\.[\w$-]+$/iu.exec(p)[0]
}

const posix = { dirname, extname }
posix.posix = posix
export { dirname, extname, posix }
export default posix
