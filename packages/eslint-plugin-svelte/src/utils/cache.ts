/**
 * Simple cache manager.
 *
 * refer: https://github.com/mysticatea/eslint-plugin-node/blob/f45c6149be7235c0f7422d1179c25726afeecd83/lib/util/cache.js
 */

const SKIP_TIME = 5000;

type CacheValue<T> = {
	expire: number;
	value: T;
};

/**
 * The cache will dispose of each value if the value has not been accessed
 * during 5 seconds.
 * @returns getter and setter ofr the cache.
 */
export function createCache<T>(): {
	get: (key: string) => T | null;
	set: (key: string, value: T) => void;
} {
	const map: Map<string, CacheValue<T>> = new Map();

	/**
	 * Get the cached value of the given key.
	 * @param key The key to get.
	 * @returns The cached value or null.
	 */
	function get(key: string): T | null {
		const entry = map.get(key);
		const now = Date.now();

		if (entry) {
			if (entry.expire > now) {
				entry.expire = now + SKIP_TIME;
				return entry.value;
			}
			map.delete(key);
		}
		return null;
	}

	/**
	 * Set the value of the given key.
	 * @param key The key to set.
	 * @param value The value to set.
	 * @returns
	 */
	function set(key: string, value: T): void {
		const entry = map.get(key);
		const expire = Date.now() + SKIP_TIME;

		if (entry) {
			entry.value = value;
			entry.expire = expire;
		} else {
			map.set(key, { value, expire });
		}
	}

	return { get, set };
}
