/**
 * Swup Plugin Manager
 * Controls the timing of SwupHeadPlugin and SwupScriptsPlugin execution
 * to prevent DOM operations during page transition animations
 */

interface PendingPluginOperation {
	type: "head" | "scripts";
	action: () => void;
}

class SwupPluginManager {
	private pendingOperations: PendingPluginOperation[] = [];
	private isTransitioning = false;
	private transitionEndTimeout: number | null = null;

	constructor() {
		this.init();
	}

	private init(): void {
		// Listen for Swup transition events
		document.addEventListener(
			"swup:willReplaceContent",
			this.handleTransitionStart.bind(this),
		);
		document.addEventListener(
			"swup:animationInDone",
			this.handleTransitionEnd.bind(this),
		);

		// Also listen for transitionEnd as fallback
		document.addEventListener(
			"swup:transitionEnd",
			this.handleTransitionEnd.bind(this),
		);
	}

	/**
	 * Handle transition start - pause plugin operations
	 */
	private handleTransitionStart(): void {
		this.isTransitioning = true;

		// Clear any pending timeout
		if (this.transitionEndTimeout) {
			clearTimeout(this.transitionEndTimeout);
			this.transitionEndTimeout = null;
		}
	}

	/**
	 * Handle transition end - resume plugin operations
	 */
	private handleTransitionEnd(): void {
		// Execute immediately without delay for better responsiveness
		this.isTransitioning = false;
		this.executePendingOperations();
	}

	/**
	 * Schedule head update operation
	 */
	public scheduleHeadUpdate(updateFn: () => void): void {
		const operation: PendingPluginOperation = {
			type: "head",
			action: updateFn,
		};

		if (this.isTransitioning) {
			// Queue for later execution
			this.pendingOperations.push(operation);
		} else {
			// Execute immediately if not transitioning
			this.executeOperation(operation);
		}
	}

	/**
	 * Schedule scripts execution operation
	 */
	public scheduleScriptsExecution(executeFn: () => void): void {
		const operation: PendingPluginOperation = {
			type: "scripts",
			action: executeFn,
		};

		if (this.isTransitioning) {
			// Queue for later execution
			this.pendingOperations.push(operation);
		} else {
			// Execute immediately if not transitioning
			this.executeOperation(operation);
		}
	}

	/**
	 * Execute a single operation with error handling
	 */
	private executeOperation(operation: PendingPluginOperation): void {
		try {
			operation.action();
		} catch (error) {
			console.warn(`Swup plugin operation failed (${operation.type}):`, error);
		}
	}

	/**
	 * Execute all pending operations
	 */
	private executePendingOperations(): void {
		// Sort operations: head updates first, then scripts
		const sortedOperations = [...this.pendingOperations].sort((a, b) => {
			if (a.type === "head" && b.type === "scripts") return -1;
			if (a.type === "scripts" && b.type === "head") return 1;
			return 0;
		});

		// Execute operations immediately without artificial delays
		sortedOperations.forEach((operation) => {
			this.executeOperation(operation);
		});

		// Clear pending operations
		this.pendingOperations = [];
	}
	/**
	 * Cleanup method
	 */
	public destroy(): void {
		if (this.transitionEndTimeout) {
			clearTimeout(this.transitionEndTimeout);
		}
		this.pendingOperations = [];
	}
}

// Export singleton instance
export const swupPluginManager: SwupPluginManager = new SwupPluginManager();

// Auto-initialize when module loads
if (typeof window !== "undefined") {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", () => {
			// Initialization happens in constructor
		});
	}
}
