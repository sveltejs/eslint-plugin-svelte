function mutated(): Set<string> {
  const local = new Set<string>();
  local.add('Hello');
  return local;
}
function unmutated(): Set<string> {
  const local = new Set<string>();
  return local;
}
function direct(): Set<string> {
  return new Set<string>();
}
class Example {
  local = new Set<string>();
  constructor() {
    const local = new Map<string, string>();
    this.map = local;
  }
  map: Map<string, string>;
}
function alias() {
  const local = new Set<string>();
  const other = local;
  other.add('Hello');
}
function callback() {
  const local = new Set<string>();
  return () => local.add('Hello');
}
function passed(consume: (value: Set<string>) => void) {
  const local = new Set<string>();
  consume(local);
}
function chained() {
  const local = new Set<string>();
  return local.add('Hello');
}
