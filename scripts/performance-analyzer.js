/**
 * Automated Performance Analyzer
 * Analyzes CPU usage patterns and identifies performance bottlenecks
 */

class PerformanceAnalyzer {
	constructor() {
		this.metrics = {
			scrollEvents: 0,
			intersectionCallbacks: 0,
			layoutThrashing: 0,
			longTasks: [],
			memoryUsage: null,
			animationFrames: 0,
		};

		this.observers = [];
		this.setupMonitoring();
	}

	setupMonitoring() {
		// Monitor scroll events
		this.monitorScrollEvents();

		// Monitor IntersectionObserver callbacks
		this.monitorIntersectionObservers();

		// Monitor long tasks
		this.monitorLongTasks();

		// Monitor animation frames
		this.monitorAnimationFrames();

		// Monitor memory usage
		this.monitorMemory();
	}

	monitorScrollEvents() {
		const originalAddEventListener = EventTarget.prototype.addEventListener;
		const analyzer = this;

		EventTarget.prototype.addEventListener = function (
			type,
			listener,
			options,
		) {
			if (type === "scroll") {
				analyzer.metrics.scrollEvents++;
				console.log(
					`[PERF] Scroll event listener added. Total: ${analyzer.metrics.scrollEvents}`,
				);
			}
			return originalAddEventListener.call(this, type, listener, options);
		};
	}

	monitorIntersectionObservers() {
		const originalIntersectionObserver = window.IntersectionObserver;

		window.IntersectionObserver = (callback, options) => {
			const wrappedCallback = (entries, observer) => {
				this.metrics.intersectionCallbacks++;
				// Log frequent callbacks
				if (this.metrics.intersectionCallbacks % 10 === 0) {
					console.log(
						`[PERF] IntersectionObserver callback triggered ${this.metrics.intersectionCallbacks} times`,
					);
				}
				return callback(entries, observer);
			};

			const instance = new originalIntersectionObserver(
				wrappedCallback,
				options,
			);
			this.observers.push(instance);
			return instance;
		};
	}

	monitorLongTasks() {
		if ("PerformanceObserver" in window) {
			const observer = new PerformanceObserver((list) => {
				list.getEntries().forEach((entry) => {
					if (entry.duration > 50) {
						// Long task threshold
						this.metrics.longTasks.push({
							duration: entry.duration,
							startTime: entry.startTime,
							timestamp: Date.now(),
						});

						console.warn(`[PERF] Long task detected: ${entry.duration}ms`);
					}
				});
			});

			observer.observe({ entryTypes: ["longtask"] });
		}
	}

	monitorAnimationFrames() {
		const originalRAF = window.requestAnimationFrame;
		const analyzer = this;

		window.requestAnimationFrame = function (callback) {
			analyzer.metrics.animationFrames++;
			return originalRAF.call(this, callback);
		};
	}

	monitorMemory() {
		if ("memory" in performance) {
			setInterval(() => {
				this.metrics.memoryUsage = {
					used: performance.memory.usedJSHeapSize,
					total: performance.memory.totalJSHeapSize,
					limit: performance.memory.jsHeapSizeLimit,
				};
			}, 2000);
		}
	}

	generateReport() {
		const report = {
			timestamp: new Date().toISOString(),
			summary: {
				totalScrollListeners: this.metrics.scrollEvents,
				totalIntersectionCallbacks: this.metrics.intersectionCallbacks,
				longTasksDetected: this.metrics.longTasks.length,
				animationFramesRequested: this.metrics.animationFrames,
				memoryUsage: this.metrics.memoryUsage,
			},
			details: {
				longTasks: this.metrics.longTasks.slice(-10), // Last 10 long tasks
				memoryPeak: this.calculateMemoryPeak(),
			},
		};

		console.group("🔍 Performance Analysis Report");
		console.table(report.summary);
		console.groupEnd();

		return report;
	}

	calculateMemoryPeak() {
		if (!this.metrics.memoryUsage) return null;

		return {
			usedMB: (this.metrics.memoryUsage.used / 1024 / 1024).toFixed(2),
			totalMB: (this.metrics.memoryUsage.total / 1024 / 1024).toFixed(2),
			percentage: (
				(this.metrics.memoryUsage.used / this.metrics.memoryUsage.total) *
				100
			).toFixed(2),
		};
	}

	startAnalysis(duration = 10000) {
		console.log(`[PERF] Starting performance analysis for ${duration}ms...`);

		setTimeout(() => {
			this.generateReport();
			this.cleanup();
		}, duration);
	}

	cleanup() {
		this.observers.forEach((observer) => {
			observer.disconnect();
		});
		this.observers = [];
	}
}

// Auto-initialize when script loads
if (typeof window !== "undefined") {
	window.performanceAnalyzer = new PerformanceAnalyzer();

	// Start analysis automatically after page load
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", () => {
			window.performanceAnalyzer.startAnalysis(15000); // 15 second analysis
		});
	} else {
		window.performanceAnalyzer.startAnalysis(15000);
	}
}

export default PerformanceAnalyzer;
