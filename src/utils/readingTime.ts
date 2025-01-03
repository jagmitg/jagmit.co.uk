export function readingTime(html: string) {
	if (!html) return '0 min read'
	const textOnly = html.replace(/<[^>]+>/g, '').trim()
	const wordCount = textOnly
		.split(/\s+/)
		.filter((word) => word.length > 0).length

	const minutes = Math.ceil(wordCount / 200)
	return `${minutes} min${minutes === 1 ? '' : 's'} read`
}
