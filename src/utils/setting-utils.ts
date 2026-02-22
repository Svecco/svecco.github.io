/**
 * Simplified Setting Utilities
 * Removed complex debounce wrapper for better native performance
 */

import {
	AUTO_MODE,
	DARK_MODE,
	DEFAULT_THEME,
	LIGHT_MODE,
} from "@constants/constants.ts";
import { expressiveCodeConfig } from "@/config";
import type { LIGHT_DARK_MODE } from "@/types/config";

// Simple direct DOM operations without debounce
function updateClass(
	element: HTMLElement,
	className: string,
	add: boolean,
): void {
	if (add) {
		element.classList.add(className);
	} else {
		element.classList.remove(className);
	}
}

export function getDefaultHue(): number {
	const fallback = "250";
	const configCarrier = document.getElementById("config-carrier");
	return Number.parseInt(configCarrier?.dataset.hue || fallback, 10);
}

export function getHue(): number {
	const stored = localStorage.getItem("hue");
	return stored ? Number.parseInt(stored, 10) : getDefaultHue();
}

export function setHue(hue: number): void {
	localStorage.setItem("hue", String(hue));
	const r = document.querySelector(":root") as HTMLElement;
	if (!r) {
		return;
	}
	r.style.setProperty("--hue", String(hue));
}

export function applyThemeToDocument(theme: LIGHT_DARK_MODE): void {
	const docElement = document.documentElement;

	switch (theme) {
		case LIGHT_MODE:
			updateClass(docElement, "dark", false);
			break;
		case DARK_MODE:
			updateClass(docElement, "dark", true);
			break;
		case AUTO_MODE: {
			const prefersDark = window.matchMedia(
				"(prefers-color-scheme: dark)",
			).matches;
			updateClass(docElement, "dark", prefersDark);
			break;
		}
	}

	// Set the theme for Expressive Code
	docElement.setAttribute("data-theme", expressiveCodeConfig.theme);
}

export function setTheme(theme: LIGHT_DARK_MODE): void {
	localStorage.setItem("theme", theme);
	applyThemeToDocument(theme);
}

export function getStoredTheme(): LIGHT_DARK_MODE {
	return (localStorage.getItem("theme") as LIGHT_DARK_MODE) || DEFAULT_THEME;
}
