<!-- prettier-ignore -->
<script>
  export const hello = 'world';
</script>

<template lang="pug">
  div Posts +each('posts as post')
    a(href="{ post.url }") {post.title}
</template>

<style src="./style.scss"></style>
