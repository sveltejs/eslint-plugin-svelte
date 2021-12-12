<script context="module">
  import { markdownPath } from "$lib/utils.js"
  const docs = import.meta.glob("./**/*.md")

  /** @type {import('@sveltejs/kit').Load} */
  export async function load({ page }) {
    const markdown = `./${markdownPath(page.path)}`
    if (docs[markdown]) {
      return {
        props: {
          moduleData: await docs[markdown](),
        },
      }
    }

    // 404
    return {
      props: {
        moduleData: {
          frontmatter: { title: "404", hiddenMenu: true },
        },
      },
    }
  }
</script>

<script>
  import Header from "$lib/header/Header.svelte"
  import SideMenu from "$lib/sidemenu/SideMenu.svelte"
  import Footer from "$lib/footer/Footer.svelte"

  import "../docs-svelte-kit/src/app.css"
  import "../docs-svelte-kit/src/site.css"
  // eslint-disable-next-line no-unused-vars -- ignore
  import { tocStore } from "$lib/utils"

  export let moduleData

  $: frontmatter = moduleData.frontmatter
  $: fileInfo = moduleData.fileInfo
  $: {
    const toc = moduleData.toc
    $tocStore = toc
  }

  let sidebarOpen = false

  function handleToggleSidebar() {
    sidebarOpen = !sidebarOpen
  }
  function resetSidebarOpen() {
    sidebarOpen = false
  }
</script>

<svelte:window on:resize={sidebarOpen ? resetSidebarOpen : null} />

<Header on:toggle-sidebar-open={handleToggleSidebar} />

<SideMenu {sidebarOpen} hiddenMenu={frontmatter.hiddenMenu} />

<main
  class:hidden-menu={frontmatter.hiddenMenu}
  on:click={sidebarOpen ? resetSidebarOpen : null}
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
