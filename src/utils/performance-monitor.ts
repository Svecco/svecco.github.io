/**
 * 性能监控和分析工具
 */

// 定义内存信息接口
interface MemoryInfo {
	usedJSHeapSize: number;
	totalJSHeapSize: number;
	jsHeapSizeLimit: number;
}

interface PerformanceMetrics {
	firstContentfulPaint?: number;
	largestContentfulPaint?: number;
	firstInputDelay?: number;
	cumulativeLayoutShift?: number;
	interactionToNextPaint?: number;
	longTasks?: number;
	memoryUsage?: MemoryInfo;
}

class PerformanceMonitor {
	private metrics: PerformanceMetrics = {};
	private observer: PerformanceObserver | null = null;
	private longTaskObserver: PerformanceObserver | null = null;

	constructor() {
		this.initPerformanceMonitoring();
	}

	/**
	 * 初始化性能监控
	 */
	private initPerformanceMonitoring(): void {
		if (typeof window === "undefined" || !window.performance) return;

		// 监控核心Web Vitals指标
		this.observeCoreVitals();

		// 监控长任务
		this.observeLongTasks();

		// 页面加载完成后收集初始指标
		if (document.readyState === "complete") {
			this.collectInitialMetrics();
		} else {
			window.addEventListener("load", () => {
				this.collectInitialMetrics();
			});
		}
	}

	/**
	 * 观察核心Web Vitals
	 */
	private observeCoreVitals(): void {
		if (!("PerformanceObserver" in window)) return;

		// 观察paint指标
		try {
			this.observer = new PerformanceObserver((list) => {
				for (const entry of list.getEntries()) {
					if (entry.name === "first-contentful-paint") {
						this.metrics.firstContentfulPaint = entry.startTime;
					} else if (entry.name === "largest-contentful-paint") {
						this.metrics.largestContentfulPaint = entry.startTime;
					}
				}
			});

			this.observer.observe({
				entryTypes: ["paint", "largest-contentful-paint"],
			});
		} catch (_e) {
			console.warn("PerformanceObserver not supported for paint metrics");
		}
	}

	/**
	 * 观察长任务
	 */
	private observeLongTasks(): void {
		if (!("PerformanceObserver" in window)) return;

		try {
			this.longTaskObserver = new PerformanceObserver((list) => {
				const longTasks = list
					.getEntries()
					.filter((entry) => entry.duration > 50);
				this.metrics.longTasks =
					(this.metrics.longTasks || 0) + longTasks.length;
			});

			this.longTaskObserver.observe({ entryTypes: ["longtask"] });
		} catch (_e) {
			console.warn("PerformanceObserver not supported for long tasks");
		}
	}

	/**
	 * 收集初始性能指标
	 */
	private collectInitialMetrics(): void {
		// 收集内存使用情况
		if ("memory" in performance) {
			this.metrics.memoryUsage = (performance as { memory: MemoryInfo }).memory;
		}

		// 收集首次输入延迟模拟数据
		this.simulateFirstInputDelay();

		// 输出性能报告
		this.reportPerformance();
	}

	/**
	 * 模拟首次输入延迟测量
	 */
	private simulateFirstInputDelay(): void {
		const startTime = performance.now();

		// 监听首次用户交互
		const handleFirstInput = () => {
			const delay = performance.now() - startTime;
			this.metrics.firstInputDelay = delay;

			// 清理事件监听器
			["click", "keydown", "mousedown"].forEach((event) => {
				document.removeEventListener(event, handleFirstInput as EventListener);
			});
		};

		["click", "keydown", "mousedown"].forEach((event) => {
			document.addEventListener(event, handleFirstInput as EventListener, {
				once: true,
			});
		});
	}

	/**
	 * 生成性能报告
	 */
	private reportPerformance(): void {
		if (import.meta.env.DEV) {
			console.group("🎨 Performance Report");
			console.table({
				"First Contentful Paint": `${this.metrics.firstContentfulPaint?.toFixed(2) || "N/A"}ms`,
				"Largest Contentful Paint": `${this.metrics.largestContentfulPaint?.toFixed(2) || "N/A"}ms`,
				"First Input Delay": `${this.metrics.firstInputDelay?.toFixed(2) || "N/A"}ms`,
				"Long Tasks (>50ms)": this.metrics.longTasks || 0,
				"Memory Usage": this.metrics.memoryUsage
					? `${(this.metrics.memoryUsage.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`
					: "N/A",
			});
			console.groupEnd();
		}
	}

	/**
	 * 测量特定操作的性能
	 */
	measureOperation<T>(name: string, operation: () => T): T {
		const start = performance.now();

		try {
			const result = operation();
			const end = performance.now();

			if (import.meta.env.DEV) {
				console.log(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`);
			}

			return result;
		} catch (error) {
			const end = performance.now();
			console.error(
				`❌ ${name} failed after ${(end - start).toFixed(2)}ms:`,
				error,
			);
			throw error;
		}
	}

	/**
	 * 标记重要时刻
	 */
	mark(name: string): void {
		if (typeof performance !== "undefined" && performance.mark) {
			performance.mark(name);
		}
	}

	/**
	 * 测量两个标记之间的时间
	 */
	measure(name: string, startMark: string, endMark: string): void {
		if (typeof performance !== "undefined" && performance.measure) {
			try {
				performance.measure(name, startMark, endMark);
				if (import.meta.env.DEV) {
					const measure = performance.getEntriesByName(name).pop();
					if (measure) {
						console.log(`📏 ${name}: ${measure.duration.toFixed(2)}ms`);
					}
				}
			} catch (e) {
				console.warn("Performance measurement failed:", e);
			}
		}
	}

	/**
	 * 获取当前性能指标
	 */
	getMetrics(): PerformanceMetrics {
		return { ...this.metrics };
	}

	/**
	 * 清理资源
	 */
	destroy(): void {
		this.observer?.disconnect();
		this.longTaskObserver?.disconnect();
	}
}

// 创建全局性能监控实例
export const performanceMonitor: PerformanceMonitor = new PerformanceMonitor();

// 导出便捷函数
export const measure: <T>(name: string, operation: () => T) => T =
	performanceMonitor.measureOperation.bind(performanceMonitor);
export const mark: (name: string) => void =
	performanceMonitor.mark.bind(performanceMonitor);
export const measureBetween: (
	name: string,
	startMark: string,
	endMark: string,
) => void = performanceMonitor.measure.bind(performanceMonitor);
