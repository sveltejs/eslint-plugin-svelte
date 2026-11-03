<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	type Options = { shallow?: boolean };

	const asConst = { shallow: true } as const;
	const satisfiesType = { shallow: true } satisfies Options;
	const asType = { shallow: true } as Options;
	const angleBracket = <Options>{ shallow: true };
	const nonNull = { shallow: true };
	const paths = [resolve('/')] as const;
	const routes = { home: resolve('/') } satisfies Record<string, string>;
	const wrappedElements = [resolve('/') as string];

	goto('', { shallow: true } as const);
	goto('', asConst);
	goto('', satisfiesType);
	goto('', asType);
	goto('', angleBracket);
	goto('', nonNull!);
	goto('', { ...asConst });
	goto('', { shallow: true as boolean });
	goto(paths[0]);
	goto(routes.home);
	goto(resolve('/') as string);
	goto(wrappedElements[0]);
</script>

<a href={paths[0]}>Link</a>
