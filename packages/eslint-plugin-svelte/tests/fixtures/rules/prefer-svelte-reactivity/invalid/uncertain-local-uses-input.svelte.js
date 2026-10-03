function computed() {
  const local = new Set();
  return local['add']('x');
}
function templateComputed() {
  const local = new Map();
  return local[`set`]('x', 1);
}
function staticComputed() {
  const method = 'add';
  const local = new Set();
  return local[method]('x');
}
function unknownComputed(method) {
  const local = new Set();
  local[method]('x');
}
function unknownMethod() {
  const local = new Map();
  local.custom();
}
function callbackEscape(consume) {
  const local = new Set(['x']);
  local.forEach((value, key, collection) => consume(collection));
}
function mapCallbackEscape(consume) {
  const local = new Map([['x', 1]]);
  local['forEach']((value, key, collection) => consume(collection));
}
function unknownCallback(consume) {
  const local = new Set(['x']);
  local.forEach(consume);
}
function restCallback(consume) {
  const local = new Set(['x']);
  local.forEach((...args) => consume(args[2]));
}
function argumentsCallback(consume) {
  const local = new Set(['x']);
  local.forEach(function () { consume(arguments[2]); });
}
function inlineCallback(consume) {
  new Set(['x']).forEach((value, key, collection) => consume(collection));
}
function liveView() {
  const local = new URL('https://svelte.dev/');
  return local.searchParams;
}
function iteratorEscape() {
  const local = new Set(['x']);
  return local.values();
}
function overwriteMethod() {
  const local = new Set(['x']);
  local.has = () => true;
  return local.has('x');
}
function extractedMethod() {
  const local = new Set(['x']);
  const add = local.add;
  return add;
}
function chainedCall() {
  const local = new Set(['x']);
  return local.add.call(local, 'y');
}
