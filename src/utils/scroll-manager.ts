/**
 * Enhanced Scroll Manager
 * Unified scroll handling with Swup integration to resolve multiple listener conflicts
 * Integrates functionality from swup-scroll-optimizer for optimal performance
 */

type ScrollCallback = (scrollTop: number) => void;

interface ScrollPosition {
	hash?: string;
	top?: number;
	behavior?: ScrollBehavior;
}
interface ScrollRequest {
	priority: number;
	callback: ScrollCallback;
	id: string;
}

interface ScrollState {
	scrollTop: number;
	isScrolling: boolean;
	lastScrollTime: number;
	isTransitioning: boolean;
	pendingScroll: ScrollPosition | null;
	animationFrameId: number | null;
	resizeTimer: number | null;
}

/**
 * Scroll Constants
 * Centralized configuration for consistent scroll behavior
 */
const SCROLL_CONSTANTS = {
	THROTTLE_MS: 16, // ~60fps
	OFFSET_PX: 160, // Standard offset for all scroll operations
	BANNER_HEIGHT_RATIO: 0.35, // 35vh
	NAVBAR_HEIGHT: 72,
	THRESHOLD_OFFSET: 16,
} as const;

/**
 * Scroll Utility Functions
 * Reusable scroll-related calculations
 */
export const ScrollUtils = {
	/**
	 * Get current scroll position
	 */
	getScrollTop(): number {
		return Math.max(
			document.body.scrollTop,
			document.documentElement.scrollTop,
		);
	},

	/**
	 * Get banner height based on viewport
	 */
	getBannerHeight(): number {
		return window.innerHeight * SCROLL_CONSTANTS.BANNER_HEIGHT_RATIO;
	},

	/**
	 * Get scroll threshold for navbar visibility
	 */
	getThreshold(): number {
		return (
			this.getBannerHeight() -
			SCROLL_CONSTANTS.NAVBAR_HEIGHT -
			SCROLL_CONSTANTS.THRESHOLD_OFFSET
		);
	},

	/**
	 * Calculate target scroll position with standard offset
	 */
	calculateTargetPosition(element: HTMLElement): number {
		const rect = element.getBoundingClientRect();
		const scrollTop = this.getScrollTop();
		return scrollTop + rect.top - SCROLL_CONSTANTS.OFFSET_PX;
	},

	/**
	 * Smooth scroll to element with standard offset
	 */
	smoothScrollToElement(element: HTMLElement): void {
		const targetPosition = this.calculateTargetPosition(element);

		window.scrollTo({
			top: targetPosition,
			behavior: "smooth",
		});
	},

	/**
	 * Smooth scroll to hash with standard offset
	 */
	smoothScrollToHash(hash: string): boolean {
		const elementId = hash.substring(1);
		const targetElement = document.getElementById(elementId);

		if (targetElement) {
			this.smoothScrollToElement(targetElement);

			// Update URL without page reload
			if (window.history?.pushState) {
				window.history.pushState(null, "", hash);
			}
			return true;
		}
		return false;
	},
};

/**
 * Unified Scroll Manager
 * Coordinates all scroll-related operations and resolves conflicts
 */
export class ScrollManager {
	// === SINGLETON INSTANCE ===
	private static instance: ScrollManager;

	// === CORE CONFIG ===
	private readonly THROTTLE_MS = 16; // ~60fps
	private readonly RESIZE_DEBOUNCE_MS = 100;

	// === SCROLL STATE ===
	private state: ScrollState = {
		scrollTop: 0,
		isScrolling: false,
		lastScrollTime: 0,
		isTransitioning: false,
		pendingScroll: null,
		animationFrameId: null,
		resizeTimer: null,
	};

	// === EVENT HANDLERS ===
	private ticking = false;
	private boundScrollHandler: (() => void) | null = null;
	private boundResizeHandler: (() => void) | null = null;

	// === CALLBACK MANAGEMENT ===
	private callbacks: ScrollRequest[] = [];

	// === CONSTRUCTOR ===
	private constructor() {
		// Initialize manager
		this.init();
	}

