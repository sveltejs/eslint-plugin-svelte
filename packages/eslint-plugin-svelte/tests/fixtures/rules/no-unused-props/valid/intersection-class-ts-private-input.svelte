<script lang="ts" module>
	export class Ctrl {
		private hidden = 1;
		protected guarded = 2;
		get foo() {
			return this.hidden + this.guarded;
		}
	}
</script>

<script lang="ts">
	interface Props {
		both: Ctrl & { extra: number };
	}
	let { both }: Props = $props();
</script>

<p>{both.foo} {both.extra}</p>
