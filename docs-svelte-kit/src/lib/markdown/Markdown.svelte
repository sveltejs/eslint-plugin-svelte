<script>
  import SideMenu from "$lib/sidemenu/SideMenu.svelte"
  import Footer from "$lib/footer/Footer.svelte"
  import { tocStore } from "../utils.js"
  export let toc = []
  export let fileInfo = {}
  export let frontmatter = {}
  $: tocStore.update(() => toc)
</script>

{#if !frontmatter.hiddenMenu}
  <SideMenu />
{/if}
<main class:hidden-menu={frontmatter.hiddenMenu}>
  <div class="main-content">
    <slot />
  </div>
</main>
<Footer {frontmatter} {fileInfo} />

<style>
  main:not(.hidden-menu) {
    padding-left: 20rem;
  }

  @media (max-width: 959px) {
    main:not(.hidden-menu) {
      padding-left: 16.4rem;
    }
  }

  main .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 1rem;
    width: 100%;
    max-width: 1024px;
    margin: 0 auto;
    box-sizing: border-box;
  }
</style>
