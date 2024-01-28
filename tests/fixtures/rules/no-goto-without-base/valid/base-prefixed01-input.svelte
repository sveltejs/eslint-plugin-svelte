<script>
  import { base } from "$app/paths";
  import { goto } from "$app/navigation";

  goto(base + "/foo/");
  goto(`${base}/foo/`);
</script>
