import { goto } from '$app/navigation';

export function goHome(): Promise<void> {
	return goto('/home');
}
