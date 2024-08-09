<script lang="ts">
let foo: undefined | string = "foo";
let num = 123;
</script>
<a style:--foo={foo}></a>
{ num || ""}