<script context="module">
  /** @type {import('@sveltejs/kit').ErrorLoad} */
  export function load({ error, status }) {
    return {
      props: { error, status },
    }
  }
</script>

<script>
  import { base as baseUrl } from "$app/paths"
  export let status, error
</script>

<h1>{status}</h1>
<blockquote>
  <p>{error.message}</p>
  <p>Take me <a href="{baseUrl}/">home</a></p>
</blockquote>
