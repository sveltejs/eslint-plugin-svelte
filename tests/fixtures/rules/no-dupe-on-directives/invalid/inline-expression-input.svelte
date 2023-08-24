<button on:keydown={() => console.log('foo')} on:keydown={() => console.log('foo')} />

<button
	on:keydown={() =>
		// foo
		console.log('foo')}
	on:keydown={() =>
		console
			// bar
			.log('foo')}
/>
