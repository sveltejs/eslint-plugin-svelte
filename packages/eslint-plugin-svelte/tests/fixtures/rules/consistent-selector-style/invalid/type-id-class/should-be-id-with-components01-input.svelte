<script>
  import MyComponent from "./MyComponent.svelte"
</script>

<a class="link">Click me!</a>

<MyComponent class="link">Component</MyComponent>

<a>Click me two!</a>

<b class="bold">Text 1</b>

<MyComponent class="bold">Component</MyComponent>

<b data-key="val">Text 3</b>

<style>
  .link {
    color: red;
  }

  .bold {
    color: red;
  }

  .link:active {
    color: red;
  }

  .link + .bold {
    color: red;
  }

  .bold[data-key="val"] {
    color: red;
  }

  .bold::before {
    color: red;
  }
</style>
