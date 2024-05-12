<button
	on:focus|once
	on:focus={(evt) => console.log(evt)}
	on:keydown={() => console.log('foo')}
	on:keydown={(evt) => console.log(evt)}
/>
