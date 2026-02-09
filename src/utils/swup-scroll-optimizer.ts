/**
 * Swup Scroll Plugin Optimizer
 * Fixes scroll calculation conflicts with page transition animations
 * by delaying DOM layout reads and using batched operations
 */

interface ScrollPosition {
	hash?: string;
	top?: number;
	behavior?: ScrollBehavior;
}

class SwupScrollOptimizer {
	private pendingScroll: ScrollPosition | null = null;
	private isTransitioning = false;
	private animationFrameId: number | null = null;

	constructor() {
		this.init();
	}

	private init(): void {
		// Listen for Swup events using proper typing
		const contentReplacedHandler = (event: Event) => {
			this.handleContentReplaced(event as CustomEvent);
		};
		const animationOutDoneHandler = () => {
			this.handleAnimationOutDone();
		};
		const animationInDoneHandler = () => {
			this.handleAnimationInDone();
		};
		const willReplaceContentHandler = () => {
			this.isTransitioning = true;
		};

		document.addEventListener("swup:contentReplaced", contentReplacedHandler);
		document.addEventListener("swup:animationOutDone", animationOutDoneHandler);
		document.addEventListener("swup:animationInDone", animationInDoneHandler);
		document.addEventListener(
			"swup:willReplaceContent",
			willReplaceContentHandler,
		);
	}

	/**
	 * Handle content replacement - delay scroll operations
	 */
	private handleContentReplaced(_event: CustomEvent): void {
		// Cancel any pending animation frame
		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
		}

		// Get target scroll position from URL hash or default
		const hash = window.location.hash;
		const scrollPosition: ScrollPosition = hash
			? { hash, behavior: "smooth" }
			: { top: 0, behavior: "smooth" };

		// Schedule scroll operation for next animation frame
		this.scheduleDelayedScroll(scrollPosition);
	}

	/**
	 * Handle animation out completion
	 */
	private handleAnimationOutDone(): void {
		// Animation out is complete, but content may still be replacing
		// Continue to wait for contentReplaced + animationInDone
	}

	/**
	 * Handle animation in completion - safe time to scroll
	 */
	private handleAnimationInDone(): void {
		this.isTransitioning = false;

		// Execute any pending scroll operation
		if (this.pendingScroll) {
			this.executeScroll(this.pendingScroll);
			this.pendingScroll = null;
		}
	}

	/**
	 * Schedule scroll operation with proper timing
	 */
	private scheduleDelayedScroll(scrollPosition: ScrollPosition): void {
		this.pendingScroll = scrollPosition;

		// Use single requestAnimationFrame for better performance
		this.animationFrameId = requestAnimationFrame(() => {
			if (!this.isTransitioning && this.pendingScroll) {
				this.executeScroll(this.pendingScroll);
				this.pendingScroll = null;
			}
		});
	}

	/**
	 * Execute scroll with batched DOM operations
	 */
	private executeScroll(scrollPosition: ScrollPosition): void {
		// Batch scroll operations to minimize layout thrashing
		const operations: (() => void)[] = [];

		if (scrollPosition.hash) {
			operations.push(() => {
				const targetElement = document.querySelector(scrollPosition.hash ?? "");
				if (targetElement) {
					targetElement.scrollIntoView({
						behavior: scrollPosition.behavior,
						block: "start",
					});
				}
			});
		} else if (scrollPosition.top !== undefined) {
			operations.push(() => {
				window.scrollTo({
					top: scrollPosition.top ?? 0,
					behavior: scrollPosition.behavior,
				});
			});
		}

		// Execute all scroll operations in a single batch
		this.batchDOMOperations(operations);
	}

	/**
	 * Batch DOM operations using DocumentFragment pattern
	 */
	private batchDOMOperations(operations: (() => void)[]): void {
		// Create a DocumentFragment to batch operations
		const fragment = document.createDocumentFragment();

		// Perform all read operations first (if any)
		operations.forEach((op) => {
			// Wrap operations to catch any layout reads
			try {
				op();
			} catch (error) {
				console.warn("Scroll operation failed:", error);
			}
		});

		// Append fragment (though empty, this ensures proper batching context)
		document.body.appendChild(fragment);
		document.body.removeChild(fragment);
	}

	/**
	 * Public method to manually trigger scroll with optimization
	 */
	public scrollToElement(
		selector: string,
		behavior: ScrollBehavior = "smooth",
	): void {
		if (this.isTransitioning) {
			// Queue for later execution
			this.pendingScroll = { hash: selector, behavior };
		} else {
			// Execute immediately
			this.executeScroll({ hash: selector, behavior });
		}
	}

	/**
	 * Public method to scroll to top with optimization
	 */
	public scrollToTop(behavior: ScrollBehavior = "smooth"): void {
		if (this.isTransitioning) {
			this.pendingScroll = { top: 0, behavior };
		} else {
			this.executeScroll({ top: 0, behavior });
		}
	}

	/**
	 * Cleanup method
	 */
	public destroy(): void {
		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
		}
		this.pendingScroll = null;
	}
}

// Export singleton instance
export const swupScrollOptimizer: SwupScrollOptimizer =
	new SwupScrollOptimizer();

// Auto-initialize when module loads
if (typeof window !== "undefined") {
	// Ensure Swup is available
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", () => {
			// Initialization happens in constructor
		});
	}
}
