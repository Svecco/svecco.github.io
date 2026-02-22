<script lang="ts">
import { onDestroy, onMount } from "svelte";
import { scrollManager } from "../utils/scroll-manager";

// State variables
let progress = 0;
let progressBar: HTMLElement | null = null;

// Calculate scroll progress percentage
function calculateScrollProgress(): number {
	const scrollTop = Math.max(
		document.body.scrollTop,
		document.documentElement.scrollTop,
	);
	const scrollHeight =
		Math.max(
			document.body.scrollHeight,
			document.documentElement.scrollHeight,
		) - window.innerHeight;

	return scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
}

// Update progress bar width
function updateProgressBar(): void {
	progress = calculateScrollProgress();
	if (progressBar) {
		progressBar.style.width = `${progress}%`;
	}
}

// Scroll handler registered with ScrollManager
function handleScroll(_scrollTop: number): void {
	// We recalculate to get precise percentage
	updateProgressBar();
}

onMount(() => {
	// Register with scroll manager for efficient scroll handling
	scrollManager.registerCallback("scroll-progress", handleScroll, 5);

	// Initial update
	updateProgressBar();

	// Also listen to resize events to recalculate heights
	const handleResize = () => {
		requestAnimationFrame(updateProgressBar);
	};

	window.addEventListener("resize", handleResize, { passive: true });

	// Store cleanup function
	return () => {
		window.removeEventListener("resize", handleResize);
	};
});

onDestroy(() => {
	// Cleanup will be handled by the return function in onMount
});
</script>

<div class="fixed bottom-0 left-0 w-full h-0.5 z-50 pointer-events-none">
	<div 
		class="h-full bg-[var(--primary)] transition-all duration-150 ease-out"
		style="width: {progress}%"
		bind:this={progressBar}
	></div>
</div>

<style>
	/* Ensure the progress bar doesn't interfere with other elements */
	div {
		will-change: width;
		transform: translateZ(0); /* Hardware acceleration */
	}
</style>