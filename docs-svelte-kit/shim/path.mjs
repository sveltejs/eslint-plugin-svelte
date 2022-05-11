/* eslint require-jsdoc:0 -- shim */

function dirname(p) {
  return p.split("/").slice(0, -1).join("/") || p
}

function extname(p) {
  return /\.[\w$-]+$/iu.exec(p)[0]
}

function relative(s) {
  return s
}

function resolve(s) {
  return s
}

const sep = "/"

const posix = { dirname, extname, resolve, relative, sep }
posix.posix = posix
export { dirname, extname, posix, resolve, relative, sep }
export default posix
