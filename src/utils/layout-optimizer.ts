/**
 * Simplified Layout Utilities
 * Removed complex batching and caching while preserving core functionality
 */

/**
 * Optimized Scroll Handler
 * Uses standard scroll event handling with minimal optimization
 */
export class OptimizedScrollHandler {
	private ticking = false;

	constructor() {
		this.init();
	}

	private init(): void {
		// Use passive event listener for better performance
		window.addEventListener("scroll", this.onScroll.bind(this), {
			passive: true,
		});

		window.addEventListener("resize", this.onResize.bind(this), {
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

	private initKeyboardListener(): void {
		document.addEventListener("keydown", (event) => {
			// Handle Home key - scroll to top
			if (event.key === "Home") {
				this.updateNavbarVisibility();
			}
			// Handle End key - scroll to bottom
			else if (event.key === "End") {
				this.updateNavbarVisibility();
			}
		});
	}

	private onResize(): void {
		// Simple resize handler
		this.updateNavbarVisibility();
	}

	private initializeNavbarState(): void {
		// Initialize without artificial delays
		this.updateNavbarVisibility();
	}

	private onScroll(): void {
		// Simple scroll throttling with requestAnimationFrame
		if (!this.ticking) {
			requestAnimationFrame(() => {
				this.processScroll();
				this.ticking = false;
			});
			this.ticking = true;
		}
	}

	private processScroll(): void {
		const scrollTop = Math.max(
			document.body.scrollTop,
			document.documentElement.scrollTop,
		);

		const bannerHeight = window.innerHeight * (35 / 100);
		const navbarHeight = 72;

		// Update back-to-top button
		const backToTopBtn = document.getElementById("back-to-top-btn");
		if (backToTopBtn) {
			if (scrollTop > bannerHeight) {
				backToTopBtn.classList.remove("hide");
			} else {
				backToTopBtn.classList.add("hide");
			}
		}

		// Update TOC visibility
		const toc = document.getElementById("toc-wrapper");
		if (toc) {
			if (scrollTop > bannerHeight) {
				toc.classList.remove("toc-hide");
			} else {
				toc.classList.add("toc-hide");
			}
		}

		// Update navbar visibility
		const navbar = document.getElementById("navbar-wrapper");
		if (navbar) {
			const threshold = bannerHeight - navbarHeight - 16;
			if (scrollTop >= threshold) {
				navbar.classList.add("navbar-hidden");
			} else {
				navbar.classList.remove("navbar-hidden");
			}
		}
	}

	private updateNavbarVisibility(): void {
		// Direct DOM manipulation without batching
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
	}
}

/**
 * Simplified TOC Scroller
 * Basic scroll functionality without complex optimization
 */
export class OptimizedTOCScroller {
	private readonly tocEl: HTMLElement | null = null;

	constructor(tocElement: HTMLElement) {
		this.tocEl = tocElement;
	}

	scrollToActiveHeading(topmost: HTMLElement, bottommost: HTMLElement): void {
		if (!this.tocEl) return;

		// Simple scroll calculation without caching
		const tocHeight = this.tocEl.clientHeight;
		const topmostRect = topmost.getBoundingClientRect();
		const bottommostRect = bottommost.getBoundingClientRect();

		let targetTop: number;
		if (bottommostRect.bottom - topmostRect.top < 0.9 * tocHeight) {
			targetTop = topmost.offsetTop - 32;
		} else {
			const bottommostOffsetTop = bottommost.offsetTop;
			targetTop = bottommostOffsetTop - tocHeight * 0.8;
		}

		// Direct scroll without batching
		this.tocEl.scrollTo({
			top: targetTop,
			left: 0,
			behavior: "smooth",
		});
	}
}

// Export singleton instance
new OptimizedScrollHandler();
