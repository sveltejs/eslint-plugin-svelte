<a id="link">Click me!</a>

<a>Click me two!</a>

<b id="bold">Text 1</b>

<b>Text 2</b>

<b data-key="val">Text 2</b>

<style>
  :global(a) {
    color: red;
  }

  :global(b) {
    color: red;
  }

  :global(a:active) {
    color: red;
  }

  :global(a + b) {
    color: red;
  }

  :global(b[data-key="val"]) {
    color: red;
  }

  :global(b::before) {
    color: red;
  }

  :global(#link) {
    color: red;
  }

  :global(#bold) {
    color: red;
  }

  :global(#link:active) {
    color: red;
  }

  :global(#link + #bold) {
    color: red;
  }

  :global(#bold[data-key="val"]) {
    color: red;
  }

  :global(#bold::before) {
    color: red;
  }

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
    a {
      color: red;
    }

    b {
      color: red;
    }

    a:active {
      color: red;
    }

    a + b {
      color: red;
    }

    b[data-key="val"] {
      color: red;
    }

    b::before {
      color: red;
    }

    #link {
      color: red;
    }

    #bold {
      color: red;
    }

    #link:active {
      color: red;
    }

    #link + #bold {
      color: red;
    }

    #bold[data-key="val"] {
      color: red;
    }

    #bold::before {
      color: red;
    }

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
