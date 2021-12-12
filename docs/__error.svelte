<script context="module">
  /** @type {import('@sveltejs/kit').ErrorLoad} */
  export function load({ error, status }) {
    return {
      props: { error, status },
    }
  }
</script>

<script>
  export let status, error
</script>

<h1>{status}</h1>
<blockquote>
  <p>{error.message}</p>
  <p>Take me <a href="/eslint-plugin-svelte/">home</a></p>
</blockquote>