	/**
	 * Get singleton instance
	 */
	public static getInstance(): ScrollManager {
		if (!ScrollManager.instance) {
			ScrollManager.instance = new ScrollManager();
		}
		return ScrollManager.instance;
	}

	/**
	 * Initialize scroll manager with enhanced Swup integration
	 */
	private init(): void {
		// Bind handlers with proper context
		this.boundScrollHandler = this.throttledScrollHandler.bind(this);
		this.boundResizeHandler = this.handleResize.bind(this);

		// Add passive event listeners (performance optimization)
		window.addEventListener("scroll", this.boundScrollHandler, {
			passive: true,
		});
		window.addEventListener("resize", this.boundResizeHandler, {
			passive: true,
		});

		// Initialize Swup integration
		this.initSwupIntegration();

		// Populate initial cache
		this.cacheElements();
		this.cacheMeasurements();

		// Set initial scroll state
		this.state.scrollTop = ScrollUtils.getScrollTop();
	}

	/**
	 * Initialize Swup integration for page transition handling
	 */
	private initSwupIntegration(): void {
		const contentReplacedHandler = (event: Event) => {
			this.handleContentReplaced(event as CustomEvent);
		};
		const animationOutDoneHandler = () => this.handleAnimationOutDone();
		const animationInDoneHandler = () => this.handleAnimationInDone();
		const willReplaceContentHandler = () => {
			this.state.isTransitioning = true;
		};

		// Register Swup event listeners
		document.addEventListener("swup:contentReplaced", contentReplacedHandler);
		document.addEventListener("swup:animationOutDone", animationOutDoneHandler);
		document.addEventListener("swup:animationInDone", animationInDoneHandler);
		document.addEventListener(
			"swup:willReplaceContent",
			willReplaceContentHandler,
		);
	}

	/**
	 * Cache DOM elements to avoid repeated querySelector calls (performance)
	 */
	private cacheElements(): void {}

	/**
	 * Cache layout measurements to avoid reflow/repaint (performance)
	 */
	private cacheMeasurements(): void {
		// 35vh
	}

	/**
	 * Throttled scroll handler (60fps cap) to prevent excessive function calls
	 */
	private throttledScrollHandler(): void {
		const now = Date.now();

		// Skip if last scroll was too recent (throttle)
		if (now - this.state.lastScrollTime < this.THROTTLE_MS) return;

		this.state.lastScrollTime = now;
		this.state.isScrolling = true;

		// Use requestAnimationFrame for smooth rendering
		if (!this.ticking) {
			requestAnimationFrame(() => {
				this.processScroll();
				this.ticking = false;
			});
			this.ticking = true;
		}
	}

	/**
	 * Handle Swup content replacement event
	 */
	private handleContentReplaced(_event: CustomEvent): void {
		// Cancel pending animation frames
		if (this.state.animationFrameId) {
			cancelAnimationFrame(this.state.animationFrameId);
		}

		// Refresh cache after content update
		this.cacheElements();
		this.cacheMeasurements();

		// Determine target scroll position (hash or top)
		const hash = window.location.hash;
		const scrollPosition: ScrollPosition = hash
			? { hash, behavior: "smooth" }
			: { top: 0, behavior: "smooth" };

		// Schedule scroll for next animation frame
		this.scheduleDelayedScroll(scrollPosition);
	}

	/**
	 * Handle Swup animation out completion
	 */
	private handleAnimationOutDone(): void {
		// No-op - wait for animationInDone to execute pending scroll
	}

	/**
	 * Handle Swup animation in completion (safe to scroll)
	 */
	private handleAnimationInDone(): void {
		this.state.isTransitioning = false;

		// Execute pending scroll if exists
		if (this.state.pendingScroll) {
			this.executeScroll(this.state.pendingScroll);
			this.state.pendingScroll = null;
		}
	}

	/**
	 * Schedule scroll operation (delayed until transition ends)
	 */
	private scheduleDelayedScroll(scrollPosition: ScrollPosition): void {
		this.state.pendingScroll = scrollPosition;

		this.state.animationFrameId = requestAnimationFrame(() => {
			if (!this.state.isTransitioning && this.state.pendingScroll) {
				this.executeScroll(this.state.pendingScroll);
				this.state.pendingScroll = null;
			}
			this.state.animationFrameId = null;
		});
	}

