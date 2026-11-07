import { goto } from '$app/navigation';
import { resolve } from '$app/paths';

export class Router {
	go(): Promise<void> {
		return goto('/home');
	}

	ok(): Promise<void> {
		return goto(resolve('/home'));
	}
}
