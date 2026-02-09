/**
 * Layout Optimization Utilities
 * Fixes forced synchronous layouts by separating read/write operations
 */

/**
 * Layout Read Cache - Cache expensive layout reads
 */
class LayoutCache {
	private cache: Map<string, { value: unknown; timestamp: number }> = new Map();
	private readonly CACHE_DURATION = 100; // ms

	get<T>(key: string, getter: () => T): T {
		const cached = this.cache.get(key);
		const now = Date.now();

		if (cached && now - cached.timestamp < this.CACHE_DURATION) {
			return cached.value as T;
		}

		const value = getter();
		this.cache.set(key, { value, timestamp: now });
		return value;
	}

	clear(): void {
		this.cache.clear();
	}
}

export const layoutCache: LayoutCache = new LayoutCache();

/**
 * Batched Layout Operations
 * Separates reads and writes to prevent forced synchronous layouts
 */
class LayoutBatcher {
	private readOperations: Array<() => unknown> = [];
	private writeOperations: Array<() => void> = [];
	private scheduled = false;

	/**
	 * Schedule a read operation (non-layout affecting)
	 */
	read<T>(operation: () => T): Promise<T> {
		return new Promise((resolve) => {
			this.readOperations.push(() => {
				try {
					const result = operation();
					resolve(result);
				} catch (error) {
					console.warn("Layout read operation failed:", error);
					// @ts-expect-error
					resolve(undefined as unknown);
				}
			});
			this.scheduleBatch();
		});
	}

	/**
	 * Schedule a write operation (may affect layout)
	 */
	write(operation: () => void): Promise<void> {
		return new Promise((resolve) => {
			this.writeOperations.push(() => {
				try {
					operation();
					resolve();
				} catch (error) {
					console.warn("Layout write operation failed:", error);
					resolve();
				}
			});
			this.scheduleBatch();
		});
	}

	/**
	 * Schedule batch execution using requestAnimationFrame
	 */
	private scheduleBatch(): void {
		if (this.scheduled) return;
		this.scheduled = true;

		requestAnimationFrame(() => {
			// First: Execute all read operations
			this.readOperations.forEach((op) => void op());
			this.readOperations = [];

			// Then: Execute all write operations
			this.writeOperations.forEach((op) => void op());
			this.writeOperations = [];

			this.scheduled = false;
		});
	}
}

export const layoutBatcher: LayoutBatcher = new LayoutBatcher();

/**
 * Optimized Scroll Handler
 * Prevents forced synchronous layouts in scroll events
 */
export class OptimizedScrollHandler {
	private ticking = false;
	private cachedHeights: { bannerHeight: number; navbarHeight: number } | null =
		null;
	lastScrollTop: number | undefined;

	constructor() {
		this.init();
	}

	private init(): void {
		// Use passive event listener for better performance
		window.addEventListener("scroll", this.onScroll.bind(this), {
			passive: true,
		});
		window.addEventListener("resize", this.invalidateCache.bind(this), {
			passive: true,
		});

		// Add keyboard event listener for Home/End key navigation
		this.initKeyboardListener();

		// Initialize navbar state on page load
		if (document.readyState === "loading") {
			document.addEventListener("DOMContentLoaded", () => {
				this.initializeNavbarState();
			});
		} else {
			this.initializeNavbarState();
		}
	}

	private invalidateCache(): void {
		this.cachedHeights = null;
		layoutCache.clear();
	}

	/**
	 * Initialize keyboard event listener for Home/End key navigation
	 * Ensures navbar visibility updates when using keyboard shortcuts
	 */
	private initKeyboardListener(): void {
		document.addEventListener("keydown", (event) => {
			// Handle Home key - scroll to top
			if (event.key === "Home") {
				this.forceNavbarUpdate();
			}
			// Handle End key - scroll to bottom
			else if (event.key === "End") {
				this.forceNavbarUpdate();
			}
		});
	}

	/**
	 * Force navbar state update regardless of scroll throttling
	 * Used for keyboard navigation and initial state setup
	 */
	private forceNavbarUpdate(): void {
		layoutBatcher
			.write(() => {
				const scrollTop = Math.max(
					document.body.scrollTop,
					document.documentElement.scrollTop,
				);

				const navbar = document.getElementById("navbar-wrapper");
				if (navbar) {
					const bannerHeight = window.innerHeight * (35 / 100);
					const navbarHeight = 72;
					const threshold = bannerHeight - navbarHeight - 16;

					if (scrollTop >= threshold) {
						navbar.classList.add("navbar-hidden");
					} else {
						navbar.classList.remove("navbar-hidden");
					}
				}
			})
			.catch(console.warn);
	}