	/**
	 * Execute actual scroll operation
	 */
	private executeScroll(scrollRequest: ScrollPosition): void {
		if ("hash" in scrollRequest && scrollRequest.hash) {
			ScrollUtils.smoothScrollToHash(scrollRequest.hash);
		} else {
			window.scrollTo({
				top: scrollRequest.top ?? 0,
				behavior: scrollRequest.behavior ?? "smooth",
			});
		}
	}

	/**
	 * Process scroll state and execute registered callbacks
	 */
	private processScroll(): void {
		this.state.scrollTop = ScrollUtils.getScrollTop();

		// Sort callbacks by priority (higher = first)
		const sortedCallbacks = [...this.callbacks].sort(
			(a, b) => b.priority - a.priority,
		);

		// Execute callbacks with error handling
		sortedCallbacks.forEach((request) => {
			try {
				request.callback(this.state.scrollTop);
			} catch (error) {
				console.warn(`Scroll callback ${request.id} failed:`, error);
			}
		});

		this.state.isScrolling = false;
	}

	/**
	 * Debounced resize handler (update cache on viewport change)
	 */
	private handleResize(): void {
		// Clear existing timer to prevent multiple calls
		if (this.state.resizeTimer) clearTimeout(this.state.resizeTimer);

		// Debounce resize handling
		this.state.resizeTimer = window.setTimeout(() => {
			this.state.scrollTop = ScrollUtils.getScrollTop();
			this.cacheMeasurements();
			this.cacheElements();
			this.processScroll(); // Update UI based on new measurements
			this.state.resizeTimer = null;
		}, this.RESIZE_DEBOUNCE_MS);
	}

	/**
	 * Register scroll callback with priority (overwrites existing by ID)
	 */
	public registerCallback(
		id: string,
		callback: ScrollCallback,
		priority = 0,
	): void {
		// Remove existing callback with same ID
		this.callbacks = this.callbacks.filter((req) => req.id !== id);
		// Add new callback
		this.callbacks.push({ id, callback, priority });
	}

	/**
	 * Public method: Scroll to element by hash selector
	 */
	public scrollToElement(
		selector: string,
		behavior: ScrollBehavior = "smooth",
	): void {
		if (this.state.isTransitioning) {
			this.state.pendingScroll = { hash: selector, behavior };
		} else {
			this.executeScroll({ hash: selector, behavior });
		}
	}

	/**
	 * Public method: Scroll to top of page
	 */
	public scrollToTop(behavior: ScrollBehavior = "smooth"): void {
		if (this.state.isTransitioning) {
			this.state.pendingScroll = { top: 0, behavior };
		} else {
			this.executeScroll({ top: 0, behavior });
		}
	}

	/**
	 * Cleanup resources (event listeners, timers, cache)
	 */
	public destroy(): void {
		// Clear animation frames and timers
		if (this.state.animationFrameId)
			cancelAnimationFrame(this.state.animationFrameId);
		if (this.state.resizeTimer) clearTimeout(this.state.resizeTimer);

		// Reset state
		this.state.pendingScroll = null;

		// Remove event listeners
		if (this.boundScrollHandler) {
			window.removeEventListener("scroll", this.boundScrollHandler);
		}
		if (this.boundResizeHandler) {
			window.removeEventListener("resize", this.boundResizeHandler);
		}

		// Clear callbacks
		this.callbacks = [];
	}
}

// Export singleton instance (explicit type for isolatedDeclarations)
export const scrollManager: ScrollManager = ScrollManager.getInstance();

// Export utility functions (explicit type annotations to fix TS9010)
export const getScrollTop: () => number = ScrollUtils.getScrollTop;
export const getBannerHeight: () => number = ScrollUtils.getBannerHeight;
export const getThreshold: () => number = ScrollUtils.getThreshold;
export const smoothScrollToHash: (hash: string) => boolean =
	ScrollUtils.smoothScrollToHash;
