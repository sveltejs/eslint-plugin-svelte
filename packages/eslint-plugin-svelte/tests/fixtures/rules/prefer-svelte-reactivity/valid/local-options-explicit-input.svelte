<script>
  function localOnly() {
    const local = new Set();
    local.add('Hello');
    return local.size;
  }
  function getNextPage() {
    const newUrl = new URL('https://svelte.dev/');
    newUrl.pathname = '/next';
    newUrl.searchParams.set('p', '2');
    return newUrl.toString();
  }
  const timestamp = new Date().getTime();
  function shadows() {
    const Set = class { add() {} };
    const local = new Set();
    local.add();
    return local;
  }
</script>
