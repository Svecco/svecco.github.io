/// <reference types="mdast" />
import { h } from "hastscript";

/**
 * Creates a GitHub Card component.
 *
 * @param {Object} properties - The properties of the component.
 * @param {string} properties.repo - The GitHub repository in the format "owner/repo".
 * @param {import('mdast').RootContent[]} children - The children elements of the component.
 * @returns {Element} The created GitHub Card component.
 */
export function GithubCardComponent(properties, children) {
	if (Array.isArray(children) && children.length !== 0)
		return h("div", { class: "hidden" }, [
			'Invalid directive. ("github" directive must be leaf type "::github{repo="owner/repo"}")',
		]);

	if (!properties.repo || !properties.repo.includes("/"))
		return h(
			"div",
			{ class: "hidden" },
			'Invalid repository. ("repo" attributte must be in the format "owner/repo")',
		);

	const repo = properties.repo;
	const cardUuid = `GC${Math.random().toString(36).slice(-6)}`; // Collisions are not important

	const nAvatar = h(`div#${cardUuid}-avatar`, { class: "gc-avatar" });
	const nLanguage = h(
		`span#${cardUuid}-language`,
		{ class: "gc-language" },
		"Waiting...",
	);

	const nTitle = h("div", { class: "gc-titlebar" }, [
		h("div", { class: "gc-titlebar-left" }, [
			h("div", { class: "gc-owner" }, [
				nAvatar,
				h("div", { class: "gc-user" }, repo.split("/")[0]),
			]),
			h("div", { class: "gc-divider" }, "/"),
			h("div", { class: "gc-repo" }, repo.split("/")[1]),
		]),
		h("div", { class: "github-logo" }),
	]);

	const nDescription = h(
		`div#${cardUuid}-description`,
		{ class: "gc-description" },
		"Waiting for api.github.com...",
	);

	const nStars = h(`div#${cardUuid}-stars`, { class: "gc-stars" }, "00K");
	const nForks = h(`div#${cardUuid}-forks`, { class: "gc-forks" }, "0K");
	const nLicense = h(`div#${cardUuid}-license`, { class: "gc-license" }, "0K");

	// Create inline script with full cache support
	const scriptContent = `
      (function() {
        const REPO = "${repo}";
        const CARD_ID = "${cardUuid}";
        const CACHE_KEY = "github_repo_" + REPO.replace(///g, "_");
        const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours
        
        console.log('[GITHUB-CARD] Initializing card for ' + REPO + ' (ID: ' + CARD_ID + ')');
        console.log('[GITHUB-CARD] Cache key: ' + CACHE_KEY);
        
        function updateCard(data) {
          try {
            document.getElementById(CARD_ID + '-description').innerText = data.description?.replace(/:[a-zA-Z0-9_]+:/g, '') || "Description not set";
            document.getElementById(CARD_ID + '-language').innerText = data.language || "Unknown";
            document.getElementById(CARD_ID + '-forks').innerText = Intl.NumberFormat('en-us', { notation: "compact", maximumFractionDigits: 1 }).format(data.forks || 0).replaceAll("\u202f", '');
            document.getElementById(CARD_ID + '-stars').innerText = Intl.NumberFormat('en-us', { notation: "compact", maximumFractionDigits: 1 }).format(data.stargazers_count || 0).replaceAll("\u202f", '');
            const avatarEl = document.getElementById(CARD_ID + '-avatar');
            avatarEl.style.backgroundImage = 'url(' + data.owner?.avatar_url + ')';
            avatarEl.style.backgroundColor = 'transparent';
            document.getElementById(CARD_ID + '-license').innerText = data.license?.spdx_id || "no-license";
            document.getElementById(CARD_ID + '-card').classList.remove("fetch-waiting");
          } catch (e) {
            console.error('[GITHUB-CARD] Error updating card UI:', e);
          }
        }
        
        function handleError(error) {
          console.warn('[GITHUB-CARD] Error loading ' + REPO + ':', error);
          const card = document.getElementById(CARD_ID + '-card');
          if (card) {
            card.classList.add("fetch-error");
            card.classList.remove("fetch-waiting");
          }
        }
        
        // Load from cache function
        function loadFromCache() {
          try {
            const cachedData = localStorage.getItem(CACHE_KEY);
            if (!cachedData) {
              console.log('[GITHUB-CARD] No cache found for ' + REPO);
              return null;
            }
            
            const { data, timestamp } = JSON.parse(cachedData);
            const now = Date.now();
            const age = now - timestamp;
            
            console.log('[GITHUB-CARD] Found cached data for ' + REPO + ', age: ' + Math.floor(age/(60*60*1000)) + ' hours');
            
            if (age < CACHE_DURATION) {
              const remainingHours = Math.floor((CACHE_DURATION - age) / (60 * 60 * 1000));
              console.log('[GITHUB-CARD] Using cached data for ' + REPO + ' (' + remainingHours + ' hours remaining)');
              return data;
            } else {
              console.log('[GITHUB-CARD] Cache expired for ' + REPO + ', removing...');
              localStorage.removeItem(CACHE_KEY);
              return null;
            }
          } catch (e) {
            console.error('[GITHUB-CARD] Cache loading error for ' + REPO + ':', e);
            return null;
          }
        }
        
        // Save to cache function
        function saveToCache(data) {
          try {
            const cacheData = {
              data: data,
              timestamp: Date.now()
            };
            localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
            console.log('[GITHUB-CARD] Saved data to cache for ' + REPO);
          } catch (e) {
            console.error('[GITHUB-CARD] Cache save error for ' + REPO + ':', e);
          }
        }
        
        // Main execution
        try {
          const cachedData = loadFromCache();
          if (cachedData) {
            updateCard(cachedData);
          } else {
            console.log('[GITHUB-CARD] No valid cache found for ' + REPO + ', fetching from API');
            fetch('https://api.github.com/repos/' + REPO, { referrerPolicy: "no-referrer" })
              .then(response => {
                if (!response.ok) {
                  throw new Error('API request failed: ' + response.status + ' ' + response.statusText);
                }
                return response.json();
              })
              .then(data => {
                console.log('[GITHUB-CARD] Successfully fetched data for ' + REPO + ' from API');
                updateCard(data);
                saveToCache(data);
                console.log('[GITHUB-CARD] Fetched ' + REPO + ' from API and saved to cache');
              })
              .catch(handleError);
          }
        } catch (e) {
          console.error('[GITHUB-CARD] Critical error in card initialization:', e);
          handleError(e);
        }
      })();
    `;

	const nScript = h(
		`script#${cardUuid}-script`,
		{ type: "text/javascript", defer: true },
		scriptContent,
	);

	return h(
		`a#${cardUuid}-card`,
		{
			class: "card-github fetch-waiting no-styling",
			href: `https://github.com/${repo}`,
			target: "_blank",
			repo,
		},
		[
			nTitle,
			nDescription,
			h("div", { class: "gc-infobar" }, [nStars, nForks, nLicense, nLanguage]),
			nScript,
		],
	);
}
