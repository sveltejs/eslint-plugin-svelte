<script>
  import UlMenu from "./UlMenu.svelte"
  import { menuItems } from "../utils.js"
</script>

<aside>
  <UlMenu children={$menuItems} />
</aside>

<style>
  aside {
    font-size: 16px;
    /* background-color: #fff; */
    width: 20rem;
    position: fixed;
    z-index: 10;
    margin: 0;
    top: 3.6rem;
    left: 0;
    bottom: 0;
    box-sizing: border-box;
    border-right: 1px solid rgba(255, 255, 255, 0.7);
    overflow-y: auto;
  }

  @media (max-width: 959px) {
    aside {
      font-size: 15px;
      width: 16.4rem;
    }
  }
</style>
