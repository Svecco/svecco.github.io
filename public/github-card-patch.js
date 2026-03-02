/**
 * GitHub Card Cache Patch
 * Runtime patch to add caching functionality to existing GitHub cards
 */

(() => {
	const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7days

	function getCacheKey(repo) {
		return `github_repo_${repo.replace(/\//g, "_")}`;
	}

	function loadFromCache(repo) {
		try {
			const cacheKey = getCacheKey(repo);
			const cachedData = localStorage.getItem(cacheKey);

			if (cachedData) {
				const { data, timestamp } = JSON.parse(cachedData);
				const now = Date.now();
				const age = now - timestamp;

				console.log(
					`[GITHUB-CARD-PATCH] Found cached data for ${repo}, age: ${Math.floor(age / (60 * 60 * 1000))} hours`,
				);

				if (age < CACHE_DURATION) {
					const remainingHours = Math.floor(
						(CACHE_DURATION - age) / (60 * 60 * 1000),
					);
					console.log(
						`[GITHUB-CARD-PATCH] Using cached data for ${repo} (${remainingHours} hours remaining)`,
					);
					return data;
				}
				console.log(
					`[GITHUB-CARD-PATCH] Cache expired for ${repo}, removing...`,
				);
				localStorage.removeItem(cacheKey);
			} else {
				console.log(
					`[GITHUB-CARD-PATCH] No cache found for ${repo}, fetching from API`,
				);
			}
		} catch (e) {
			console.error(`[GITHUB-CARD-PATCH] Cache loading error for ${repo}:`, e);
		}
		return null;
	}

	function saveToCache(repo, data) {
		try {
			const cacheKey = getCacheKey(repo);
			const cacheData = {
				data: data,
				timestamp: Date.now(),
			};
			localStorage.setItem(cacheKey, JSON.stringify(cacheData));
			console.log(`[GITHUB-CARD-PATCH] Saved data to cache for ${repo}`);
		} catch (e) {
			console.error(`[GITHUB-CARD-PATCH] Cache save error for ${repo}:`, e);
		}
	}

	function patchExistingCards() {
		// Find all GitHub cards
		const cards = document.querySelectorAll("a.card-github[repo]");

		cards.forEach((card) => {
			const repo = card.getAttribute("repo");
			if (!repo) return;

			console.log(`[GITHUB-CARD-PATCH] Processing card for ${repo}`);

			// Check if already patched
			if (card.hasAttribute("data-cache-patched")) {
				console.log(
					`[GITHUB-CARD-PATCH] Card for ${repo} already patched, skipping`,
				);
				return;
			}

			// Try to load from cache first
			const cachedData = loadFromCache(repo);
			if (cachedData) {
				// Update card with cached data
				try {
					const cardId = card.id.replace("-card", "");
					document.getElementById(`${cardId}-description`).innerText =
						cachedData.description?.replace(/:[a-zA-Z0-9_]+:/g, "") ||
						"Description not set";
					document.getElementById(`${cardId}-language`).innerText =
						cachedData.language || "Unknown";
					document.getElementById(`${cardId}-forks`).innerText =
						Intl.NumberFormat("en-us", {
							notation: "compact",
							maximumFractionDigits: 1,
						})
							.format(cachedData.forks || 0)
							.replaceAll("\u202f", "");
					document.getElementById(`${cardId}-stars`).innerText =
						Intl.NumberFormat("en-us", {
							notation: "compact",
							maximumFractionDigits: 1,
						})
							.format(cachedData.stargazers_count || 0)
							.replaceAll("\u202f", "");
					const avatarEl = document.getElementById(`${cardId}-avatar`);
					avatarEl.style.backgroundImage = `url(${cachedData.owner?.avatar_url})`;
					avatarEl.style.backgroundColor = "transparent";
					document.getElementById(`${cardId}-license`).innerText =
						cachedData.license?.spdx_id || "no-license";
					card.classList.remove("fetch-waiting");

					card.setAttribute("data-cache-patched", "true");
					console.log(
						`[GITHUB-CARD-PATCH] Updated card for ${repo} with cached data`,
					);
				} catch (e) {
					console.error(
						`[GITHUB-CARD-PATCH] Error updating card UI for ${repo}:`,
						e,
					);
				}
			} else {
				// No cache found, fetch data from API directly
				console.log(
					`[GITHUB-CARD-PATCH] No cache found for ${repo}, fetching from API`,
				);

				fetch(`https://api.github.com/repos/${repo}`, {
					referrerPolicy: "no-referrer",
				})
					.then((response) => {
						if (!response.ok) {
							throw new Error(
								`API request failed: ${response.status} ${response.statusText}`,
							);
						}
						return response.json();
					})
					.then((data) => {
						console.log(
							`[GITHUB-CARD-PATCH] Successfully fetched data for ${repo} from API`,
						);

						// Update card with fresh data
						try {
							const cardId = card.id.replace("-card", "");
							document.getElementById(`${cardId}-description`).innerText =
								data.description?.replace(/:[a-zA-Z0-9_]+:/g, "") ||
								"Description not set";
							document.getElementById(`${cardId}-language`).innerText =
								data.language || "Unknown";
							document.getElementById(`${cardId}-forks`).innerText =
								Intl.NumberFormat("en-us", {
									notation: "compact",
									maximumFractionDigits: 1,
								})
									.format(data.forks || 0)
									.replaceAll("\u202f", "");
							document.getElementById(`${cardId}-stars`).innerText =
								Intl.NumberFormat("en-us", {
									notation: "compact",
									maximumFractionDigits: 1,
								})
									.format(data.stargazers_count || 0)
									.replaceAll("\u202f", "");
							const avatarEl = document.getElementById(`${cardId}-avatar`);
							avatarEl.style.backgroundImage = `url(${data.owner?.avatar_url})`;
							avatarEl.style.backgroundColor = "transparent";
							document.getElementById(`${cardId}-license`).innerText =
								data.license?.spdx_id || "no-license";
							card.classList.remove("fetch-waiting");

							// Save to cache
							saveToCache(repo, data);
							card.setAttribute("data-cache-patched", "true");
							console.log(
								`[GITHUB-CARD-PATCH] Updated card for ${repo} with fresh API data and saved to cache`,
							);
						} catch (e) {
							console.error(
								`[GITHUB-CARD-PATCH] Error updating card UI for ${repo}:`,
								e,
							);
						}
					})
					.catch((error) => {
						console.error(
							`[GITHUB-CARD-PATCH] Error fetching data for ${repo}:`,
							error,
						);
						card.classList.remove("fetch-waiting");
						card.classList.add("fetch-error");
					});
			}
		});
	}

	// Run patch when DOM is ready
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", patchExistingCards);
	} else {
		patchExistingCards();
	}

	console.log("[GITHUB-CARD-PATCH] GitHub Card Cache Patch loaded and ready");
})();
