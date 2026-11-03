<script>
	import { goto } from '$app/navigation';

	let { x } = $props();
	let state = $state({ href: '/a' });
	let other = $state({ href: '/b' });
	function h0() {
		state = { ...state, k0: x };
	}
	function g0() {
		other = { href: other.href, k0: x };
	}
	function h1() {
		state = { ...state, k1: x };
	}
	function g1() {
		other = { href: other.href, k1: x };
	}
	function h2() {
		state = { ...state, k2: x };
	}
	function g2() {
		other = { href: other.href, k2: x };
	}
	function h3() {
		state = { ...state, k3: x };
	}
	function g3() {
		other = { href: other.href, k3: x };
	}
	function h4() {
		state = { ...state, k4: x };
	}
	function g4() {
		other = { href: other.href, k4: x };
	}
	function h5() {
		state = { ...state, k5: x };
	}
	function g5() {
		other = { href: other.href, k5: x };
	}
	function h6() {
		state = { ...state, k6: x };
	}
	function g6() {
		other = { href: other.href, k6: x };
	}
	function h7() {
		state = { ...state, k7: x };
	}
	function g7() {
		other = { href: other.href, k7: x };
	}
	function h8() {
		state = { ...state, k8: x };
	}
	function g8() {
		other = { href: other.href, k8: x };
	}
	function h9() {
		state = { ...state, k9: x };
	}
	function g9() {
		other = { href: other.href, k9: x };
	}
	function h10() {
		state = { ...state, k10: x };
	}
	function g10() {
		other = { href: other.href, k10: x };
	}
	function h11() {
		state = { ...state, k11: x };
	}
	function g11() {
		other = { href: other.href, k11: x };
	}
	function h12() {
		state = { ...state, k12: x };
	}
	function g12() {
		other = { href: other.href, k12: x };
	}
	function h13() {
		state = { ...state, k13: x };
	}
	function g13() {
		other = { href: other.href, k13: x };
	}
	goto(state.href);
	goto(other.href);
</script>
