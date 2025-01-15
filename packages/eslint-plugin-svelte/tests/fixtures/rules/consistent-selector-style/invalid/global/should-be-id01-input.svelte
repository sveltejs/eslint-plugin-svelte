<a class="link">Click me!</a>

<a>Click me two!</a>

<b class="bold">Text 1</b>

<b data-key="val">Text 3</b>

<style>
  :global(.link) {
    color: red;
  }

  :global(.bold) {
    color: red;
  }

  :global(.link:active) {
    color: red;
  }

  :global(.link + .bold) {
    color: red;
  }

  :global(.bold[data-key="val"]) {
    color: red;
  }

  :global(.bold::before) {
    color: red;
  }

  :global {
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
  }
</style>
