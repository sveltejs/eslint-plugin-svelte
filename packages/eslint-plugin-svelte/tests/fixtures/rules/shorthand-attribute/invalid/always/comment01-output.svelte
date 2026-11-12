<script>
	let a = 1;
</script>

<!-- prettier-ignore -->
<div a={/*x*/a}></div>
<!-- prettier-ignore -->
<div a={a /* x */}></div>
<!-- prettier-ignore -->
<div a={(/* x */ a)}></div>
<!-- prettier-ignore -->
<div a={
	// x
	a
}></div>
<!-- prettier-ignore -->
<div a="{/*x*/a}"></div>
