<!-- prettier-ignore -->
<script lang="ts">
  const dragDrop = (e: any) => {
    e.preventDefault();
    /*
     * Last block comment.
     */
  };
  function foo() {
    bar();
    // Last line comment.
  }
  function solo() {
    // Solo comment.
  }
  if (x) {
    if (y) {
      bar();
    }
    // After a nested block.
  }
  const obj = {
    a: 1,
    // Last property comment.
  };
  const arr = [
    1,
    /* Last element comment. */
  ];
  call(
    a,
    // Last argument comment.
  );
  function aligned() {
    bar();
  // Aligned with the closing brace.
  }
  function alignedSolo() {
  // Aligned with the closing brace.
  }
</script>
