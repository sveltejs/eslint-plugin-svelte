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

function isAbsolute() {
  return false
}

function join(...args) {
  return args.join("/")
}

const sep = "/"

const posix = { dirname, extname, resolve, relative, sep, isAbsolute, join }
posix.posix = posix
export { dirname, extname, posix, resolve, relative, sep, isAbsolute, join }
export default posix
