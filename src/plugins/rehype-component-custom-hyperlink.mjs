/// <reference types="mdast" />
import { h } from "hastscript";

/**
 * Hyperlink Card Component with manual avatar and description
 *
 * @param {Object} properties
 * @param {string} properties.href
 * @param {string} properties.title
 * @param {string} properties.avatar
 * @param {string} properties.description
 * @param {import('mdast').RootContent[]} children
 * @returns {Element}
 */

export function HyperlinkCardComponent(properties, children) {
	if (Array.isArray(children) && children.length !== 0) {
		return h("div", { class: "hidden" }, [
			'Invalid directive. ("hyperlink" directive must be leaf type)',
		]);
	}

	const href = properties.href || "#";
	const title = properties.title || "Title";
	const avatar = properties.avatar || "";
	const description = properties.description || "";

	const cardUuid = `HC${Math.random().toString(36).slice(-6)}`;

	const nAvatar = h(`div#${cardUuid}-avatar`, {
		class: "hc-avatar",
		style: `background-image:url('${avatar}');`,
	});

	const nTitle = h("div", { class: "hc-title" }, title);
	const nDescription = h("div", { class: "hc-description" }, description);

	const nTitlebar = h("div", { class: "hc-titlebar" }, [nAvatar, nTitle]);

	return h(
		`a#${cardUuid}-card`,
		{
			class: "card-hyperlink no-styling",
			href,
			target: "_blank",
		},
		[nTitlebar, nDescription],
	);
}
