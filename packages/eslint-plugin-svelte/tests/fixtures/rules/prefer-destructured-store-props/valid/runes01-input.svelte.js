export class Test {
	a = $state(0);
	b = $derived.by(() => this.a * 2);

	output() {
		console.log(this.a, this.b);
	}
}