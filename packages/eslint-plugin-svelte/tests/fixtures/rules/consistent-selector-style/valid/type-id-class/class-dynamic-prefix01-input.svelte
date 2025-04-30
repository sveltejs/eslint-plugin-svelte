<script>
  import { value } from "package";

  const derived = "link-three-" + value;
</script>

<a>Click me!</a>

<a class={"link-one-" + value}>Click me two!</a>

<a class={"link-one-" + value}>Click me two!</a>

<a class={`link-two-${value}`}>Click me three!</a>

<a class={`link-two-${value}`}>Click me three!</a>

<a class={derived}>Click me four!</a>

<a class={derived}>Click me four!</a>

<style>
  .link-one-foo {
    color: red;
  }

  .link-two-foo {
    color: red;
  }

  .link-three-foo {
    color: red;
  }
</style>
