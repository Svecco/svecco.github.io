// biome-ignore lint/suspicious/noShadowRestrictedNames: <toString from mdast-util-to-string>
import { toString } from "mdast-util-to-string";
import { visit } from "unist-util-visit";

/* Use the post's first paragraph as the excerpt with empty node cleanup */
export function remarkExcerpt() {
	return (tree, { data }) => {
		let excerpt = "";

		// Clean up empty nodes before extracting excerpt
		visit(tree, (node, index, parent) => {
			// Remove empty paragraphs
			if (node.type === "paragraph" && node.children.length === 0) {
				parent.children.splice(index, 1);
				return;
			}
			// Remove whitespace-only text nodes
			if (node.type === "text" && node.value.trim() === "") {
				parent.children.splice(index, 1);
				return;
			}
			// Remove consecutive break nodes
			if (
				node.type === "break" &&
				parent.children[index + 1]?.type === "break"
			) {
				parent.children.splice(index, 1);
			}
		});

		// Extract first paragraph as excerpt
		for (const node of tree.children) {
			if (node.type !== "paragraph") {
				continue;
			}
			excerpt = toString(node);
			break;
		}
		data.astro.frontmatter.excerpt = excerpt;
	};
}
