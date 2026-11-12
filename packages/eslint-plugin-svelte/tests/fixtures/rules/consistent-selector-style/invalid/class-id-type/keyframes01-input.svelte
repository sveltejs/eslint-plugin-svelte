<div class="a">1</div>

<p>2</p>

<style>
  .a {
    animation: k 1s;
  }

  @keyframes k {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @media (min-width: 100px) {
    p {
      color: red;
    }
  }

  @supports (display: grid) {
    div {
      color: red;
    }
  }
</style>
