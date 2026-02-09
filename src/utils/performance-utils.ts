/**
 * 性能优化工具函数
 */

/**
 * 防抖函数 - 限制函数执行频率
 * @param func 要防抖的函数
 * @param wait 等待时间(ms)
 * @param immediate 是否立即执行
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
	func: T,
	wait: number,
	immediate = false,
): (...args: Parameters<T>) => void {
	let timeout: NodeJS.Timeout | null = null;

	return function executedFunction(...args: Parameters<T>) {
		const later = () => {
			timeout = null;
			if (!immediate) func(...args);
		};

		const callNow = immediate && !timeout;

		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(later, wait);

		if (callNow) func(...args);
	};
}

/**
 * 节流函数 - 限制函数执行频率
 * @param func 要节流的函数
 * @param limit 时间间隔(ms)
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
	func: T,
	limit: number,
): (...args: Parameters<T>) => void {
	let inThrottle: boolean;

	return function executedFunction(...args: Parameters<T>) {
		if (!inThrottle) {
			func(...args);
			inThrottle = true;
			setTimeout(() => {
				inThrottle = false;
			}, limit);
		}
	};
}

/**
 * 动画帧节流 - 使用requestAnimationFrame优化动画性能
 * @param func 要优化的函数
 * @returns 优化后的函数
 */
export function rafThrottle<T extends (...args: unknown[]) => unknown>(
	func: T,
): (...args: Parameters<T>) => void {
	let scheduled = false;

	return function executedFunction(...args: Parameters<T>) {
		if (!scheduled) {
			scheduled = true;
			requestAnimationFrame(() => {
				func(...args);
				scheduled = false;
			});
		}
	};
}

/**
 * 懒加载Intersection Observer配置
 */
export const lazyLoadObserverOptions: IntersectionObserverInit = {
	rootMargin: "50px 0px", // 提前50px开始加载
	threshold: 0.01,
};

/**
 * 创建懒加载观察器
 * @param callback 加载回调函数
 * @returns IntersectionObserver实例
 */
export function createLazyLoadObserver(
	callback: IntersectionObserverCallback,
): IntersectionObserver {
	return new IntersectionObserver(callback, lazyLoadObserverOptions);
}

/**
 * 批量DOM操作优化 - 减少重排重绘
 * @param operations DOM操作函数数组
 */
export function batchDOMOperations(operations: (() => void)[]): void {
	// 使用requestAnimationFrame确保在下一帧执行
	requestAnimationFrame(() => {
		// 批量执行所有操作
		operations.forEach((op) => {
			op();
		});
	});
}

/**
 * 内存友好的事件监听器
 * 自动清理事件监听器，防止内存泄漏
 */
export class ManagedEventListener {
	private listeners: Array<{
		element: EventTarget;
		event: string;
		handler: EventListener;
		options?: boolean | AddEventListenerOptions;
	}> = [];

	add(
		element: EventTarget,
		event: string,
		handler: EventListener,
		options?: boolean | AddEventListenerOptions,
	): void {
		element.addEventListener(event, handler, options);
		this.listeners.push({ element, event, handler, options });
	}

	remove(element: EventTarget, event: string, handler: EventListener): void {
		element.removeEventListener(event, handler);
		this.listeners = this.listeners.filter(
			(listener) =>
				!(
					listener.element === element &&
					listener.event === event &&
					listener.handler === handler
				),
		);
	}

	cleanup(): void {
		this.listeners.forEach(({ element, event, handler, options }) => {
			element.removeEventListener(event, handler, options);
		});
		this.listeners = [];
	}
}
