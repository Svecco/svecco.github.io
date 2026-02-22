import { definePlugin } from "@expressive-code/core";
import type { Element } from "hast";

export function pluginLanguageBadge(): ReturnType<typeof definePlugin> {
	return definePlugin({
		name: "LanguageBadge",
		hooks: {
			postprocessRenderedBlock: (context) => {
				function traverse(node: Element) {
					if (node.type === "element" && node.tagName === "pre") {
						processCodeBlock(node);
						return;
					}
					if (node.children) {
						for (const child of node.children) {
							if (child.type === "element") traverse(child);
						}
					}
				}

				function processCodeBlock(node: Element) {
					// Get the language from the node's properties or from context
					const language = (node.properties?.["data-language"] as string) || "";

					// Skip if no language or it's plain text
					if (!language || language === "text" || language === "plaintext") {
						return;
					}

					// Create language badge element
					const languageBadge = {
						type: "element" as const,
						tagName: "div",
						properties: {
							className: ["language-badge"],
						},
						children: [
							{
								type: "text" as const,
								value: language,
							},
						],
					} as Element;

					// Insert the badge at the beginning of the pre element
					if (!node.children) {
						node.children = [];
					}

					// Find the first code element and insert badge before it
					const firstCodeIndex = node.children.findIndex(
						(child) => child.type === "element" && child.tagName === "code",
					);

					if (firstCodeIndex >= 0) {
						node.children.splice(firstCodeIndex, 0, languageBadge);
					} else {
						node.children.unshift(languageBadge);
					}
				}

				traverse(context.renderData.blockAst);
			},
		},
		baseStyles: () => `
			.language-badge {
				position: absolute;
				top: 0.5rem;
				right: 0.5rem;
				background: oklch(0.3 0.02 var(--hue));
				color: white;
				padding: 0.25rem 0.5rem;
				border-radius: 0.25rem;
				font-size: 0.75rem;
				font-family: 'Ubuntu Sans Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
				text-transform: uppercase;
				letter-spacing: 0.05em;
				z-index: 10;
				pointer-events: none;
				transition: all 0.2s ease;
			}
			
			.frame:hover .language-badge {
				opacity: 0.7;
			}
		`,
	});
}
