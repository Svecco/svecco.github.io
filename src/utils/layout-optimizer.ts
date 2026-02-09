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
// Export singleton instance
new OptimizedScrollHandler();
