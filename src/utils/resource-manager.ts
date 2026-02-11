interface ResourceConfig {
	url: string;
	type: "image" | "script" | "stylesheet" | "font";
	priority: "high" | "medium" | "low";
	condition?: () => boolean;
}

class ResourceManager {
	private loadedResources: Set<string> = new Set();
	private loadingQueue: ResourceConfig[] = [];
	private observer: IntersectionObserver;

	constructor() {
		this.observer = new IntersectionObserver(
			this.handleIntersection.bind(this),
			{
				rootMargin: "100px 0px",
				threshold: 0.01,
			},
		);
	}

	preloadCriticalResources(): void {
		this.preloadResource({
			url: "/fonts/ubuntu_mono/UbuntuSansMono-VariableFont_wght.ttf",
			type: "font",
			priority: "high",
		});

		this.preloadResource({
			url: "/fonts/montserrat_alter/MontserratAlternates-Regular.ttf",
			type: "font",
			priority: "high",
		});

		this.preloadResource({
			url: "/assets/images/avatar.webp",
			type: "image",
			priority: "high",
		});

		this.preloadResource({
			url: "/assets/images/banner.webp",
			type: "image",
			priority: "high",
		});

		const isDark = document.documentElement.classList.contains("dark");
		const themeResources = isDark
			? ["/favicon/favicon-dark-32.png", "/favicon/favicon-dark-192.png"]
			: ["/favicon/favicon-light-32.png", "/favicon/favicon-light-192.png"];

		themeResources.forEach((url) => {
			this.preloadResource({
				url,
				type: "image",
				priority: "medium",
			});
		});

		const katexFonts = [
			"/fonts/katex/KaTeX_Main-Regular.woff2",
			"/fonts/katex/KaTeX_Math-Italic.woff2",
			"/fonts/katex/KaTeX_Size1-Regular.woff2",
			"/fonts/katex/KaTeX_Size2-Regular.woff2",
			"/fonts/katex/KaTeX_Size3-Regular.woff2",
			"/fonts/katex/KaTeX_Size4-Regular.woff2",
		];

		katexFonts.forEach((url) => {
			this.preloadResource({
				url,
				type: "font",
				priority: "high",
				condition: () => {
					return document.querySelector(".katex-display") !== null;
				},
			});
		});
	}

	private preloadResource(config: ResourceConfig): void {
		if (this.loadedResources.has(config.url)) return;

		if (config.condition && !config.condition()) return;

		switch (config.type) {
			case "image":
				this.preloadImage(config.url, config.priority);
				break;
			case "script":
				this.preloadScript(config.url, config.priority);
				break;
			case "stylesheet":
				this.preloadStylesheet(config.url, config.priority);
				break;
			case "font":
				this.preloadFont(config.url, config.priority);
				break;
		}

		this.loadedResources.add(config.url);
	}

	private preloadImage(url: string, priority: "high" | "medium" | "low"): void {
		const img = new Image();
		img.src = url;
		img.setAttribute("fetchpriority", priority);
	}

	private preloadScript(
		url: string,
		priority: "high" | "medium" | "low",
	): void {
		const link = document.createElement("link");
		link.rel = "prefetch";
		link.href = url;
		link.as = "script";
		link.setAttribute("fetchpriority", priority);
		document.head.appendChild(link);
	}

	private preloadStylesheet(
		url: string,
		priority: "high" | "medium" | "low",
	): void {
		const link = document.createElement("link");
		link.rel = "prefetch";
		link.href = url;
		link.as = "style";
		link.setAttribute("fetchpriority", priority);
		document.head.appendChild(link);
	}

	private preloadFont(url: string, priority: "high" | "medium" | "low"): void {
		const link = document.createElement("link");
		link.rel = "preload";
		link.href = url;
		link.as = "font";
		link.type = "font/ttf";
		link.crossOrigin = "anonymous";
		link.setAttribute("fetchpriority", priority);
		document.head.appendChild(link);
	}
	private handleIntersection(entries: IntersectionObserverEntry[]): void {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				const element = entry.target;
				const config = this.loadingQueue.find(
					(item) => item.url === element.getAttribute("data-lazy-src"),
				);

				if (config) {
					this.preloadResource(config);
					this.observer.unobserve(element);

					this.loadingQueue = this.loadingQueue.filter(
						(item) => item !== config,
					);
				}
			}
		});
	}

	loadNonCriticalResources(): void {
		// Load non-critical resources immediately without artificial delays
		const additionalFonts = [
			"/fonts/ubuntu_mono/UbuntuSansMono-Italic-VariableFont_wght.ttf",
			"/fonts/montserrat_alter/MontserratAlternates-Bold.ttf",
			"/fonts/montserrat_alter/MontserratAlternates-Italic.ttf",
			"/fonts/montserrat_alter/MontserratAlternates-BoldItalic.ttf",
		];

		additionalFonts.forEach((url) => {
			this.preloadResource({
				url,
				type: "font",
				priority: "low",
			});
		});

		const additionalImages = [
			"/assets/images/figure.webp",
			"/assets/images/apache.svg",
			"/assets/images/google_dev.svg",
			"/assets/images/zju.svg",
			"/assets/images/zlh.svg",
		];

		additionalImages.forEach((url) => {
			this.preloadResource({
				url,
				type: "image",
				priority: "low",
			});
		});
	}
}

export const resourceManager: ResourceManager = new ResourceManager();

if (typeof window !== "undefined") {
	window.addEventListener("DOMContentLoaded", () => {
		resourceManager.preloadCriticalResources();
	});

	window.addEventListener("load", () => {
		resourceManager.loadNonCriticalResources();
	});
}
