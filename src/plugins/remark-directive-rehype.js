import { h } from "hastscript";
import { visit } from "unist-util-visit";

export function parseDirectiveNode() {
	return (tree, { _data }) => {
		visit(tree, (node) => {
			if (
				node.type === "containerDirective" ||
				node.type === "leafDirective" ||
				node.type === "textDirective"
			) {
				// biome-ignore lint/suspicious/noAssignInExpressions: <check later>
				const data = node.data || (node.data = {});
				node.attributes = node.attributes || {};

				// Only add attribute when label exists (avoid empty attributes)
				const hasLabel =
					node.children.length > 0 &&
					node.children[0].data &&
					node.children[0].data.directiveLabel;

				if (hasLabel) {
					node.attributes["has-directive-label"] = true;
				} else {
					// Remove empty attribute to reduce DOM bloat
					delete node.attributes["has-directive-label"];
				}

				const hast = h(node.name, node.attributes);
				hast.properties = undefined;
				hast.tagName = undefined;

				data.hName = hast.tagName;
				data.hProperties = hast.properties;

				// Clean up empty child nodes
				node.children = node.children.filter((child) => {
					if (child.type === "text") return child.value.trim() !== "";
					return true;
				});
			}
		});
	};
}