	/**
	 * Initialize navbar state on page load
	 * Ensures consistent state between server-side rendering and client-side behavior
	 */
	private initializeNavbarState(): void {
		// Execute immediately without delay
		this.forceNavbarUpdate();
	}

	private onScroll(): void {
		// Simplified throttling without artificial delays
		if (!this.ticking) {
			requestAnimationFrame(() => {
				this.processScroll();
				this.ticking = false;
			});
			this.ticking = true;
		}
	}

	private processScroll(): void {
		// Batch all scroll-related operations
		layoutBatcher
			.write(() => {
				const scrollTop = layoutCache.get("scrollTop", () =>
					Math.max(document.body.scrollTop, document.documentElement.scrollTop),
				);

				// Only recalculate heights when needed
				if (!this.cachedHeights) {
					this.cachedHeights = {
						bannerHeight: window.innerHeight * (35 / 100), // BANNER_HEIGHT
						navbarHeight: 72, // NAVBAR_HEIGHT
					};
				}

				const { bannerHeight, navbarHeight } = this.cachedHeights;

				// Batch DOM class manipulations
				const backToTopBtn = document.getElementById("back-to-top-btn");
				const toc = document.getElementById("toc-wrapper");
				const navbar = document.getElementById("navbar-wrapper");

				if (backToTopBtn) {
					if (scrollTop > bannerHeight) {
						backToTopBtn.classList.remove("hide");
					} else {
						backToTopBtn.classList.add("hide");
					}
				}

				if (toc) {
					if (scrollTop > bannerHeight) {
						toc.classList.remove("toc-hide");
					} else {
						toc.classList.add("toc-hide");
					}
				}

				if (navbar) {
					const threshold = bannerHeight - navbarHeight - 16;
					if (scrollTop >= threshold) {
						navbar.classList.add("navbar-hidden");
					} else {
						navbar.classList.remove("navbar-hidden");
					}
				}

				this.lastScrollTop = scrollTop;
			})
			.catch((error) => {
				console.warn("Scroll processing failed:", error);
			});
	}
}

/**
 * Optimized TOC Scroller
 * Replaces forced synchronous layouts in TOC component
 */
export class OptimizedTOCScroller {
	private readonly tocEl: HTMLElement | null = null;
	private batchedUpdates: Array<() => void> = [];
	private updateScheduled = false;

	constructor(tocElement: HTMLElement) {
		this.tocEl = tocElement;
	}

	/**
	 * Optimized scroll to active heading
	 * Uses cached measurements and batched operations
	 */
	scrollToActiveHeading(topmost: HTMLElement, bottommost: HTMLElement): void {
		if (!this.tocEl) return;

		// Cache expensive layout reads
		const tocHeight = layoutCache.get(
			"tocHeight",
			() => this.tocEl?.clientHeight,
		);

		const topmostRect = layoutCache.get("topmostRect", () =>
			topmost.getBoundingClientRect(),
		);
		const bottommostRect = layoutCache.get("bottommostRect", () =>
			bottommost.getBoundingClientRect(),
		);

		// Calculate target position without forcing layout
		let targetTop: number;
		// @ts-expect-error
		if (bottommostRect.bottom - topmostRect.top < 0.9 * tocHeight) {
			targetTop =
				layoutCache.get("topmostOffsetTop", () => topmost.offsetTop) - 32;
		} else {
			const bottommostOffsetTop = layoutCache.get(
				"bottommostOffsetTop",
				() => bottommost.offsetTop,
			);
			// @ts-expect-error
			targetTop = bottommostOffsetTop - tocHeight * 0.8;
		}

		// Batch the scroll operation
		this.batchedUpdates.push(() => {
			if (this.tocEl) {
				this.tocEl.scrollTo({
					top: targetTop,
					left: 0,
					behavior: "smooth",
				});
			}
		});

		this.scheduleUpdate();
	}

	private scheduleUpdate(): void {
		if (this.updateScheduled) return;
		this.updateScheduled = true;

		requestAnimationFrame(() => {
			this.batchedUpdates.forEach((update) => void update());
			this.batchedUpdates = [];
			this.updateScheduled = false;
		});
	}
}

// Export singleton instances
new OptimizedScrollHandler();
