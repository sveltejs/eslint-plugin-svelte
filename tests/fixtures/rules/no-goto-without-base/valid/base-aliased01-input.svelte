<script>
  import { base as alias } from "$app/paths";
  import { goto } from "$app/navigation";

  goto(alias + "/foo/");
  goto(`${alias}/foo/`);
</script>
