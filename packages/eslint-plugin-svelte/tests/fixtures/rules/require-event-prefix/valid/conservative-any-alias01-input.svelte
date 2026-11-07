<script lang="ts">
  import type { Missing } from 'not-a-module';
  type Any = any;
  type Unknown = unknown;
  interface Props {
    custom: () => Any;
    other: () => Unknown;
    missing: () => Missing;
    maybeAsync: () => void | Promise<Unknown>;
  }

  let { custom, other, missing, maybeAsync }: Props = $props();
</script>
