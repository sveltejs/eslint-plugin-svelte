<script>
  import Header from "$lib/header/Header.svelte"
  import SideMenu from "$lib/sidemenu/SideMenu.svelte"
  import Footer from "$lib/footer/Footer.svelte"
  import { tocStore } from "../utils.js"
  export let toc = []
  export let fileInfo = {}
  export let frontmatter = {}
  $: tocStore.update(() => toc)

  let sidebarOpen = false

  function handleToggleSidebar() {
    sidebarOpen = !sidebarOpen
  }
  function clickHandler() {
    sidebarOpen = false
  }
</script>

<Header on:toggle-sidebar-open={handleToggleSidebar} />

<SideMenu {sidebarOpen} hiddenMenu={frontmatter.hiddenMenu} />

<main
  class:hidden-menu={frontmatter.hiddenMenu}
  on:click={sidebarOpen ? clickHandler : null}
>
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
  @media (max-width: 719px) {
    main:not(.hidden-menu) {
      padding-left: 0;
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
