import { debounce } from "@utils/performance-utils.ts";

debounce(
	((element: HTMLElement, className: string, add: boolean) => {
		if (add) {
			element.classList.add(className);
		} else {
			element.classList.remove(className);
		}
	}) as unknown as (...args: unknown[]) => unknown,
	50,
);
