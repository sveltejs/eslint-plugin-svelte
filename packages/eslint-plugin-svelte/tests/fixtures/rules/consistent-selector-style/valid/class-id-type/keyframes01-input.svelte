<div class="a">1</div>

<style>
  .a {
    animation: k 1s;
  }

  @keyframes k {
    from {
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  @-webkit-keyframes k2 {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @media (min-width: 100px) {
    @keyframes k3 {
      0%,
      from {
        opacity: 0;
      }
    }
  }
</style>
