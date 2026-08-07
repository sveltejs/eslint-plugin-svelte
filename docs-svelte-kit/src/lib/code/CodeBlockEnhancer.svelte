<script>
	import { afterNavigate } from '$app/navigation';
	import { tick } from 'svelte';

	afterNavigate(async () => {
		await tick();
		for (const pre of document.querySelectorAll('.main-content pre.shiki:not([data-enhanced])')) {
			pre.dataset.enhanced = 'true';
			const button = document.createElement('button');
			button.type = 'button';
			button.className = 'copy-code';
			button.setAttribute('aria-label', 'Copy code');
			button.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"></rect><path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3"></path></svg><span>Copy</span>`;
			button.addEventListener('click', async () => {
				await navigator.clipboard.writeText(pre.querySelector('code')?.textContent || '');
				button.classList.add('copied');
				button.querySelector('span').textContent = 'Copied';
				setTimeout(() => {
					button.classList.remove('copied');
					button.querySelector('span').textContent = 'Copy';
				}, 1600);
			});
			pre.append(button);
		}
	});
</script>
