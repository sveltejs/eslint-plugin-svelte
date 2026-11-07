export async function uploadAll(files, upload, report) {
	const done = new Set();
	const progress = $derived(done.size / files.length);
	report(() => progress);
	for (const file of files) {
		await upload(file);
		done.add(file);
	}
}

export function debug() {
	const seen = new Set();
	$inspect(seen);
	seen.add(1);
}
