<script lang="ts">
let foo: undefined | string = "foo";
</script>
<a style:--foo={foo ? 'bar' : undefined}></a>