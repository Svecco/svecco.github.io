/**
 * GitHub API Cache Utility
 * Provides caching mechanism for GitHub repository data to reduce API calls
 */

interface GitHubRepoData {
	description: string;
	language: string;
	forks: number;
	stargazers_count: number;
	owner: {
		avatar_url: string;
	};
	license: {
		spdx_id: string;
	} | null;
}

interface CachedData<T> {
	data: T;
	timestamp: number;
}

const CACHE_EXPIRATION = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

/**
 * Generate cache key for a repository
 */
function getCacheKey(repo: string): string {
	const cleanRepo = repo.replace(/\//g, "_");
	const key = `github_repo_${cleanRepo}`;
	console.log(`[GITHUB-CACHE] Generated cache key for ${repo}: ${key}`);
	return key;
}

/**
 * Load data from cache if available and not expired
 */
function loadFromCache(repo: string): GitHubRepoData | null {
	try {
		const cacheKey = getCacheKey(repo);
		const cachedData = localStorage.getItem(cacheKey);

		console.log(
			`[GITHUB-CACHE] Checking cache for ${repo} with key: ${cacheKey}`,
		);

		if (cachedData) {
			const { data, timestamp }: CachedData<GitHubRepoData> =
				JSON.parse(cachedData);
			const now = Date.now();
			const age = now - timestamp;
			const remainingHours = Math.floor(
				(CACHE_EXPIRATION - age) / (60 * 60 * 1000),
			);

			console.log(
				`[GITHUB-CACHE] Found cached data for ${repo}, age: ${Math.floor(age / (60 * 60 * 1000))} hours`,
			);

			// Check if cache is still valid
			if (age < CACHE_EXPIRATION) {
				console.log(
					`[GITHUB-CACHE] Using cached data for ${repo} (${remainingHours} hours remaining)`,
				);
				return data;
			}
			console.log(`[GITHUB-CACHE] Cache expired for ${repo}, removing...`);
			// Remove expired cache
			localStorage.removeItem(cacheKey);
		} else {
			console.log(`[GITHUB-CACHE] No cache found for ${repo}`);
		}
	} catch (e) {
		console.error(`[GITHUB-CACHE] Error loading cache for ${repo}:`, e);
	}
	return null;
}

/**
 * Save data to cache
 */
function saveToCache(repo: string, data: GitHubRepoData): void {
	try {
		const cacheKey = getCacheKey(repo);
		const cacheData: CachedData<GitHubRepoData> = {
			data: data,
			timestamp: Date.now(),
		};
		localStorage.setItem(cacheKey, JSON.stringify(cacheData));
		console.log(`[GITHUB-CACHE] Saved data to cache for ${repo}`);
	} catch (e) {
		console.error(`[GITHUB-CACHE] Error saving cache for ${repo}:`, e);
	}
}

/**
 * Clear all GitHub cache entries
 */
function clearCache(): void {
	try {
		const keysToRemove: string[] = [];
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key?.startsWith("github_repo_")) {
				keysToRemove.push(key);
			}
		}
		for (const key of keysToRemove) {
			localStorage.removeItem(key);
		}
	} catch (e) {
		console.error("Error clearing GitHub cache:", e);
	}
}

/**
 * Get cache statistics
 */
function getCacheStats(): { count: number; size: number } {
	try {
		let count = 0;
		let totalSize = 0;

		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key?.startsWith("github_repo_")) {
				count++;
				const value = localStorage.getItem(key);
				if (value) {
					totalSize += value.length;
				}
			}
		}

		return { count, size: totalSize };
	} catch (e) {
		console.error("Error getting cache stats:", e);
		return { count: 0, size: 0 };
	}
}

export {
	loadFromCache,
	saveToCache,
	clearCache,
	getCacheStats,
	type GitHubRepoData,
};
