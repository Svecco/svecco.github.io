/**
 * Simplified Layout Utilities
 * Integrated with unified scroll manager for consistent behavior
 */
import {
	getBannerHeight,
	getScrollTop,
	getThreshold,
	scrollManager,
} from "./scroll-manager";

/**
 * Layout Components Handler
 * Manages UI component visibility based on scroll position
 * Optimized for minimal DOM queries and reduced reflows/repaints
 */
class LayoutComponentsHandler {
	// Constant IDs for UI components
	private readonly COMPONENT_IDS = {
		BACK_TO_TOP: "back-to-top-btn",
		TOC_WRAPPER: "toc-wrapper",
		NAVBAR_WRAPPER: "navbar-wrapper",
	} as const;

	// Cached DOM elements (queried once at initialization)
	private cachedElements: {
		backToTopBtn: HTMLElement | null;
		tocWrapper: HTMLElement | null;
		navbarWrapper: HTMLElement | null;
	} = {
		backToTopBtn: null,
		tocWrapper: null,
		navbarWrapper: null,
	};

	constructor() {
		this.init();
	}

	/**
	 * Initialize handler: cache DOM elements, register listeners/callbacks
	 */
	private init(): void {
		// Cache DOM elements once (avoids repeated getElementById calls)
		this.cacheDOMElements();

		// Register with scroll manager (high priority for UI components)
		scrollManager.registerCallback(
			"layout-components",
			this.handleScroll.bind(this),
			10,
		);

		// Add keyboard event listener for Home/End key navigation
		this.initKeyboardListener();

		// Initialize navbar state on page load
		this.initializeNavbarState();
	}

	/**
	 * Cache DOM elements once at initialization (critical performance optimization)
	 */
	private cacheDOMElements(): void {
		this.cachedElements.backToTopBtn = document.getElementById(
			this.COMPONENT_IDS.BACK_TO_TOP,
		);
		this.cachedElements.tocWrapper = document.getElementById(
			this.COMPONENT_IDS.TOC_WRAPPER,
		);
		this.cachedElements.navbarWrapper = document.getElementById(
			this.COMPONENT_IDS.NAVBAR_WRAPPER,
		);
	}

	/**
	 * Initialize keyboard event listener for Home/End key navigation
	 */
	private initKeyboardListener(): void {
		document.addEventListener("keydown", this.handleKeyDown.bind(this));
	}

	/**
	 * Centralized keyboard event handler (cleaner separation of concerns)
	 */
	private handleKeyDown(event: KeyboardEvent): void {
		// Handle Home/End keys with unified navbar update
		if (event.key === "Home" || event.key === "End") {
			this.updateNavbarVisibility();
		}
	}

	/**
	 * Initialize navbar state on page load (no artificial delays)
	 */
	private initializeNavbarState(): void {
		this.updateNavbarVisibility();
	}

	/**
	 * Handle scroll events from scroll manager (optimized DOM updates)
	 * @param scrollTop Current vertical scroll position
	 */
	private handleScroll(scrollTop: number): void {
		const bannerHeight = getBannerHeight();

		// Update back-to-top button visibility (uses cached element)
		this.updateBackToTopVisibility(scrollTop, bannerHeight);

		// Update TOC visibility (uses cached element)
		this.updateTOCVisibility(scrollTop, bannerHeight);

		// Update navbar visibility (reuses unified logic)
		this.updateNavbarVisibility(scrollTop);
	}

	/**
	 * Unified logic for back-to-top button visibility (reduces code duplication)
	 * @param scrollTop Current scroll position
	 * @param bannerHeight Height of page banner
	 */
	private updateBackToTopVisibility(
		scrollTop: number,
		bannerHeight: number,
	): void {
		if (!this.cachedElements.backToTopBtn) return;

		// Batch class list modification (single DOM touch)
		this.cachedElements.backToTopBtn.classList.toggle(
			"hide",
			scrollTop <= bannerHeight,
		);
	}

	/**
	 * Unified logic for TOC visibility (reduces code duplication)
	 * @param scrollTop Current scroll position
	 * @param bannerHeight Height of page banner
	 */
	private updateTOCVisibility(scrollTop: number, bannerHeight: number): void {
		if (!this.cachedElements.tocWrapper) return;

		// Batch class list modification (single DOM touch)
		this.cachedElements.tocWrapper.classList.toggle(
			"toc-hide",
			scrollTop <= bannerHeight,
		);
	}

	/**
	 * Unified navbar visibility logic (eliminates duplicate code)
	 * @param scrollTop Optional scroll position (uses current scroll if not provided)
	 */
	private updateNavbarVisibility(scrollTop?: number): void {
		if (!this.cachedElements.navbarWrapper) return;

		// Use provided scrollTop or get current if missing
		const finalScrollTop = scrollTop ?? getScrollTop();
		const threshold = getThreshold();

		// Single class toggle (batch DOM update)
		this.cachedElements.navbarWrapper.classList.toggle(
			"navbar-hidden",
			finalScrollTop >= threshold,
		);
	}
}

// Create singleton instance
new LayoutComponentsHandler();
