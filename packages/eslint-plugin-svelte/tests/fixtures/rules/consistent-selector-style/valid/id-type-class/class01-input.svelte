<a class="link">Click me!</a>

<span class="link">Click me two!</span>

<b class="bold">Text 1</b>

<strong class="bold">Text 2</strong>

<b data-key="val">Text 2</b>

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
