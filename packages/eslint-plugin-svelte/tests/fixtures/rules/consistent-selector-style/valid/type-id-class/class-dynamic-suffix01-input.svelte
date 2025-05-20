<script>
  import { value } from "package";

  const derived = value + "-link-three";
</script>

<a>Click me!</a>

<a class={value + "-link-one"}>Click me two!</a>

<a class={value + "-link-one"}>Click me two!</a>

<a class={`${value}-link-two`}>Click me three!</a>

<a class={`${value}-link-two`}>Click me three!</a>


<a class={derived}>Click me four!</a>

<a class={derived}>Click me four!</a>

{#each ["one", "two"] as count}
  <b class={"bold-" + count}>Bold in each</b>
{/each}

<style>
  .foo-link-one {
    color: red;
  }

  .foo-link-two {
    color: red;
  }

  .foo-link-three {
    color: red;
  }

  .bold-one {
    color: red;
  }

  .bold-two {
    color: blue;
  }
</style>
