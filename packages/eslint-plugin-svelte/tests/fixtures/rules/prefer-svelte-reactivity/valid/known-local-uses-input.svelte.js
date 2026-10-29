function computed() {
  const method = 'add';
  const local = new Set();
  local['add']('x');
  local[`add`]('y');
  local[method]('z');
  return local['has']('x');
}
function callbacks(consume) {
  const local = new Set(['x']);
  local.forEach(value => consume(value));
  local['forEach']((value, key) => consume(key));
  return local.size;
}
function mapAndDate() {
  const map = new Map();
  map['set']('x', 1);
  const date = new Date();
  date['setDate'](1);
  return [map.get('x'), date.getTime()];
}
function url() {
  const url = new URL('https://svelte.dev/');
  url['pathname'] = '/next';
  url.searchParams['set']('p', '2');
  return url['toString']();
}
