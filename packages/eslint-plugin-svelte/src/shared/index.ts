import { CommentDirectives } from './comment-directives.js';

export class Shared {
	public readonly commentDirectives: CommentDirectives[] = [];

	public newCommentDirectives(
		options: ConstructorParameters<typeof CommentDirectives>[0]
	): CommentDirectives {
		const directives = new CommentDirectives(options);
		this.commentDirectives.push(directives);
		return directives;
	}
}
const sharedMap = new Map<string, Shared>();
/** Start sharing and make the data available. */
export function beginShared(filename: string): void {
	sharedMap.set(filename, new Shared());
}
/** Get the shared data and end the sharing. */
export function terminateShared(filename: string): Shared | null {
	const result = sharedMap.get(filename);
	sharedMap.delete(filename);
	return result ?? null;
}

/** If sharing has started, get the shared data. */
export function getShared(filename: string): Shared | null {
	return sharedMap.get(filename) ?? null;
}
