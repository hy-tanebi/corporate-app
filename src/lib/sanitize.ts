import sanitize from "sanitize-html";

export function sanitizeHtml(dirty: string): string {
	return sanitize(dirty, {
		allowedTags: sanitize.defaults.allowedTags.concat([
			"img",
			"iframe",
			"h1",
			"h2",
			"h3",
		]),
		allowedAttributes: {
			...sanitize.defaults.allowedAttributes,
			img: ["src", "alt", "width", "height", "loading"],
			iframe: ["src", "width", "height", "frameborder", "allowfullscreen"],
		},
		allowedIframeHostnames: ["www.youtube.com", "player.vimeo.com"],
	});
}
